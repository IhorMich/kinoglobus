/* Personal calendar subscriptions shared by film, series and episode cards. */
(() => {
  const storageKey = "kg.releaseFollows.v1";
  const changeEvent = "kg:release-follows-change";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${
    {calendar:"M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
      back:"m14 6-6 6 6 6",check:"m5 12 4 4L19 6"}[name]
  }"/></svg>`;
  const titleFor = {movie:"Следить за премьерой",series:"Следить за сериалом",episode:"Следить за серией"};
  const day = value => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : "";
  const today = () => {
    const now = new Date();
    return [now.getFullYear(), now.getMonth()+1, now.getDate()].map(v => String(v).padStart(2,"0")).join("-");
  };
  const dateText = value => new Date(value+"T12:00:00").toLocaleDateString(interfaceLanguage,{day:"numeric",month:"long"});
  let lastRefresh = 0, toast, toastTimer;

  function subscriptions() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch { return {}; }
  }

  function save(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    document.dispatchEvent(new Event(changeEvent));
  }

  function episodeEntry(episode, season) {
    if (!episode || !Number.isInteger(season) || !Number.isInteger(episode.episode_number)) return null;
    return {season, number:episode.episode_number, title:episode.name || "", date:day(episode.air_date)};
  }

  function seriesDates(series) {
    const next = episodeEntry(series.next_episode_to_air, series.next_episode_to_air?.season_number);
    const rows = (series._seriesEpisodes || []).map(episode => episodeEntry(episode, series._seriesSeason)).filter(Boolean);
    if (next) rows.push(next);
    return [...new Map(rows.map(item => [`${item.season}:${item.number}`,item])).values()]
      .filter(item => item.date >= today());
  }

  function entryFor(film, episode, season) {
    const id = Number(film?.id);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    const series = window.KGSeries?.isSeriesId(id);
    if (episode && !series) return null;
    const rawId = series ? window.KGSeries.rawId(id) : id;
    const title = film.title || film.name || "";
    if (episode) {
      const details = episodeEntry(episode, season);
      return details && {key:`episode:${rawId}:${season}:${details.number}`,kind:"episode",id:rawId,title,
        episodeTitle:details.title,season,number:details.number,date:details.date};
    }
    if (series) return {key:`series:${rawId}`,kind:"series",id:rawId,title,dates:seriesDates(film),ended:["Ended","Canceled"].includes(film.status)};
    return {key:`movie:${id}`,kind:"movie",id,title,date:day(film.release || film.release_date)};
  }

  function buttonContent(button, kind, active) {
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-haspopup", active ? "dialog" : "false");
    button.innerHTML = icon(active ? "check" : "calendar") + '<span></span>';
    button.querySelector("span").textContent = uiText(active ? "Отслеживаю" : titleFor[kind]);
  }

  function button(film, episode, season) {
    const item = entryFor(film, episode, season);
    if (!item) return "";
    const active = !!subscriptions()[item.key];
    if (item.kind === "movie" && item.date < today() && !active) return "";
    const text = uiText(active ? "Отслеживаю" : titleFor[item.kind]);
    return `<button type="button" class="kg-release-follow" data-kg-follow="${item.key}"
      data-follow-item="${esc(JSON.stringify(item))}" aria-pressed="${active}" aria-haspopup="${active?"dialog":"false"}">${icon(active?"check":"calendar")}<span>${esc(text)}</span></button>`;
  }

  function syncButtons() {
    const items = subscriptions();
    document.querySelectorAll("[data-kg-follow]").forEach(button => {
      const active = !!items[button.dataset.kgFollow];
      if (button.getAttribute("aria-pressed") !== String(active)) buttonContent(button, button.dataset.kgFollow.split(":")[0], active);
    });
  }

  function remember(item) {
    if (!item) return;
    const items = subscriptions(), previous = items[item.key];
    if (!previous || (item.followedAt && previous.followedAt !== item.followedAt)) return;
    if (item.kind === "series") {
      const {seasonSnapshot, ...data} = item;
      const earlier = (previous.dates || []).filter(e => e.date >= today() && e.season !== seasonSnapshot);
      item = {...data, dates:[...new Map([...earlier,...data.dates].map(e => [`${e.season}:${e.number}`,e])).values()]};
      item.dates.sort((a,b) => a.date.localeCompare(b.date));
    }
    const updated = {...previous,...item};
    if (JSON.stringify(updated) !== JSON.stringify(previous)) {
      items[item.key] = updated;
      try { save(items); } catch {}
    }
  }

  function observe(film, episode, season) {
    const item = entryFor(film,episode,season);
    if (item?.kind === "series" && film._seriesEpisodeStatus === "ready") item.seasonSnapshot = film._seriesSeason;
    remember(item);
  }

  function upcoming() {
    const dates = Object.values(subscriptions()).flatMap(item => item.kind === "series"
      ? (item.dates || []).map(episode => ({...episode,title:item.title,episodeTitle:episode.title}))
      : [item]);
    const next = dates.filter(item => item.date >= today()).sort((a,b) => a.date.localeCompare(b.date))[0];
    return next ? `${dateText(next.date)} · ${next.title}${next.episodeTitle ? " · "+next.episodeTitle : next.number ? " · "+uiText("Эпизод {episode}",{episode:next.number}) : ""}` : "";
  }

  async function refresh() {
    if (!apiKey || !window.KGSeries || Date.now()-lastRefresh < 3600000) return;
    const pending = Object.values(subscriptions());
    if (!pending.length) return;
    lastRefresh = Date.now();
    await Promise.all(Array.from({length:Math.min(pending.length,3)}, async () => {
      for (let item; (item = pending.shift());) {
        try {
          if (item.kind === "movie") {
            const film = await requestTmdb(`movie/${item.id}`,{language:filmLocale});
            remember({...item,date:day(film.release_date)});
          } else if (item.kind === "episode") {
            const episode = await requestTmdb(`tv/${item.id}/season/${item.season}/episode/${item.number}`,{language:filmLocale});
            remember({...item,episodeTitle:episode.name || item.episodeTitle,date:day(episode.air_date)});
          } else {
            const series = await requestTmdb(`tv/${item.id}`,{language:filmLocale});
            const next = series.next_episode_to_air;
            if (next?.season_number >= 0) {
              const season = await requestTmdb(`tv/${item.id}/season/${next.season_number}`,{language:filmLocale}).catch(()=>null);
              series._seriesSeason = next.season_number;
              series._seriesEpisodes = season?.episodes;
            }
            remember({...item,dates:seriesDates(series),ended:["Ended","Canceled"].includes(series.status),
              seasonSnapshot:series._seriesEpisodes?series._seriesSeason:undefined});
          }
        } catch {}
      }
    }));
  }

  function message(text, button, undo) {
    clearTimeout(toastTimer);
    toast?.remove();
    toast = document.createElement("div");
    toast.className = "kg-release-toast";
    const status = document.createElement("span");
    status.setAttribute("role","status");
    toast.append(status);
    const notification = toast;
    if (undo) {
      const action = document.createElement("button");
      action.type = "button";
      action.textContent = uiText("Отменить");
      action.addEventListener("click",() => { notification.remove(); undo(); });
      toast.append(action);
    }
    (button.closest("dialog[open]") || document.body).append(toast);
    status.textContent = uiText(text);
    toastTimer = setTimeout(() => notification.remove(),6000);
  }

  function remove(item) {
    const items = subscriptions();
    if (items[item.key]?.followedAt !== item.followedAt) return;
    delete items[item.key];
    save(items);
  }

  function openCalendar() {
    if (document.querySelector("#kg-personal-calendar[open]")) return;
    const calendar = document.createElement("dialog");
    calendar.id = "kg-personal-calendar";
    calendar.className = "kg-film-dialog";
    calendar.setAttribute("aria-labelledby","kg-personal-calendar-title");
    calendar.innerHTML = `<header><button type="button" autofocus aria-label="${esc(uiText("Назад"))}">${icon("back")}</button>
      <h1 id="kg-personal-calendar-title">${esc(uiText("Мой календарь"))}</h1></header>`;
    calendar.querySelector("button").addEventListener("click",() => calendar.close());
    calendar.addEventListener("close",() => calendar.remove(),{once:true});
    document.body.append(calendar);
    calendar.showModal();
  }

  function manage(item, opener) {
    const sheet = document.createElement("dialog");
    sheet.className = "kg-release-sheet";
    sheet.setAttribute("aria-labelledby","kg-release-sheet-title");
    const heading = item.kind === "episode"
      ? `${item.title} · ${item.episodeTitle || uiText("Эпизод {episode}",{episode:item.number})}` : item.title;
    const nextDate = item.kind === "series"
      ? (item.dates || []).map(event => event.date).filter(date => date >= today()).sort()[0] : item.date;
    const dateStatus = nextDate ? dateText(nextDate) : uiText(item.ended ? "Сериал завершён" : "Ждём дату");
    sheet.innerHTML = `<section><h2 id="kg-release-sheet-title">${esc(heading)}</h2><p>${esc(dateStatus)}</p>
      <button type="button" data-follow-calendar autofocus>${icon("calendar")}${esc(uiText("Перейти в календарь"))}</button>
      <button type="button" data-follow-remove>${esc(uiText("Перестать следить"))}</button>
      <button type="button" data-follow-dismiss>${esc(uiText("Закрыть"))}</button></section>`;
    sheet.addEventListener("click",event => {
      const button = event.target.closest("button");
      if (event.target === sheet || button?.hasAttribute("data-follow-dismiss")) sheet.close();
      if (button?.hasAttribute("data-follow-calendar")) { sheet.close(); openCalendar(); }
      if (button?.hasAttribute("data-follow-remove")) {
        sheet.close();
        try { remove(item); }
        catch { message("Не удалось сохранить подписку",opener); }
      }
    });
    sheet.addEventListener("close",() => sheet.remove(),{once:true});
    document.body.append(sheet);
    sheet.showModal();
  }

  document.addEventListener("click",event => {
    const opener = event.target.closest("[data-kg-follow]");
    if (!opener) return;
    const items = subscriptions(), key = opener.dataset.kgFollow;
    if (items[key]) { manage(items[key],opener); return; }
    try {
      const item = {...JSON.parse(opener.dataset.followItem),followedAt:Date.now()};
      items[key] = item;
      save(items);
      message("Добавлено в календарь",opener,() => {
        try { remove(item); } catch { message("Не удалось сохранить подписку",opener); }
      });
    } catch { message("Не удалось сохранить подписку",opener); }
  });
  document.addEventListener(changeEvent,syncButtons);
  window.addEventListener("storage",event => {
    if (event.key === storageKey || event.key === null) document.dispatchEvent(new Event(changeEvent));
  });
  window.KGReleaseFollow = {button,observe,openCalendar,upcoming,refresh};
})();
