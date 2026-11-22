/* Personal calendar subscriptions shared by film, series and episode cards. */
(() => {
  const storageKey = "kg.releaseFollows.v1";
  const changeEvent = "kg:release-follows-change";
  const alerts = window.KGReleaseAlerts;
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
    alerts.synchronize(Object.values(items)).catch(()=>{});
  }

  function episodeEntry(episode, season) {
    if (!episode || !Number.isInteger(season) || !Number.isInteger(episode.episode_number)) return null;
    return {season, number:episode.episode_number, title:episode.name || "", date:day(episode.air_date),
      still:episode.still_path || "", runtime:episode.runtime || 0};
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
    const art = {genres:(film.genres || []).map(g=>typeof g === "string" ? g : g?.name).filter(Boolean).slice(0,2),
      original:film.originalTitle || film.original_title || "",poster:film.posterPath || film.poster_path || "",backdrop:film.backdrop_path || "",
      service:film.networks?.[0]?.name || ""};
    if (episode) {
      const details = episodeEntry(episode, season);
      return details && {key:`episode:${rawId}:${season}:${details.number}`,kind:"episode",id:rawId,title,...art,
        episodeTitle:details.title,season,number:details.number,date:details.date,still:details.still,runtime:details.runtime};
    }
    if (series) return {key:`series:${rawId}`,kind:"series",id:rawId,title,...art,dates:seriesDates(film),season:film.next_episode_to_air?.season_number || film._seriesSeason,episodeCount:film.number_of_episodes,ended:["Ended","Canceled"].includes(film.status)};
    return {key:`movie:${id}`,kind:"movie",id,title,...art,date:day(film.release || film.release_date)};
  }

  function buttonContent(button, active) {
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-haspopup", "dialog");
    const text = uiText(active ? "Отслеживаю" : button.dataset.followLabel);
    const compact = button.hasAttribute("data-follow-compact");
    button.innerHTML = icon(active ? "check" : "calendar") + buttonLabel(text,compact);
    if (compact) button.title = text;
  }

  function buttonLabel(text,compact) {
    return `<span${compact ? ' class="sr-only"' : ""}>${esc(text)}</span>`;
  }

  function button(film, episode, season, iconOnly=false) {
    const item = entryFor(film, episode, season);
    if (!item) return "";
    const active = !!subscriptions()[item.key];
    const initialLabel = item.kind === "movie" && item.date < today() ? "Следить за фильмом" : titleFor[item.kind];
    const text = uiText(active ? "Отслеживаю" : initialLabel);
    const compact = iconOnly || item.kind === "series";
    return `<button type="button" class="kg-release-follow" data-kg-follow="${item.key}"
      data-follow-item="${esc(JSON.stringify(item))}" data-follow-label="${esc(initialLabel)}" aria-pressed="${active}" aria-haspopup="dialog"${compact ? ` title="${esc(text)}" data-follow-compact` : ""}>${icon(active?"check":"calendar")}${buttonLabel(text,compact)}</button>`;
  }

  function syncButtons() {
    const items = subscriptions();
    document.querySelectorAll("[data-kg-follow]").forEach(button => {
      const active = !!items[button.dataset.kgFollow];
      if (button.getAttribute("aria-pressed") !== String(active)) buttonContent(button, active);
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
    const updated = {...previous,...item,settings:previous.settings,trailerSince:previous.trailerSince,trailer:previous.trailer};
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
    const dates = calendarItems().flatMap(item => item.kind === "series"
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
            remember({...item,date:day(film.release_date),poster:film.poster_path || item.poster,backdrop:film.backdrop_path || item.backdrop});
          } else if (item.kind === "episode") {
            const episode = await requestTmdb(`tv/${item.id}/season/${item.season}/episode/${item.number}`,{language:filmLocale});
            remember({...item,episodeTitle:episode.name || item.episodeTitle,date:day(episode.air_date),still:episode.still_path || item.still,runtime:episode.runtime || item.runtime});
          } else {
            const series = await requestTmdb(`tv/${item.id}`,{language:filmLocale});
            const next = series.next_episode_to_air;
            if (next?.season_number >= 0) {
              const season = await requestTmdb(`tv/${item.id}/season/${next.season_number}`,{language:filmLocale}).catch(()=>null);
              series._seriesSeason = next.season_number;
              series._seriesEpisodes = season?.episodes;
            }
            remember({...item,dates:seriesDates(series),poster:series.poster_path || item.poster,backdrop:series.backdrop_path || item.backdrop,service:series.networks?.[0]?.name || item.service,ended:["Ended","Canceled"].includes(series.status),
              seasonSnapshot:series._seriesEpisodes?series._seriesSeason:undefined});
          }
        } catch {}
        if(item.settings?.trailers) await checkTrailer(item.key);
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

  function openCalendar(date) {
    window.KGPersonalCalendar.open(date);
  }

  function calendarItems() {
    return Object.values(subscriptions()).filter(item=>alerts.settings(item).includeCalendar && alerts.settings(item).releases);
  }

  const current = key => subscriptions()[key];
  const filmFor = item => item.kind === "movie"
    ? {id:item.id,title:item.title,adult:false,poster_path:item.poster,release_date:item.date}
    : window.KGSeries.normalize({id:item.id,name:item.title,adult:false,poster_path:item.poster,backdrop_path:item.backdrop});

  async function applySettings(item, options, bookmark) {
    const items = subscriptions(), previous = items[item.key];
    const now = Date.now();
    const updated = {...item,...previous,settings:options,followedAt:previous?.followedAt || now,
      trailerSince:options.trailers ? (previous?.settings?.trailers ? previous.trailerSince || now : now) : null,
      trailer:options.trailers && previous?.settings?.trailers ? previous.trailer : null};
    items[item.key] = updated;
    save(items);
    const film = filmFor(updated);
    let bookmarkFailed = false, notificationsDisabled = false;
    if (bookmark && !window.kgIsBookmarked(film.id)) {
      try { bookmarkFailed = !await window.kgToggleBookmark(film.id,film); } catch { bookmarkFailed = true; }
    }
    if (alerts.native() && (options.trailers || alerts.events(updated).some(event=>event.at > now))) {
      try {
        const permission = await alerts.native().enable();
        notificationsDisabled = !permission?.enabled;
        await alerts.synchronize(Object.values(subscriptions()),true);
      } catch { notificationsDisabled = true; }
    }
    return {previous,updated,bookmarkFailed,notificationsDisabled};
  }

  async function checkTrailer(key) {
    const item = current(key);
    if (!item?.settings?.trailers) return null;
    try {
      const video = await alerts.checkTrailer(item);
      const items = subscriptions(), latest = items[key];
      if (!latest?.settings?.trailers || latest.trailerSince !== item.trailerSince) return null;
      if (!video || latest.trailer?.id === video.id) return latest.trailer;
      items[key] = {...latest,trailer:video};
      save(items);
      await alerts.native()?.trailer({id:video.id,title:item.title,body:uiText("Новый трейлер")}).catch(()=>{});
      return video;
    } catch { return item.trailer; }
  }

  document.addEventListener("click",async event => {
    const opener = event.target.closest("[data-kg-follow]");
    if (!opener) return;
    try {
      const draft = JSON.parse(opener.dataset.followItem);
      const item = current(draft.key);
      if (item && opener.hasAttribute("data-follow-compact")) {
        const confirmed = await window.KGConfirmRemoval({
          kind:"follow",title:item.title,
          onSettings:() => {
            const latest = current(item.key);
            window.KGReleaseSettings.open(latest || draft,opener,!!latest);
          }
        });
        if (confirmed) remove(item);
        return;
      }
      window.KGReleaseSettings.open(item || draft,opener,!!item);
    } catch { message("Не удалось сохранить подписку",opener); }
  });
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
  document.addEventListener("DOMContentLoaded",()=>{
    alerts.synchronize(Object.values(subscriptions())).catch(()=>{});
    if (!document.hidden) refresh();
  },{once:true});
  document.addEventListener(changeEvent,syncButtons);
  window.addEventListener("storage",event => {
    if (event.key === storageKey || event.key === null) document.dispatchEvent(new Event(changeEvent));
  });
  window.KGReleaseFollow = {button,compactButton:film=>button(film,null,null,true),observe,openCalendar,upcoming,refresh,calendarItems,applySettings,filmFor,remove,message,checkTrailer};
})();
