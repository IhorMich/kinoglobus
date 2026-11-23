/* The personal viewing archive uses the same viewing records as the diary. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label = (value,params) => esc(uiText(value,params));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const number = new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const monthFormat = new Intl.DateTimeFormat(interfaceLanguage,{month:"long",year:"numeric"});
  const dateFormat = new Intl.DateTimeFormat(interfaceLanguage,{day:"numeric",month:"short"});
  const filters = [["all","Все"],["film","Фильмы"],["series","Сериалы"],["notes","С заметками"]];
  const pageSize = 12;
  const dialog = document.createElement("dialog");
  dialog.id = "kg-viewing-history";
  dialog.setAttribute("aria-labelledby","kg-vh-title");
  dialog.innerHTML = `<header class="kg-vh-header">
    <button class="kg-vh-control" type="button" data-vh-close autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
    <h1 id="kg-vh-title">${label("История просмотров")}</h1>
  </header>
  <main class="kg-vh-main">
    <section class="kg-vh-summary">
      <div class="kg-vh-summary-head"><h2>${label("Вся история просмотров")}</h2>
        <button class="kg-vh-control" type="button" data-vh-stats><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 19v-6m7 6V5m7 14V9"/></svg>${label("Статистика")}</button>
        <button class="kg-vh-control" type="button" data-vh-share aria-label="${label("Поделиться историей")}">${icon("share")}</button></div>
      <div class="kg-vh-metrics">
        <div><strong data-vh-total></strong><small>${label("Отметок о просмотре")}</small></div>
        <div><strong data-vh-runtime></strong><small>${label("Известный хронометраж")}</small></div>
      </div>
      <div class="kg-vh-breakdown" data-vh-breakdown></div>
      <p class="kg-vh-message" role="status" hidden></p>
    </section>
    <label class="kg-vh-search">${icon("search")}<input type="search" autocomplete="off" aria-label="${label("Поиск в истории просмотров")}" placeholder="${label("Найти в истории…")}"></label>
    <div class="kg-vh-chips" data-vh-filters aria-label="${label("Тип записи")}"></div>
    <div class="kg-vh-toolbar">
      <div class="kg-vh-chips" data-vh-years aria-label="${label("Год просмотра")}"></div>
      <button class="kg-vh-control" type="button" data-vh-sort>${icon("swap_vert")}<span></span></button>
    </div>
    <div data-vh-timeline></div>
    <footer class="kg-vh-more" hidden>
      <div><span data-vh-page-count></span><span data-vh-page-percent></span></div>
      <progress max="100" value="0" aria-label="${label("Загруженные записи")}"></progress>
    </footer>
  </main>`;
  document.body.append(dialog);
  const main = dialog.querySelector("main");
  const search = dialog.querySelector("input");
  const text = (selector,value) => {dialog.querySelector(selector).textContent=value;};
  let rows = [], activeFilter = "all", year = "", ascending = false, limit = pageSize, hasMore = false;
  const artwork = new Map();
  const tmdbArt = (path,size) => /^\/[\w.-]+$/.test(path || "") ? "https://image.tmdb.org/t/p/"+size+path : "";
  const filmName = film => film.title || film.name || film.original || uiText("Без названия");
  const values = row => String(row.note?.text || "").trim();
  const validRating = (value,max=10) => {
    const rating = Number(value);
    return Number.isFinite(rating) && rating>0 && rating<=max ? rating : 0;
  };
  const score = (value,source) => `<span class="kg-vh-score" title="${label(source)}" aria-label="${label(source)}: ${number.format(value)}"><span aria-hidden="true">★</span> ${number.format(value)}</span>`;
  const compact = value => String(value || "").toLocaleLowerCase(interfaceLanguage).replaceAll("ё","е");

  function readRows() {
    const notes = store.get("kgCinemaDiaryNotes",{}) || {};
    const direct = [...watched,...window.KGSeries.watchedList()].map(film=>{
      const id = Number(film?.id);
      if (!Number.isSafeInteger(id) || id<=0) return null;
      return {key:String(id),film:window.KGFilmCard.savedFilm(film),kind:window.KGSeries.isSeriesId(id)?"series":"film",note:notes[id]};
    }).filter(Boolean);
    const episodes = window.KGSeriesDetail.diaryEntries({includePrivate:true}).map(({film,note})=>({
      key:film._diaryKey,film:window.KGFilmCard.savedFilm(film._episodeLog.series),kind:"episode",note,episode:film._episodeLog
    }));
    return [...new Map([...direct,...episodes].map(row=>[row.key,row])).values()]
      .filter(row=>movieCatalog.allows(row.film))
      .map(row=>{
        const note = row.note || {};
        const recorded = note.dateUnknown || row.film.watchDateUnknown ? "" : note.date || row.film.watchDate || row.film.watchedAt || "";
        const candidate = /^\d{4}-\d{2}-\d{2}$/.test(recorded) ? new Date(recorded+"T12:00:00") : new Date(recorded);
        const date = Number.isFinite(+candidate) ? candidate : null;
        const runtime = Number(row.episode?.episode.runtime ?? (row.kind==="film" ? row.film.runtime : 0));
        row.date=date;
        row.year=date ? String(date.getFullYear()) : "";
        row.month=date ? row.year+"-"+String(date.getMonth()+1).padStart(2,"0") : "";
        row.runtime=Number.isFinite(runtime)&&runtime>0 ? Math.round(runtime) : 0;
        return row;
      });
  }

  const matches = (row,key) => key==="all" || (key==="notes" ? !!values(row) : key==="series" ? row.kind!=="film" : row.kind==="film");
  const runtime = list => list.reduce((sum,row)=>sum+row.runtime,0);
  function duration(minutes) {
    if (!minutes) return "—";
    const hours = Math.floor(minutes/60);
    return [hours && uiText("{count} ч",{count:number.format(hours)}),minutes%60 && uiText("{minutes} мин",{minutes:minutes%60})].filter(Boolean).join(" ");
  }
  function card(row) {
    const {film,note,date,kind,episode,key} = row;
    const title = filmName(film);
    const poster = tmdbArt(film.poster_path || film.poster,"w500");
    const wide = tmdbArt(episode?.episode.still_path || film.backdrop_path,"w780");
    const time = note?.timeKnown && /^\d{2}:\d{2}$/.test(note.time) ? note.time
      : !episode && film.watchTimeKnown && /^\d{2}:\d{2}$/.test(film.watchTime) ? film.watchTime : "";
    const stamp = date ? [dateFormat.format(date),time].filter(Boolean).join(" · ") : uiText("Дата не указана");
    const media = episode ? `S${episode.season} · E${episode.episode.episode_number}` : uiText(kind==="film"?"Фильм":"Сериал");
    const year = String(film.release_date || film.year || "").slice(0,4);
    const details = [episode ? episode.episode.name : film.director || film.original_title || film.original, !episode && year, row.runtime && duration(row.runtime)].filter(Boolean).join(" · ");
    const personalRating = validRating(note?.rating,5)*2;
    const episodeRating = validRating(episode?.episode.vote_average);
    const catalogRating = episodeRating || validRating(film.vote_average);
    const ratingSource = personalRating ? "Личная оценка" : episode && !episodeRating ? "Рейтинг сериала TMDb" : "Рейтинг TMDb";
    const quote = values(row);
    const hidden = note?.spoiler && window.KGCinemaDiarySpoilers.get();
    return `<article class="kg-vh-card">
      <button type="button" class="kg-vh-open" data-vh-open="${esc(key)}">
        <span class="kg-vh-art"${!wide || !personalRating&&!catalogRating ? ` data-vh-art-id="${Number(film.id)}"` : ""}
          ${wide ? "" : " data-vh-need-backdrop"}${episode ? " data-vh-episode" : ""}>
          ${wide || poster ? `<img src="${wide || poster}" alt="" loading="lazy" decoding="async">` : ""}
          ${icon(kind==="film"?"movie":"tv")}<small>${esc(media)}</small>
          ${personalRating||catalogRating ? score(personalRating||catalogRating,ratingSource) : ""}</span>
        <span class="kg-vh-details"><small class="kg-vh-stamp">${esc(stamp)}</small><strong>${esc(title)}</strong>
          ${details ? `<small>${esc(details)}</small>` : ""}
        </span>
      </button>
      <button type="button" class="kg-vh-edit" data-vh-edit="${esc(key)}" aria-label="${label("Редактировать запись")}">${icon("edit")}</button>
      ${quote ? hidden ? `<details class="kg-vh-quote"><summary>${label("Показать спойлер")}</summary><p>${esc(quote)}</p></details>`
        : `<p class="kg-vh-quote">${icon("chat_bubble")}<span>${esc(quote)}</span></p>` : ""}
    </article>`;
  }

  function render() {
    rows = readRows();
    const years = [...new Set(rows.map(row=>row.year).filter(Boolean))].sort().reverse();
    if (!years.includes(year)) year="";
    text("[data-vh-total]",number.format(rows.length));
    text("[data-vh-runtime]",duration(runtime(rows)));
    const films = rows.filter(row=>row.kind==="film").length;
    const episodes = rows.filter(row=>row.kind==="episode").length;
    const shows = rows.length-films-episodes;
    dialog.querySelector("[data-vh-breakdown]").innerHTML = [
      ["movie","Фильмы",films],["tv","Эпизоды",episodes],["tv","Сериалы",shows]
    ].filter((item,index)=>index<2||item[2]).map(([symbol,name,count])=>`<span>${icon(symbol)} ${label(name)} <b>${number.format(count)}</b></span>`).join("");
    dialog.querySelector("[data-vh-filters]").innerHTML = filters.map(([key,name])=>`<button type="button" data-vh-filter="${key}" aria-pressed="${key===activeFilter}">${label(name)} <small>${number.format(rows.filter(row=>matches(row,key)).length)}</small></button>`).join("");
    dialog.querySelector("[data-vh-years]").innerHTML = ["",...years].map(value=>`<button type="button" data-vh-year="${value}" aria-pressed="${value===year}">${value||label("Все")}</button>`).join("");
    text("[data-vh-sort] span:last-child",uiText(ascending?"Сначала старые":"Сначала новые"));
    const query = compact(search.value.trim());
    const found = rows.filter(row=>matches(row,activeFilter) && (!year || row.year===year) &&
      (!query || compact([filmName(row.film),row.film.original_title,row.film.original,row.film.director,...(row.film.dirs||[]),row.episode?.episode.name].join(" ")).includes(query)));
    found.sort((a,b)=>a.date&&b.date ? (ascending ? a.date-b.date : b.date-a.date) : Number(!a.date)-Number(!b.date));
    const groups = new Map();
    for (const row of found) {
      if (!groups.has(row.month)) groups.set(row.month,[]);
      groups.get(row.month).push(row);
    }
    let shown=0;
    const sections=[];
    for (const [key,items] of groups) {
      const visible = items.slice(0,Math.max(0,limit-shown));
      if (!visible.length) break;
      shown+=visible.length;
      const name = key ? monthFormat.format(items[0].date) : uiText("Без даты");
      sections.push(`<section class="kg-vh-month"><header><h2>${esc(name)}</h2>
        <span>${label("Записей: {count}",{count:number.format(items.length)})}${runtime(items) ? " · "+esc(duration(runtime(items))) : ""}</span></header>
        ${visible.map(card).join("")}</section>`);
    }
    dialog.querySelector("[data-vh-timeline]").innerHTML = sections.join("") || `<p class="kg-vh-empty">${label(rows.length?"Ничего не найдено":"История просмотров пока пуста.")}</p>`;
    const footer = dialog.querySelector(".kg-vh-more");
    footer.hidden = !found.length;
    const percent = found.length ? Math.round(shown/found.length*100) : 0;
    footer.querySelector("progress").value = percent;
    text("[data-vh-page-count]",uiText("Показано {shown} из {total}",{shown:number.format(shown),total:number.format(found.length)}));
    text("[data-vh-page-percent]",percent+"%");
    hasMore = shown<found.length;
    backdropLoader.disconnect();
    for (const frame of dialog.querySelectorAll("[data-vh-art-id]")) backdropLoader.observe(frame);
  }

  async function loadBackdrop(frame) {
    const id = Number(frame.dataset.vhArtId);
    if (!apiKey || !id) return;
    if (!artwork.has(id)) {
      artwork.set(id,filmDetails(id).then(details=>({
        backdrop:tmdbArt(details.backdrop_path,"w780"),rating:validRating(details.average)
      })).catch(()=>{artwork.delete(id);return null;}));
    }
    const details = await artwork.get(id);
    if (!details || !frame.isConnected) return;
    if (details.rating && !frame.querySelector(".kg-vh-score")) {
      frame.insertAdjacentHTML("beforeend",score(details.rating,frame.hasAttribute("data-vh-episode") ? "Рейтинг сериала TMDb" : "Рейтинг TMDb"));
    }
    if (!details.backdrop || !frame.hasAttribute("data-vh-need-backdrop")) return;
    const image = new Image();
    image.alt = "";
    image.decoding = "async";
    image.onload = ()=>{
      const previous = frame.querySelector("img");
      if (previous) previous.replaceWith(image);
      else frame.prepend(image);
    };
    image.src=details.backdrop;
  }
  const backdropLoader = new IntersectionObserver(entries=>{
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      backdropLoader.unobserve(entry.target);
      loadBackdrop(entry.target);
    }
  },{root:main,rootMargin:"120px"});
  main.addEventListener("scroll",()=>{
    if (!dialog.open || !hasMore || main.scrollHeight-main.scrollTop-main.clientHeight>240) return;
    const top=main.scrollTop;
    limit+=pageSize;
    render();
    main.scrollTop=top;
  },{passive:true});
  dialog.addEventListener("close",()=>backdropLoader.disconnect());

  function filterChanged() {
    limit=pageSize;
    render();
  }
  search.addEventListener("input",filterChanged);
  dialog.querySelector("[data-vh-timeline]").addEventListener("error",event=>{
    if (event.target.tagName==="IMG") event.target.hidden=true;
  },true);
  dialog.addEventListener("click",async event=>{
    const button=event.target.closest("button");
    if (!button) return;
    const {vhFilter,vhYear,vhOpen,vhEdit}=button.dataset;
    if (button.hasAttribute("data-vh-close")) dialog.close();
    else if (vhFilter) {
      activeFilter=vhFilter;filterChanged();
      dialog.querySelector(`[data-vh-filter="${vhFilter}"]`).focus({preventScroll:true});
    } else if (vhYear!==undefined) {
      year=vhYear;filterChanged();
      dialog.querySelector(`[data-vh-year="${vhYear}"]`).focus({preventScroll:true});
    } else if (button.hasAttribute("data-vh-sort")) {ascending=!ascending;filterChanged();}
    else if (button.hasAttribute("data-vh-stats")) {
      window.KGViewingStatistics.open({readRows,showNotes:()=>{
        activeFilter="notes";filterChanged();main.scrollTop=0;
        dialog.querySelector('[data-vh-filter="notes"]').focus({preventScroll:true});
      }});
    } else if (button.hasAttribute("data-vh-share")) {
      const message=dialog.querySelector(".kg-vh-message");
      const summary = uiText("История просмотров · Записей: {count}",{count:number.format(rows.length)});
      try {
        if (navigator.share) await navigator.share({title:uiText("История просмотров"),text:summary});
        else {await navigator.clipboard.writeText(summary);message.textContent=uiText("Сводка скопирована.");message.hidden=false;}
      } catch(error) {
        if (error.name!=="AbortError") {message.textContent=uiText("Не удалось поделиться историей.");message.hidden=false;}
      }
    } else if (vhOpen || vhEdit) {
      const row = rows.find(item=>item.key===(vhOpen||vhEdit));
      if (!row) return;
      const log=row.episode;
      if (vhEdit && log) window.KGSeriesDetail.openEpisodeNote(log.series,log.episode,log.season);
      else if (vhEdit) window.KGOpenCinemaDiaryNote(row.film);
      else if (log) window.KGEpisodePage.open(log.series,log.episode,log.season,{opener:button});
      else window.KGFilmCard.openDialog(row.film,button);
    }
  });

  for (const event of ["kg:watched-change","kg:episode-note-change","kg:diary-note-change"]) {
    document.addEventListener(event,()=>{if(dialog.open)render();});
  }
  window.KGViewingHistory = {
    count:()=>readRows().length,
    open(options={}) {
      activeFilter=options.filter||"all";year="";ascending=false;limit=pageSize;search.value="";
      dialog.querySelector(".kg-vh-message").hidden=true;
      if (!dialog.open) dialog.showModal();
      render();
      main.scrollTop=0;
    }
  };
})();
