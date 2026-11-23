/* Saved films and series, backed by the existing bookmark stores. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label = (text,values) => esc(uiText(text,values));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const number = new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const shortDate = new Intl.DateTimeFormat(interfaceLanguage,{day:"numeric",month:"short",year:"numeric"});
  const media = [["all","Все"],["film","Фильмы"],["series","Сериалы"]];
  const sorts = [["added","По дате добавления"],["rating","По рейтингу"],["title","По названию"]];
  const dialog = document.createElement("dialog");
  dialog.id = "kg-bookmarks-page";
  dialog.setAttribute("aria-labelledby","kg-bookmarks-title");
  dialog.innerHTML = `<header class="kg-bp-header">
    <button type="button" class="kg-bp-control" data-bp-back autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
    <h1 id="kg-bookmarks-title">${label("Закладки")}</h1>
  </header>
  <main class="kg-bp-main">
    <section class="kg-bp-tools">
      <h2>${label("Буду смотреть")}</h2>
      <p>${label("Коллекция фильмов и сериалов, отложенных на будущее")}</p>
      <label class="kg-bp-search">${icon("search")}<input type="search" autocomplete="off" enterkeyhint="search" aria-label="${label("Поиск в закладках")}" placeholder="${label("Искать в закладках…")}"></label>
      <div class="kg-bp-chips" data-bp-media aria-label="${label("Тип закладок")}"></div>
      <div class="kg-bp-controls" id="kg-bp-controls">
        <label class="kg-bp-sort"><span>${label("Сортировка")}</span><select aria-label="${label("Сортировка")}">${sorts.map(([key,text])=>`<option value="${key}">${label(text)}</option>`).join("")}</select>${icon("expand_more")}</label>
        <div class="kg-bp-layout"><button type="button" data-bp-layout="list" aria-label="${label("Список")}">${icon("view_list")}</button><button type="button" data-bp-layout="grid" aria-label="${label("Плитки")}">${icon("grid_view")}</button></div>
      </div>
      <div class="kg-bp-chips" data-bp-providers aria-label="${label("Стриминговые сервисы")}" hidden></div>
    </section>
    <div class="kg-bp-items" data-bp-items></div>
    <footer class="kg-bp-summary" data-bp-summary hidden>
      <div>${icon("schedule")}<span><strong>${label("Хронометраж списка")}</strong><small data-bp-runtime></small></span><b data-bp-queue></b></div>
      <button type="button" class="kg-bp-control" data-bp-random>${icon("casino")}${label("Случайный выбор")}</button>
    </footer>
  </main>`;
  document.body.append(dialog);
  const main = dialog.querySelector("main");
  const query = dialog.querySelector("input");
  const sort = dialog.querySelector("select");
  const providers = dialog.querySelector("[data-bp-providers]");
  const cards = dialog.querySelector("[data-bp-items]");
  const summary = dialog.querySelector("[data-bp-summary]");
  let closeParent, bookmarkRows = [], visible = [], selection = "all", service = "", generation = 0, hadKey = false;
  let layout = store.get("kgBookmarksLayout","list") === "grid" ? "grid" : "list";
  const metadata = new Map();
  const loadedProviders = new Map();
  const filmName = film => film.title || film.name || uiText("Фильм №{id}",{id:window.KGSeries.rawId(film.id)});
  const minutes = value => Number(value)>0 ? uiText("{minutes} мин",{minutes:number.format(Math.round(value))}) : "";
  const safePoster = film => /^\/[\w.-]+$/.test(film.poster_path || film.poster || "") ? "https://image.tmdb.org/t/p/w342"+(film.poster_path || film.poster) : "";
  const normalizeQuery = value => String(value || "").toLocaleLowerCase(interfaceLanguage).replaceAll("ё","е");
  const releaseFollow = id => window.KGReleaseFollow.calendarItems().find(item=>Number(item.id) === id);
  const progressFor = row => {
    const seen = window.KGIsFilmWatched(row.id);
    const marks = row.kind === "series" ? window.KGSeriesDetail.readMarks(row.id) : null;
    return {seen,count:marks?.size || 0,total:Number(row.film.number_of_episodes)||0};
  };
  const providerKey = id => `${window.KGLegalWatch.getEffectiveRegion()}:${id}`;
  const providerNames = id => loadedProviders.get(providerKey(id)) || [];
  const matchesMedia = (row,mode) => mode === "all" || row.kind === mode;

  function readRows() {
    const saved = store.get("kgBookmarkFilms",{}) || {};
    const finished = new Map(watched.map(film=>[Number(film.id),film]));
    const films = kgBookmarkIds().map(id=>({...finished.get(id),...saved[id],id}));
    const series = window.KGSeries.bookmarkList();
    return [...films,...series].map((record,index)=>{
      const id = Number(record.id);
      const saved = {...record,...metadata.get(id)};
      if (saved.adult !== undefined && !movieCatalog.allows(saved)) return null;
      const film = window.KGFilmCard.savedFilm(movieCatalog.allows(saved) ? saved : {id});
      const row = {id,film,kind:window.KGSeries.isSeriesId(id) ? "series" : "film",index,added:Date.parse(record.savedAt)||0};
      row.progress = progressFor(row);
      return row;
    }).filter(Boolean);
  }

  function card(row) {
    const {film,id,kind,progress} = row;
    const title = filmName(film);
    const poster = safePoster(film);
    const year = String(film.release_date || film.year || "").slice(0,4);
    const original = film.original_title || film.original || "";
    const provider = providerNames(id)[0];
    const rating = Number(film.vote_average);
    const followed = releaseFollow(id);
    const source = [uiText(kind === "series" ? "Сериал" : "Фильм"),provider,kind === "film" && minutes(film.runtime)].filter(Boolean).join(" · ");
    const genres = (genreLine(film) || film.genres?.filter(genre=>typeof genre==="string").join(", ") || "").split(", ").filter(Boolean).slice(0,2);
    const status = progress.seen ? "Просмотрено" : progress.count ? "Смотрю" : followed ? "Отслеживается" : "Не начато";
    const percent = progress.total && progress.count ? Math.min(100,Math.round(progress.count/progress.total*100)) : 0;
    const progressText = progress.count && !progress.seen ? (progress.total ? uiText("{count} из {total} серий",{count:progress.count,total:progress.total}) : uiText("Просмотрено серий: {count}",{count:progress.count})) : "";
    return `<article class="kg-bp-card">
      <button type="button" class="kg-bp-open" data-bp-open="${id}" aria-label="${esc(title)}">
        <span class="kg-bp-poster">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ""}${icon(kind === "series" ? "tv" : "movie")}
          ${rating>0 ? `<small>★ ${number.format(rating)}</small>` : ""}</span>
        <span class="kg-bp-info"><small>${esc(source)}</small><strong>${esc(title)}</strong>
          ${original && original!==title || year ? `<small>${esc([original!==title ? original : "",year].filter(Boolean).join(" · "))}</small>` : ""}
          ${genres.length ? `<span class="kg-bp-genres">${genres.map(genre=>`<span>${esc(genre)}</span>`).join("")}</span>` : ""}
          ${progressText ? `<span class="kg-bp-progress"><span>${esc(progressText)}</span>${percent ? `<progress max="100" value="${percent}" aria-label="${label("Просмотрено")}"></progress>` : ""}</span>` : ""}
          <span class="kg-bp-state"><span>${label(status)}</span><small data-bp-added>${row.added ? label("Добавлено {date}",{date:shortDate.format(row.added)}) : label("Дата добавления неизвестна")}</small></span>
        </span>
      </button>
      <footer>
        <button type="button" class="kg-bp-control" data-bp-watch="${id}">${icon(progress.seen ? "edit" : progress.count ? "play_arrow" : "check_circle")}<span>${label(progress.seen ? "В дневник" : progress.count ? "Продолжить просмотр" : "Отметить просмотр")}</span></button>
        ${kgBookmarkButton(film)}
      </footer>
    </article>`;
  }

  function render() {
    bookmarkRows = readRows();
    const names = [...new Set(bookmarkRows.flatMap(row=>providerNames(row.id)))].sort((a,b)=>a.localeCompare(b,interfaceLanguage));
    if (!names.includes(service)) service = "";
    const term = normalizeQuery(query.value.trim());
    visible = bookmarkRows.filter(row=>matchesMedia(row,selection) && (!service || providerNames(row.id).includes(service)) &&
      (!term || normalizeQuery([filmName(row.film),row.film.original_title,row.film.year].join(" ")).includes(term)));
    const newest = (a,b)=>b.added-a.added || b.index-a.index;
    const compareTitle = (a,b)=>filmName(a.film).localeCompare(filmName(b.film),interfaceLanguage);
    visible.sort(sort.value === "title" ? compareTitle : sort.value === "rating" ? (a,b)=>(Number(b.film.vote_average)||0)-(Number(a.film.vote_average)||0) || newest(a,b) : newest);
    dialog.querySelector("[data-bp-media]").innerHTML = media.map(([key,name])=>`<button type="button" data-bp-tab="${key}" aria-pressed="${selection===key}">${label(name)} <small>${number.format(bookmarkRows.filter(row=>matchesMedia(row,key)).length)}</small></button>`).join("");
    providers.hidden = !names.length;
    providers.innerHTML = names.length ? [["","Все сервисы"],...names.map(name=>[name,name])].map(([value,name])=>`<button type="button" data-bp-service="${esc(value)}" aria-pressed="${value===service}">${esc(value ? name : uiText(name))}</button>`).join("") : "";
    for (const button of dialog.querySelectorAll("[data-bp-layout]")) button.setAttribute("aria-pressed",String(button.dataset.bpLayout===layout));
    cards.dataset.layout = layout;
    cards.innerHTML = visible.length ? visible.map(card).join("") : `<p class="kg-bp-empty">${label(bookmarkRows.length ? "Ничего не найдено" : "В закладках пока нет фильмов и сериалов.")}</p>`;
    summary.hidden = !visible.length;
    const runtime = visible.reduce((sum,{film,kind})=>{
      const minutes = Number(film.runtime)||0;
      return sum + (kind === "film" ? minutes : minutes*(Number(film.number_of_episodes)||0));
    },0);
    summary.querySelector("[data-bp-runtime]").textContent = runtime ? uiText("Известный хронометраж: {minutes} мин",{minutes:number.format(runtime)}) : uiText("Хронометраж пока неизвестен");
    summary.querySelector("[data-bp-queue]").textContent = number.format(visible.length);
  }

  async function hydrate() {
    const token = ++generation;
    if (!apiKey) { hadKey=false; return; }
    hadKey=true;
    const queue = bookmarkRows.map(row=>row.id);
    async function worker() {
      while (token === generation && dialog.open && queue.length) {
        const id = queue.shift();
        await Promise.allSettled([
          metadata.has(id) ? null : filmDetails(id).then(details=>metadata.set(id,{
            adult:details.adult,title:details.title,original_title:details.originalTitle,release_date:details.release,
            localizedPoster:details.localizedPoster,poster_path:details.localizedPoster?.path || details.posterPath,
            vote_average:details.average,runtime:details.runtime,genres:details.genres,number_of_episodes:details.number_of_episodes
          })),
          loadedProviders.has(providerKey(id)) ? null : window.KGLegalWatch.providersFor(id).then(({region,names})=>loadedProviders.set(`${region}:${id}`,names))
        ]);
      }
    }
    await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));
    if (token===generation && dialog.open) render();
  }

  function openDetails(row,button,showEpisodes=false) {
    return window.KGFilmCard.openDialog(row.film,button,{showEpisodes});
  }
  dialog.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if (!button) return;
    const {bpTab,bpService,bpLayout,bpOpen,bpWatch} = button.dataset;
    if (button.hasAttribute("data-bp-back")) dialog.close();
    else if (bpTab) {
      selection=bpTab;render();
      dialog.querySelector(`[data-bp-tab="${bpTab}"]`).focus({preventScroll:true});
    } else if (bpService!==undefined) {
      service=bpService;render();
      [...providers.children].find(chip=>chip.dataset.bpService===service)?.focus({preventScroll:true});
    } else if (bpLayout) {
      layout=bpLayout;store.set("kgBookmarksLayout",layout);render();
    } else if (bpOpen || bpWatch) {
      const row=bookmarkRows.find(item=>item.id===Number(bpOpen || bpWatch));
      if (!row) return;
      if (bpOpen) openDetails(row,button);
      else if (row.progress.seen) window.KGOpenCinemaDiaryNote(row.film);
      else if (row.kind==="series" || !movieCatalog.allows(row.film)) openDetails(row,button,row.kind==="series");
      else window.KGToggleWatched(row.film);
    } else if (button.hasAttribute("data-bp-random")) {
      const pending=visible.filter(row=>!row.progress.seen);
      const pool=pending.length ? pending : visible;
      if (pool.length) openDetails(pool[Math.floor(Math.random()*pool.length)],button);
    }
  });
  query.addEventListener("input",render);
  sort.addEventListener("change",render);
  cards.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.hidden=true;},true);
  dialog.addEventListener("close",()=>{if(!dialog.open)generation++;});
  for(const event of ["kg:watched-change","kg:episode-note-change","kg-bookmark-change"]){
    document.addEventListener(event,()=>{
      if (!dialog.open) return;
      render();
      if (event==="kg-bookmark-change") hydrate();
    });
  }
  window.KGOpenBookmarks = ({closeParent:onNavigate}={})=>{
    closeParent=onNavigate;
    selection="all";service="";query.value="";
    if (!hadKey && apiKey) { metadata.clear(); loadedProviders.clear(); }
    window.KGMountBottomNav(dialog,dialog,"bookmarks",()=>{dialog.close();closeParent?.();});
    render();
    if (!dialog.open) dialog.showModal();
    main.scrollTop=0;
    hydrate();
  };
})();
