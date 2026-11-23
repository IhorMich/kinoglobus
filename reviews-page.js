/* Personal reviews use the diary's saved notes and existing editor. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label = (key,params) => esc(uiText(key,params));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const dateFormat = new Intl.DateTimeFormat(interfaceLanguage,{day:"numeric",month:"short",year:"numeric"});
  const scoreFormat = new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const normalize = value => String(value||"").toLocaleLowerCase(interfaceLanguage).replaceAll("ё","е");
  const kind = row => window.KGSeries.isSeriesId(row.film.id) ? "series" : "films";
  const filmFor = row => row.film._episodeLog?.series || row.film;
  const title = row => filmFor(row).title || filmFor(row).original_title || filmFor(row).original || uiText("Без названия");
  const reviewText = row => String(row.note.text || "").trim();
  const personalRating = row => {
    const rating = Number(row.note.rating);
    return rating>0 && rating<=5 ? rating*2 : 0;
  };
  const pageSize = 8;
  const dialog = document.createElement("dialog");
  dialog.id = "kg-reviews";
  dialog.setAttribute("aria-labelledby","kg-rv-title");
  dialog.innerHTML = `<header class="kg-rv-header">
    <button type="button" class="kg-rv-control" data-rv-back autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
    <h1 id="kg-rv-title">${label("Мои рецензии")}</h1>
  </header>
  <main class="kg-rv-main">
    <section class="kg-rv-summary">
      <h2>${label("Журнал кинокритика")}</h2>
      <div class="kg-rv-metrics">
        <div><strong data-rv-total></strong><small>${label("Рецензии")}</small></div>
        <div><strong data-rv-average></strong><small>${label("Средний балл")}</small></div>
        <div><strong data-rv-episodes></strong><small>${label("На эпизоды")}</small></div>
      </div>
      <button type="button" class="kg-rv-control kg-rv-new" data-rv-new>${icon("edit_note")}${label("Написать новую рецензию")}</button>
    </section>
    <label class="kg-rv-search">${icon("search")}<input type="search" autocomplete="off" aria-label="${label("Поиск по рецензиям")}" placeholder="${label("Поиск по рецензиям и названиям…")}"></label>
    <div class="kg-rv-tools"><div class="kg-rv-filters" data-rv-filters></div>
      <button type="button" class="kg-rv-control" data-rv-sort>${icon("swap_vert")}<span></span></button>
    </div>
    <p class="kg-rv-status" role="status" hidden></p>
    <div class="kg-rv-list" data-rv-list></div>
    <footer class="kg-rv-footer" hidden><button class="kg-rv-control" type="button" data-rv-more>${label("Показать ещё рецензии")}${icon("expand_more")}</button><small data-rv-page></small></footer>
  </main>
  <dialog class="kg-rv-picker" data-rv-picker aria-labelledby="kg-rv-picker-title">
    <h2 id="kg-rv-picker-title">${label("Выберите фильм, сериал или эпизод")}</h2>
    <label class="kg-rv-search">${icon("search")}<input type="search" data-rv-picker-search aria-label="${label("Поиск")}" placeholder="${label("Поиск")}"></label>
    <div data-rv-choices></div>
    <button type="button" class="kg-rv-control" data-rv-picker-back>${label("Закрыть")}</button>
  </dialog>`;
  document.body.append(dialog);
  const main=dialog.querySelector("main");
  const query=main.querySelector("input");
  const picker=dialog.querySelector("[data-rv-picker]");
  const pickerSearch=picker.querySelector("input");
  const set=(selector,value)=>{dialog.querySelector(selector).textContent=value;};
  let rows=[],choices=[],filter="all",ascending=false,limit=pageSize;

  function entryCard(row,index) {
    const film=filmFor(row),log=row.film._episodeLog;
    const art=film.poster_path || film.poster || "";
    const image=/^\/[\w.-]+$/.test(art) ? "https://image.tmdb.org/t/p/w185"+art : "";
    const date=row.date && !row.note.dateUnknown ? dateFormat.format(row.date) : "";
    const year=String(film.release_date||film.year||"").slice(0,4);
    const rating=personalRating(row);
    const meta=log ? [`S${log.season} · E${log.episode.episode_number}`,log.episode.name].filter(Boolean).join(" · ")
      : [uiText(kind(row)==="series"?"Сериал":"Фильм"),year,film.original_title||film.original].filter(Boolean).join(" · ");
    const copy=`<span class="kg-rv-copy">
      ${row.note.title ? `<strong>${esc(row.note.title)}</strong>` : ""}
      <span>${esc(reviewText(row))}</span>
    </span>`;
    return `<article class="kg-rv-card">
      <button class="kg-rv-film" type="button" data-rv-open="${index}">
        <span class="kg-rv-art">${icon(kind(row)==="series"?"tv":"movie")}${image?`<img src="${image}" alt="" loading="lazy" decoding="async">`:""}</span>
        <span class="kg-rv-meta">
          <span class="kg-rv-spoiler" data-spoiler="${!!row.note.spoiler}">${label(row.note.spoiler?"Со спойлерами":"Без спойлеров")}</span>
          <strong>${esc(title(row))}</strong><small>${esc(meta)}</small>${date?`<small>${esc(date)}</small>`:""}
        </span>
        ${rating ? `<span class="kg-rv-score"><span aria-hidden="true">★</span> ${scoreFormat.format(rating)}</span>` : ""}
      </button>
      ${row.note.spoiler && window.KGCinemaDiarySpoilers.get()
        ? `<details><summary>${label("Показать спойлер")}</summary>${copy}</details>` : copy}
      <footer>${row.note.author?`<span>${esc(row.note.author)}</span>`:""}
        <button type="button" class="kg-rv-control" data-rv-share="${index}" aria-label="${label("Поделиться рецензией")}">${icon("share")}</button>
        <button type="button" class="kg-rv-control" data-rv-edit="${index}" aria-label="${label("Редактировать запись")}">${icon("edit")}</button>
      </footer>
    </article>`;
  }

  function render() {
    rows=window.KGReadDiaryNotes().filter(row=>reviewText(row)&&movieCatalog.allows(filmFor(row)));
    const ratings=rows.map(personalRating).filter(Boolean);
    set("[data-rv-total]",String(rows.length));
    set("[data-rv-average]",ratings.length ? "★ "+scoreFormat.format(ratings.reduce((a,b)=>a+b,0)/ratings.length) : "—");
    set("[data-rv-episodes]",String(rows.filter(row=>row.film._episodeLog).length));
    set("[data-rv-sort] span:last-child",uiText(ascending?"Сначала старые":"Сначала новые"));
    dialog.querySelector("[data-rv-filters]").innerHTML=[["all","Все"],["films","Фильмы"],["series","Сериалы"]].map(([key,name])=>
      `<button type="button" data-rv-filter="${key}" aria-pressed="${filter===key}">${label(name)} <small>${rows.filter(row=>key==="all"||kind(row)===key).length}</small></button>`).join("");
    const term=normalize(query.value.trim());
    const matches=rows.map((row,index)=>({row,index})).filter(({row})=>
      (filter==="all"||kind(row)===filter) && (!term || normalize([title(row),row.film.original_title,row.note.title,row.note.author,reviewText(row)].join(" ")).includes(term)));
    if(ascending)matches.sort((a,b)=>a.row.key&&b.row.key ? a.row.key.localeCompare(b.row.key) : Number(!a.row.key)-Number(!b.row.key));
    const page=matches.slice(0,limit);
    dialog.querySelector("[data-rv-list]").innerHTML=page.length ? page.map(({row,index})=>entryCard(row,index)).join("") :
      `<p class="kg-rv-empty">${label(rows.length?"Ничего не найдено":"У вас пока нет рецензий.")}</p>`;
    const footer=dialog.querySelector(".kg-rv-footer");
    footer.hidden=!page.length;
    footer.querySelector("button").hidden=page.length===matches.length;
    set("[data-rv-page]",uiText("Показано {shown} из {total}",{shown:page.length,total:matches.length}));
  }

  const itemName = item => [item.film.title || item.film.name,item.log && `S${item.log.season} · E${item.log.episode.episode_number}`].filter(Boolean).join(" · ") || uiText("Без названия");
  function renderChoices() {
    const term=normalize(pickerSearch.value.trim());
    const matches=choices.map((item,index)=>({item,index})).filter(({item})=>!term||normalize(itemName(item)).includes(term)).slice(0,32);
    picker.querySelector("[data-rv-choices]").innerHTML=matches.length ? matches.map(({item,index})=>`<button type="button" class="kg-rv-control" data-rv-pick="${index}">${esc(itemName(item))}</button>`).join("") :
      `<p class="kg-rv-empty">${label(choices.length?"Ничего не найдено":"Сначала добавьте фильм или сериал в закладки либо отметьте просмотр.")}</p>`;
  }
  function pickReview() {
    const library=store.get("kgBookmarkFilms",{})||{};
    const movies=[...watched,...window.KGSeries.watchedList(),...Object.values(library),...window.KGSeries.bookmarkList(),...window.KGFavorites.list()];
    choices=[...new Map(movies.filter(f=>Number(f?.id)>0&&movieCatalog.allows(f)).map(f=>[Number(f.id),{film:window.KGFilmCard.savedFilm(f)}])).values()];
    choices.push(...window.KGSeriesDetail.diaryEntries({includePrivate:true}).map(({film})=>({film:film._episodeLog.series,log:film._episodeLog})).filter(item=>movieCatalog.allows(item.film)));
    pickerSearch.value="";renderChoices();picker.showModal();
  }
  function edit(row) {
    const log=row.film._episodeLog;
    if(log)window.KGSeriesDetail.openEpisodeNote(log.series,log.episode,log.season);
    else window.KGOpenCinemaDiaryNote(window.KGFilmCard.savedFilm(row.film));
  }
  async function share(row) {
    const status=dialog.querySelector(".kg-rv-status");
    const value=[title(row),row.note.title,reviewText(row)].filter(Boolean).join("\n\n");
    try{
      if(navigator.share)await navigator.share({title:title(row),text:value});
      else {await navigator.clipboard.writeText(value);status.textContent=uiText("Рецензия скопирована.");status.hidden=false;}
    }catch(error){if(error.name!=="AbortError"){status.textContent=uiText("Не удалось поделиться рецензией.");status.hidden=false;}}
  }
  const reset=()=>{limit=pageSize;render();};
  query.addEventListener("input",reset);
  pickerSearch.addEventListener("input",renderChoices);
  dialog.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.hidden=true;},true);
  dialog.addEventListener("click",event=>{
    const b=event.target.closest("button");
    if(!b)return;
    const {rvFilter,rvPick,rvEdit,rvShare,rvOpen}=b.dataset;
    if(b.hasAttribute("data-rv-back"))dialog.close();
    else if(b.hasAttribute("data-rv-new"))pickReview();
    else if(b.hasAttribute("data-rv-picker-back"))picker.close();
    else if(b.hasAttribute("data-rv-sort")){ascending=!ascending;reset();}
    else if(b.hasAttribute("data-rv-more")){limit+=pageSize;render();}
    else if(rvFilter){filter=rvFilter;reset();dialog.querySelector(`[data-rv-filter="${filter}"]`).focus({preventScroll:true});}
    else if(rvPick!==undefined){
      const item=choices[Number(rvPick)];if(!item)return;
      picker.close();
      if(item.log)window.KGSeriesDetail.openEpisodeNote(item.log.series,item.log.episode,item.log.season);
      else window.KGOpenCinemaDiaryNote(item.film);
    }else{
      const row=rows[Number(rvEdit??rvShare??rvOpen)];
      if(!row)return;
      if(rvEdit!==undefined)edit(row);
      else if(rvShare!==undefined)share(row);
      else {
        const log=row.film._episodeLog;
        if(log)window.KGEpisodePage.open(log.series,log.episode,log.season,{opener:b});
        else window.KGFilmCard.openDialog(window.KGFilmCard.savedFilm(row.film),b);
      }
    }
  });
  for(const event of ["kg:diary-note-change","kg:episode-note-change"])document.addEventListener(event,()=>{if(dialog.open)render();});
  window.KGOpenReviews=()=>{
    filter="all";ascending=false;limit=pageSize;query.value="";
    dialog.querySelector(".kg-rv-status").hidden=true;
    render();
    if(!dialog.open)dialog.showModal();
    main.scrollTop=0;
  };
})();
