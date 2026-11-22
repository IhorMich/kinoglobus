/* Personal release calendar. The subscription store remains the source for tracked releases. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
  const label = (key, params) => esc(uiText(key,params));
  const paths = {
    back:"M20 12H4m7-7-7 7 7 7", previous:"m15 18-6-6 6-6", next:"m9 18 6-6-6-6",
    up:"m6 15 6-6 6 6", down:"m6 9 6 6 6-6", calendar:"M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
    movie:"M3 5h18v14H3zM3 9h18M7 5l3 4m4-4 3 4"
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const key = date => [date.getFullYear(),date.getMonth()+1,date.getDate()]
    .map(v => String(v).padStart(2,"0")).join("-");
  const fromKey = value => new Date(value+"T12:00:00");
  const shift = (date,days) => new Date(date.getFullYear(),date.getMonth(),date.getDate()+days,12);
  const monday = date => shift(date,-(date.getDay()+6)%7);
  const monthStart = date => new Date(date.getFullYear(),date.getMonth(),1,12);
  const monthEnd = date => new Date(date.getFullYear(),date.getMonth()+1,0,12);
  const format = (date,options) => date.toLocaleDateString(interfaceLanguage,options);
  const image = (path,size) => /^\/[\w.-]+$/.test(path || "") ? `https://image.tmdb.org/t/p/${size}${path}` : "";
  const episodeKey = (id,season,number) => `episode:${id}:${season}:${number}`;
  let dialog, selected, scope, expanded, filter, releaseMap, listing;
  const pages = new Map();

  function trackedRows() {
    const items = window.KGReleaseFollow.calendarItems();
    const found = new Map();
    for (const item of items) {
      if (item.kind === "series") {
        for (const e of item.dates || []) {
          found.set(episodeKey(item.id,e.season,e.number),{...item,kind:"episode",date:e.date,
            season:e.season,number:e.number,episodeTitle:e.title,still:e.still,runtime:e.runtime});
        }
      }
    }
    for (const item of items) if (item.kind !== "series" && item.date) {
      found.set(item.key,{...found.get(item.key),...item});
    }
    const waiting = items.filter(item => item.kind === "series" ? !item.ended && !(item.dates || []).some(e => e.date >= key(new Date())) : !item.date);
    return {rows:[...found.values()],waiting};
  }

  const groupKey = row => row.service || (row.kind === "movie" ? "movie" : "episode");
  const groupTitle = group => group === "movie" ? uiText("Фильмы") : group === "episode" ? uiText("Сериалы") : group;
  function rowsForDate(rows,date) {
    return rows.filter(row => row.date === date).sort((a,b) => a.title.localeCompare(b.title));
  }
  function groupDate(date) {
    const today = key(new Date()), tomorrow = key(shift(new Date(),1));
    const readable = format(fromKey(date),{day:"numeric",month:"long"});
    if (date === today) return uiText("Сегодня, {date}",{date:readable});
    if (date === tomorrow) return uiText("Завтра, {date}",{date:readable});
    return format(fromKey(date),{weekday:"long",day:"numeric",month:"long"});
  }
  function showFor(row) {
    return row.show || window.KGSeries.normalize({id:row.id,name:row.title,poster_path:row.poster,backdrop_path:row.backdrop,adult:false});
  }
  function episodeFor(row) {
    return row.episode || {name:row.episodeTitle,air_date:row.date,still_path:row.still,runtime:row.runtime,
      season_number:row.season,episode_number:row.number};
  }

  function releaseCard(row,primary=false) {
    const title = row.title || uiText("Без названия");
    const group = groupTitle(groupKey(row));
    const meta = row.kind === "episode" ? uiText("Сезон {season} · Эпизод {episode}",{season:row.season,episode:row.number}) : uiText("Премьера фильма");
    const still = image(row.still,"w300") || image(row.backdrop,"w780") || image(row.poster,"w342");
    const src = primary ? still : image(row.poster,"w185") || still;
    const index = releaseMap.push(row)-1;
    const art = src ? `<img src="${esc(src)}" alt="" decoding="async">` : icon("movie");
    const card = `<button type="button" class="kg-mc-release-open" data-mc-release="${index}">
      <span class="kg-mc-art">${art}</span>
      <span class="kg-mc-release-copy"><small>${esc(group)}</small><strong>${esc(title)}</strong>
        <span>${esc(meta)}${row.episodeTitle ? " · "+esc(row.episodeTitle) : ""}</span></span>
    </button>`;
    return `<article class="kg-mc-release${primary?" kg-mc-feature":""}">${card}
      ${primary ? `<footer><span>${icon("calendar")}${esc(format(fromKey(row.date),{day:"numeric",month:"long"}))}</span>
      ${row.runtime ? `<span>${label("{minutes} мин",{minutes:row.runtime})}</span>` : ""}
      ${row.kind === "episode" && row.date >= key(new Date()) ?
        `<button type="button" data-mc-reminder="${index}">${icon("bell")}${label("Напомнить")}</button>` : ""}</footer>` : ""}
    </article>`;
  }

  function dateGroup(date,rows,featured=false) {
    return `<section class="kg-mc-day"><header><h2>${esc(groupDate(date))}</h2>
      <span>${label("Релизы · {count}",{count:rows.length})}</span></header>
      ${rows.length ? rows.map((row,i)=>releaseCard(row,featured && i === 0)).join("") :
        `<p class="kg-mc-empty">${label("Релизов на эту дату нет.")}</p>`}</section>`;
  }

  function render() {
    if (!dialog?.open) return;
    const scroller = dialog.querySelector("main"), top = scroller.scrollTop;
    const focus = document.activeElement?.dataset.mcFocus;
    const chipScroll = scroller.querySelector(".kg-mc-chips")?.scrollLeft || 0;
    const date = fromKey(selected), start = monthStart(date), end = monthEnd(date);
    const first = expanded ? monday(start) : monday(date);
    const count = expanded ? Math.ceil(((end.getDate() + (start.getDay()+6)%7))/7)*7 : 7;
    const tracked = trackedRows(), active = scope === "tracked";
    const rows = active ? tracked.rows : listing?.rows || [];
    const groups = [...new Set(rows.filter(row=>row.date >= key(start) && row.date <= key(end)).map(groupKey))];
    if (filter && !groups.includes(filter)) filter = "";
    const shown = filter ? rows.filter(row=>groupKey(row) === filter) : rows;
    const dates = new Map();
    for (const row of shown) {
      if (!dates.has(row.date)) dates.set(row.date,new Set());
      dates.get(row.date).add(row.kind);
    }
    releaseMap = [];
    const next = [...dates.keys()].filter(value=>value > selected && value <= key(end)).sort().at(0);
    scroller.innerHTML = `<div class="kg-mc-switch" role="group" aria-label="${label("Расписание релизов")}">
      <button type="button" data-mc-scope="tracked" data-mc-focus="tracked" aria-pressed="${active}">${label("Мои отслеживаемые")}<small>${window.KGReleaseFollow.calendarItems().length}</small></button>
      <button type="button" data-mc-scope="all" data-mc-focus="all" aria-pressed="${!active}">${label("Все премьеры")}</button>
    </div>
    <section class="kg-mc-grid-panel" aria-label="${label("Календарь")}">
      <div class="kg-mc-grid-head"><h2>${esc(format(date,{month:"long",year:"numeric"}))}</h2><span>${label(expanded?"Месяц":"Неделя")}</span>
        <div><button type="button" data-mc-move="-1" data-mc-focus="previous" aria-label="${label(expanded?"Предыдущий месяц":"Предыдущая неделя")}">${icon("previous")}</button>
        <button type="button" data-mc-move="1" data-mc-focus="next" aria-label="${label(expanded?"Следующий месяц":"Следующая неделя")}">${icon("next")}</button></div></div>
      <div class="kg-mc-grid">
        ${Array.from({length:7},(_,i)=>`<span class="kg-mc-weekday">${esc(format(shift(first,i),{weekday:"short"}))}</span>`).join("")}
        ${Array.from({length:count},(_,i)=>{
          const day = shift(first,i), value = key(day);
          return `<button type="button" data-mc-date="${value}" data-mc-focus="d${value}" aria-pressed="${value === selected}"
            aria-label="${esc(format(day,{dateStyle:"full"}))}" ${value === key(new Date()) ? 'aria-current="date"' : ""}
            class="${day.getMonth() === date.getMonth() ? "" : "is-other-month"}">${day.getDate()}<span class="kg-mc-dots" aria-hidden="true">${[...(dates.get(value) || [])].map(kind=>`<i class="is-${kind}"></i>`).join("")}</span></button>`;
        }).join("")}
      </div>
      <button type="button" class="kg-mc-expand" data-mc-expand data-mc-focus="expand" aria-expanded="${expanded}">
        ${icon(expanded?"up":"down")}${label(expanded?"Свернуть в 1 неделю":"Показать месяц")}</button>
    </section>
    <div class="kg-mc-chips" role="group" aria-label="${label("Фильтры")}">
      ${["",...groups].map((group,index)=>`<button type="button" data-mc-filter="${esc(group)}" data-mc-focus="g${index}" aria-pressed="${group === filter}">${esc(group ? groupTitle(group) : uiText("Все"))}</button>`).join("")}
    </div>
    ${!active && listing?.loading ? `<p class="kg-mc-empty" role="status">${label("Загружаем…")}</p>` : ""}
    ${!active && listing?.error ? `<p class="kg-mc-empty" role="status">${label(listing.error)}${apiKey ? ` <button type="button" data-mc-more>${label("Повторить")}</button>` : ""}</p>` : ""}
    ${dateGroup(selected,rowsForDate(shown,selected),true)}
    ${next ? dateGroup(next,rowsForDate(shown,next)) : ""}
    ${!active && listing?.more && !listing.loading ? `<button type="button" class="kg-mc-expand" data-mc-more>${label("Показать ещё")}</button>` : ""}
    ${active && tracked.waiting.length ? `<section class="kg-mc-day"><header><h2>${label("Ждём дату")}</h2></header>
      ${tracked.waiting.map(row=>`<button type="button" class="kg-mc-wait" data-mc-release="${releaseMap.push(row)-1}">${icon("calendar")}<span>${esc(row.title)}${row.episodeTitle?" · "+esc(row.episodeTitle):""}</span>${icon("next")}</button>`).join("")}</section>` : ""}`;
    scroller.scrollTop = top;
    scroller.querySelector(".kg-mc-chips").scrollLeft = chipScroll;
    if (focus) scroller.querySelector(`[data-mc-focus="${focus}"]`)?.focus({preventScroll:true});
  }

  async function loadMore(retry=false) {
    const cacheKey = `${apiKey}:${filmLocale}:${selected.slice(0,7)}`;
    if (!pages.has(cacheKey)) pages.set(cacheKey,{rows:[],movie:1,tv:1,more:true});
    listing = pages.get(cacheKey);
    const current = listing;
    if (!apiKey) { current.error = "Добавьте ключ TMDB, чтобы загрузить премьеры."; render(); return; }
    if (current.loading || !current.more || (current.rows.length && !retry)) { render(); return; }
    const date = fromKey(selected), start = key(monthStart(date)), end = key(monthEnd(date));
    current.loading = true;
    current.error = "";
    render();
    const [movies,series] = await Promise.allSettled([
      current.movie ? api({"primary_release_date.gte":start,"primary_release_date.lte":end,sort_by:"popularity.desc",page:current.movie}) : null,
      current.tv ? window.KGSeriesCalendar.releases(start,end,current.tv) : null
    ]);
    const merged = new Map(current.rows.map(row=>[row.key,row]));
    if (movies.status === "fulfilled" && movies.value) {
      for (const film of movies.value.results.filter(movieCatalog.allows)) {
        if (!film.release_date || film.release_date < start || film.release_date > end) continue;
        merged.set(`movie:${film.id}`,{key:`movie:${film.id}`,kind:"movie",id:film.id,title:film.title,
          date:film.release_date,poster:film.poster_path,backdrop:film.backdrop_path,film});
      }
      current.movie = current.movie < Math.min(500,movies.value.total_pages || 0) ? current.movie+1 : 0;
    }
    if (series.status === "fulfilled" && series.value) {
      for (const {show,episode,service} of series.value.items) {
        const id = window.KGSeries.rawId(show.id);
        const uid = episodeKey(id,episode.season_number,episode.episode_number);
        merged.set(uid,{key:uid,kind:"episode",id,title:show.title,date:episode.air_date,poster:show.poster_path,
          backdrop:show.backdrop_path,episodeTitle:episode.name,still:episode.still_path,runtime:episode.runtime,service,
          season:episode.season_number,number:episode.episode_number,show,episode});
      }
      current.tv = series.value.more ? current.tv+1 : 0;
    }
    if (movies.status === "rejected" || series.status === "rejected") current.error = "Не удалось загрузить часть премьер.";
    current.rows = [...merged.values()];
    current.more = Boolean(current.movie || current.tv);
    current.loading = false;
    if (current === listing && scope === "all") render();
  }

  function select(date) {
    const previousMonth = selected.slice(0,7);
    selected = key(date);
    if (selected.slice(0,7) !== previousMonth) {
      filter = "";
      if (scope === "all") { loadMore(); return; }
    }
    render();
  }

  function open(date,{week=false}={}) {
    if (dialog?.open) return;
    const view = document.createElement("dialog");
    dialog = view;
    view.id = "kg-personal-calendar";
    view.className = "kg-film-dialog";
    view.setAttribute("aria-labelledby","kg-personal-calendar-title");
    selected = /^\d{4}-\d{2}-\d{2}$/.test(date || "") && Number.isFinite(+fromKey(date)) ? date : key(new Date());
    scope = "tracked";
    filter = "";
    expanded = !week;
    listing = null;
    view.innerHTML = `<header class="kg-mc-header"><button type="button" data-mc-back autofocus aria-label="${label("Назад")}">${icon("back")}</button>
      <h1 id="kg-personal-calendar-title">${label("Мой календарь")}</h1>
      <button type="button" data-mc-today aria-label="${label("Сегодня")}" title="${label("Сегодня")}">${icon("calendar")}</button></header><main></main>`;
    view.addEventListener("click",event=>{
      const button = event.target.closest("button");
      if (!button) return;
      const {mcScope,mcDate,mcMove,mcFilter,mcRelease,mcReminder} = button.dataset;
      if (button.hasAttribute("data-mc-back")) { view.close(); return; }
      if (button.hasAttribute("data-mc-today")) { select(new Date()); return; }
      if (mcScope && mcScope !== scope) {
        scope = mcScope; filter = "";
        if (scope === "all") loadMore(); else render();
        return;
      }
      if (mcDate) { select(fromKey(mcDate)); return; }
      if (mcMove) {
        const date = fromKey(selected), direction = Number(mcMove);
        select(expanded ? new Date(date.getFullYear(),date.getMonth()+direction,1,12) : shift(date,direction*7));
        return;
      }
      if (mcFilter !== undefined) { filter = mcFilter; render(); return; }
      if (button.hasAttribute("data-mc-expand")) { expanded = !expanded; render(); return; }
      if (button.hasAttribute("data-mc-more")) { loadMore(true); return; }
      if (mcReminder !== undefined) {
        const row = releaseMap[mcReminder];
        if (row) window.KGSeriesCalendar.reminder({show:showFor(row),episode:episodeFor(row)},button);
      }
      if (mcRelease !== undefined) {
        const row = releaseMap[mcRelease];
        if (!row) return;
        if (row.kind === "episode") window.KGEpisodePage.open(showFor(row),episodeFor(row),row.season,{opener:button});
        else if (row.kind === "series") window.KGSeriesHub.openSeries(showFor(row),button);
        else window.KGFilmCard.openDialog(row.film || {id:row.id,title:row.title,release_date:row.date,poster_path:row.poster,adult:false},button);
      }
    });
    view.addEventListener("close",()=>{view.remove();if(dialog===view)dialog=null;},{once:true});
    document.body.append(view);
    view.showModal();
    render();
    window.KGReleaseFollow.refresh();
  }

  document.addEventListener("kg:release-follows-change",()=>{if(scope === "tracked") render();});
  window.KGPersonalCalendar = {open,trackedRows};
})();
