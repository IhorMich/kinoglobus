/* Personal reviews and title selection for the review editor. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label = (key,params) => esc(uiText(key,params));
  const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const dateFormat = new Intl.DateTimeFormat(interfaceLanguage,{day:"numeric",month:"short",year:"numeric"});
  const scoreFormat = new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const normalize = value => String(value||"").toLocaleLowerCase(interfaceLanguage).replaceAll("ё","е");
  const kind = row => row.film._episodeLog ? "episodes" : window.KGSeries.isSeriesId(row.film.id) ? "series" : "films";
  const filmFor = row => row.film._episodeLog?.series || row.film;
  const title = row => filmFor(row).title || filmFor(row).original_title || filmFor(row).original || uiText("Без названия");
  const reviewText = row => String(row.note.text || "").trim();
  const personalRating = row => {
    const rating = Number(row.note.rating);
    return rating>0 && rating<=5 ? rating*2 : 0;
  };
  const previewSize = 8;
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
        <div data-rv-episode-stat hidden><strong data-rv-episodes></strong><small>${label("Рецензии на эпизоды")}</small></div>
      </div>
      <button type="button" class="kg-rv-control kg-rv-new" data-rv-new>${icon("edit_note")}${label("Написать новую рецензию")}</button>
    </section>
    <label class="kg-rv-search">${icon("search")}<input type="search" autocomplete="off" aria-label="${label("Поиск по рецензиям")}" placeholder="${label("Поиск по рецензиям и названиям…")}"></label>
    <div class="kg-rv-tools" hidden><div class="kg-rv-filters" data-rv-filters></div>
      <button type="button" class="kg-rv-control" data-rv-sort>${icon("swap_vert")}<span></span></button>
    </div>
    <div class="kg-rv-section-heading">
      <h2 class="kg-rv-group-title">${label("Рецензии")}</h2>
      <button type="button" class="kg-rv-control" data-rv-all aria-label="${label("Все рецензии и черновики")}">${label("Все")}${icon("chevron_right")}</button>
    </div>
    <p class="kg-rv-status" role="status" hidden></p>
    <div class="kg-rv-list" data-rv-list></div>
  </main>
  <dialog class="kg-rv-picker" data-rv-picker aria-labelledby="kg-rv-picker-title">
    <h2 id="kg-rv-picker-title">${label("Выберите фильм, сериал или эпизод")}</h2>
    <label class="kg-rv-search">${icon("search")}<input type="search" data-rv-picker-search aria-label="${label("Поиск")}" placeholder="${label("Поиск")}"></label>
    <div class="kg-rv-filters" data-rv-picker-types></div>
    <div data-rv-choices></div>
    <footer>
      <button type="button" class="kg-rv-control" data-rv-catalog>${label("Найти в каталоге")}</button>
      <button type="button" class="kg-rv-control" data-rv-picker-back>${label("Закрыть")}</button>
    </footer>
  </dialog>`;
  document.body.append(dialog);
  const main=dialog.querySelector("main");
  const query=main.querySelector("input");
  const picker=dialog.querySelector("[data-rv-picker]");
  document.body.append(picker);
  const reader=document.createElement("dialog");
  reader.id="kg-review-reader";
  reader.setAttribute("aria-labelledby","kg-review-reader-title");
  reader.innerHTML=`<header class="kg-rv-header">
    <button type="button" class="kg-rv-control" data-rv-reader-back autofocus aria-label="${label("Назад")}">${icon("arrow_back")}</button>
    <h1 id="kg-review-reader-title">${label("Просмотр рецензии")}</h1>
    <button type="button" class="kg-rv-control" data-rv-reader-edit aria-label="${label("Редактировать рецензию")}">${icon("edit")}</button>
  </header><main class="kg-rv-main"><div data-rv-reader-content></div><p class="kg-rv-status" role="status" hidden></p></main>`;
  document.body.append(reader);
  const pickerSearch=picker.querySelector("input"), choiceList=picker.querySelector("[data-rv-choices]");
  const reviewTypes=[["all","Все"],["films","Фильмы"],["series","Сериалы"],["episodes","Эпизоды"]];
  let pickerType="all",pickerMode="history",lookup=0,debounce,selectedSeries,selectedSeason,pickerOpener;
  const set=(selector,value)=>{dialog.querySelector(selector).textContent=value;};
  let rows=[],choices=[],filter="all",ascending=false,fullList=false,draftsOpen=true,reading,readerOpener;

  function reviewKey(row) {
    const log=row.film._episodeLog;
    return log ? `${row.film.id}:${log.season}:${log.episode.episode_number}` : String(row.film.id);
  }

  function subject(row) {
    const film=filmFor(row),log=row.film._episodeLog;
    const art=film.poster_path || film.poster || "";
    const image=/^\/[\w.-]+$/.test(art) ? "https://image.tmdb.org/t/p/w185"+art : "";
    const date=row.date && !row.note.dateUnknown ? dateFormat.format(row.date) : "";
    const year=String(film.release_date||film.year||"").slice(0,4);
    const rating=personalRating(row);
    const meta=log ? [`S${log.season} · E${log.episode.episode_number}`,log.episode.name].filter(Boolean).join(" · ")
      : [uiText(kind(row)==="series"?"Сериал":"Фильм"),year,film.original_title||film.original].filter(Boolean).join(" · ");
    return `
      <span class="kg-rv-art">${icon(kind(row)==="films"?"movie":"tv")}${image?`<img src="${image}" alt="" loading="lazy" decoding="async">`:""}</span>
      <span class="kg-rv-meta">
        <span class="kg-rv-spoiler" data-spoiler="${!!row.note.spoiler}">${label(row.draft?"Черновик":row.note.spoiler?"Со спойлерами":"Без спойлеров")}</span>
        <strong>${esc(title(row))}</strong><small>${esc(meta)}</small>${date?`<small>${esc(date)}</small>`:""}
      </span>
      ${rating ? `<span class="kg-rv-score"><span aria-hidden="true">★</span> ${scoreFormat.format(rating)}</span>` : ""}`;
  }

  function reviewCopy(row) {
    const tags=Array.isArray(row.note.tags)?row.note.tags.filter(tag=>typeof tag==="string"):[];
    const copy=`<div class="kg-rv-copy">
      ${row.note.title ? `<strong>${esc(row.note.title)}</strong>` : ""}
      <span class="kg-rv-body">${window.KGReviews.renderBody(row.note)}</span>
      ${Array.isArray(row.note.fragments)?row.note.fragments.map(text=>`<details class="kg-re-fragment"><summary>${label("Скрытый фрагмент")}</summary><p>${esc(text)}</p></details>`).join(""):""}
      ${row.note.viewFormat||row.note.audio||row.note.viewingDate ? `<small>${esc([row.note.viewFormat,row.note.audio,row.note.viewingDate].filter(Boolean).join(" · "))}</small>` : ""}
      ${tags.length ? `<span class="kg-favorites-tags">${tags.map(tag=>`<span>${label(tag)}</span>`).join("")}</span>` : ""}
    </div>`;
    return row.note.spoiler && window.KGCinemaDiarySpoilers.get()
      ? `<details><summary>${label("Показать спойлер")}</summary>${copy}</details>` : copy;
  }

  function entryCard(row,index) {
    return `<article class="kg-rv-card">
      <button class="kg-rv-film" type="button" ${row.draft?"data-rv-edit":"data-rv-open"}="${index}"
        ${row.draft?"":`aria-label="${label("Читать рецензию: {title}",{title:title(row)})}"`}>
        ${subject(row)}
      </button>
      ${reviewCopy(row)}
      <footer>${row.note.author?`<span>${esc(row.note.author)}</span>`:""}
        ${row.draft?"":`<button type="button" class="kg-rv-control kg-rv-read" data-rv-open="${index}">${label("Читать")}</button>`}
        ${row.draft?"":`<button type="button" class="kg-rv-control" data-rv-share="${index}" aria-label="${label("Поделиться рецензией")}">${icon("share")}</button>`}
        <button type="button" class="kg-rv-control" data-rv-edit="${index}" aria-label="${label("Редактировать запись")}">${icon("edit")}</button>
      </footer>
    </article>`;
  }

  function renderReader() {
    reader.querySelector("[data-rv-reader-content]").innerHTML=`<article class="kg-rv-card">
      <div class="kg-rv-film">${subject(reading)}</div>
      ${reviewCopy(reading)}
      ${reading.note.author ? `<p class="kg-rv-reader-author">${esc(reading.note.author)}</p>` : ""}
      <div class="kg-rv-reader-actions">
        <button type="button" class="kg-rv-control" data-rv-reader-subject>${label(({films:"О фильме",series:"О сериале",episodes:"Об эпизоде"})[kind(reading)])}</button>
        <button type="button" class="kg-rv-control" data-rv-reader-share aria-label="${label("Поделиться рецензией")}">${icon("share")}</button>
      </div>
    </article>`;
  }

  function readReview(row,opener) {
    reading=row;readerOpener=opener;
    reader.querySelector("[role=status]").hidden=true;
    renderReader();
    if(!reader.open)reader.showModal();
    reader.querySelector("main").scrollTop=0;
  }

  function render() {
    const saved=window.KGReviews.entries();
    const drafts=window.KGReviews.entries(true);
    const list=dialog.querySelector("[data-rv-list]");
    const railOffset=list.querySelector(".kg-rv-rail")?.scrollLeft||0;
    rows=filter==="drafts"?drafts:filter==="all"?[...drafts,...saved]:saved;
    const ratings=saved.map(personalRating).filter(Boolean);
    const episodeCount=saved.filter(row=>kind(row)==="episodes").length;
    dialog.querySelector("[data-rv-episode-stat]").hidden=!episodeCount;
    dialog.querySelector(".kg-rv-section-heading").hidden=fullList;
    dialog.querySelector(".kg-rv-tools").hidden=!fullList;
    dialog.querySelector("[data-rv-all]").hidden=!saved.length&&!drafts.length;
    set("[data-rv-total]",String(saved.length));
    set("[data-rv-average]",ratings.length ? "★ "+scoreFormat.format(ratings.reduce((a,b)=>a+b,0)/ratings.length) : "—");
    set("[data-rv-episodes]",String(episodeCount));
    set("[data-rv-sort] span:last-child",uiText(ascending?"Сначала старые":"Сначала новые"));
    dialog.querySelector("[data-rv-filters]").innerHTML=[...reviewTypes,["drafts","Черновики"]].map(([key,name])=>
      `<button type="button" data-rv-filter="${key}" aria-pressed="${filter===key}">${label(name)} <small>${key==="drafts"?drafts.length:
        key==="all"?saved.length+drafts.length:saved.filter(row=>kind(row)===key).length}</small></button>`).join("");
    const term=normalize(query.value.trim());
    const matches=rows.map((row,index)=>({row,index})).filter(({row})=>
      (filter==="all"||filter==="drafts"||kind(row)===filter) && (!term || normalize([title(row),row.film.original_title,
        row.film._episodeLog?.episode.name,row.note.title,row.note.author,reviewText(row)].join(" ")).includes(term)));
    if(ascending)matches.sort((a,b)=>Number(Boolean(b.row.draft))-Number(Boolean(a.row.draft)) ||
      (a.row.key&&b.row.key?a.row.key.localeCompare(b.row.key):Number(!a.row.key)-Number(!b.row.key)));
    if(!matches.length){
      list.innerHTML=`<p class="kg-rv-empty">${label(rows.length?"Ничего не найдено":
        filter==="drafts"?"У вас пока нет черновиков.":"У вас пока нет рецензий.")}</p>`;
      return;
    }
    const matchingDrafts=matches.filter(({row})=>row.draft);
    const matchingSaved=matches.filter(({row})=>!row.draft);
    const cards=items=>items.map(({row,index})=>entryCard(row,index)).join("");
    const draftHeading=label("Черновики");
    const savedHeading=label("Сохранённые рецензии");
    list.innerHTML=fullList ? `
      ${matchingDrafts.length?`<h2 class="kg-rv-group-title">${draftHeading}</h2>${cards(matchingDrafts)}`:""}
      ${matchingSaved.length?`${matchingDrafts.length?`<h2 class="kg-rv-group-title">${savedHeading}</h2>`:""}${cards(matchingSaved)}`:""}` : `
      ${matchingDrafts.length?`<details class="kg-rv-draft-group" data-rv-drafts ${draftsOpen?"open":""}>
        <summary><span>${draftHeading} <small>${matchingDrafts.length}</small></span>${icon("expand_more")}</summary>
        <div class="kg-rv-list">${cards(matchingDrafts.slice(0,3))}</div>
      </details>`:""}
      ${matchingSaved.length?`<section class="kg-rv-saved-section">
        ${matchingDrafts.length?`<h2 class="kg-rv-group-title">${savedHeading}</h2>`:""}
        <div class="kg-rv-rail" tabindex="0" aria-label="${savedHeading}">${cards(matchingSaved.slice(0,previewSize))}</div>
      </section>`:""}`;
    const rail=list.querySelector(".kg-rv-rail");
    if(rail)rail.scrollLeft=railOffset;
    const group=list.querySelector("[data-rv-drafts]");
    group?.addEventListener("toggle",()=>{if(group.isConnected)draftsOpen=group.open;});
  }

  const itemName = item => item.film.title || item.film.name || item.film.original_title || uiText("Без названия");
  const itemType = item => item.log ? "episodes" : window.KGSeries.isSeriesId(item.film.id) ? "series" : "films";
  function historyChoices() {
    const targets=[...watched,...window.KGSeries.watchedList()].map(film=>({film,time:film.watchedAt}));
    for (const {film,note} of window.KGSeriesDetail.diaryEntries({includePrivate:true})){
      targets.push({film:film._episodeLog.series,log:film._episodeLog,time:note.dateUnknown?null:note.completedAt||note.date});
    }
    const sorted=targets.filter(item=>movieCatalog.allows(item.film))
      .sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));
    const seen=new Set();
    return sorted.filter(item=>{
      const key=item.log?`${item.film.id}:${item.log.season}:${item.log.episode.episode_number}`:item.film.id;
      if(seen.has(key))return false;
      seen.add(key);return true;
    });
  }

  function showChoices(items,empty) {
    choices=pickerMode==="episodes"?items:items.slice(0,32);
    choiceList.innerHTML=choices.length ? choices.map((item,index)=>`
      <button type="button" class="kg-rv-control" data-rv-pick="${index}">
        <span><strong>${esc(itemName(item))}</strong>
        <small>${esc(window.KGReviews.scopeLabel(item.film,item.log))}</small></span>
      </button>`).join("") : `<p class="kg-rv-empty" role="status">${label(empty)}</p>`;
  }

  function renderPicker() {
    const serialSteps=pickerMode==="seasons"||pickerMode==="episodes";
    pickerSearch.closest("label").hidden=serialSteps;
    picker.querySelector("[data-rv-catalog]").textContent=uiText(pickerMode==="history"?"Найти в каталоге":pickerMode==="episodes"?"Назад к сезонам":"К недавним просмотрам");
    const types=picker.querySelector("[data-rv-picker-types]");
    types.hidden=serialSteps;
    types.innerHTML=reviewTypes.map(([type,name])=>
      `<button type="button" data-rv-picker-type="${type}" aria-pressed="${type===pickerType}">${label(name)}</button>`).join("");
    if(serialSteps)return;
    clearTimeout(debounce);
    const sequence=++lookup,query=pickerSearch.value.trim();
    if(pickerMode==="history"){
      const term=normalize(query);
      showChoices(historyChoices().filter(item=>(pickerType==="all"||pickerType===itemType(item))&&(!term||
        normalize([itemName(item),item.film.original_title,window.KGReviews.scopeLabel(item.film,item.log)].join(" ")).includes(term))),
        term?"Ничего не найдено":"Здесь появятся недавние просмотры.");
      return;
    }
    if(!apiKey||query.length<2){
      showChoices([],apiKey?"Введите название для поиска.":"Добавьте ключ TMDB, чтобы искать в каталоге.");return;
    }
    showChoices([],"Ищем точные совпадения…");
    debounce=setTimeout(async()=>{
      const paths=pickerType==="all"?["movie","tv"]:[pickerType==="films"?"movie":"tv"];
      const results=await Promise.allSettled(paths.map(path=>requestTmdb("search/"+path,{language:filmLocale,query})));
      if(sequence!==lookup||!picker.open)return;
      const items=results.flatMap(result=>result.status==="fulfilled"?(result.value.results||[]):[])
        .filter(movieCatalog.allows).sort((a,b)=>(Number(b.popularity)||0)-(Number(a.popularity)||0));
      showChoices(items.map(film=>({film:localizeFilmListItem(film)})),
        results.every(r=>r.status==="rejected")?"Не удалось выполнить поиск.":"Ничего не найдено");
    },240);
  }

  function pickReview(opener=document.activeElement) {
    pickerOpener=opener;pickerType="all";pickerMode="history";pickerSearch.value="";
    picker.showModal();renderPicker();
  }

  async function selectSeries(film) {
    const sequence=++lookup;
    selectedSeries=film;pickerMode="seasons";renderPicker();
    showChoices([],"Загружаем сезоны…");
    try{
      const details=await filmDetails(film.id);
      if(sequence!==lookup||!picker.open)return;
      const seasons=(details.seasons||[]).filter(season=>Number.isInteger(season.season_number));
      choiceList.innerHTML=seasons.length ? seasons.map(season=>
        `<button type="button" class="kg-rv-control" data-rv-season="${season.season_number}">${label("Сезон {season}",{season:season.season_number})}</button>`).join("") :
        `<p class="kg-rv-empty">${label("Сезоны не найдены.")}</p>`;
    }catch{
      if(sequence===lookup&&picker.open)showChoices([],"Не удалось загрузить сезоны.");
    }
  }

  async function selectSeason(season) {
    const sequence=++lookup;
    selectedSeason=season;pickerMode="episodes";renderPicker();
    showChoices([],"Загружаем эпизоды…");
    try{
      const details=await requestTmdb(`tv/${window.KGSeries.rawId(selectedSeries.id)}/season/${selectedSeason}`,{language:filmLocale});
      if(sequence!==lookup||!picker.open)return;
      showChoices((details.episodes||[]).filter(episode=>Number.isInteger(episode.episode_number))
        .map(episode=>({film:selectedSeries,log:{episode,season:selectedSeason}})),"Эпизоды не найдены.");
    }catch{
      if(sequence===lookup&&picker.open)showChoices([],"Не удалось загрузить эпизоды.");
    }
  }

  function edit(row,opener) {
    window.KGReviews.open(filmFor(row),{log:row.film._episodeLog,opener});
  }
  async function share(row,status=dialog.querySelector(".kg-rv-status")) {
    const value=[title(row),row.note.title,reviewText(row)].filter(Boolean).join("\n\n");
    try{
      if(navigator.share)await navigator.share({title:title(row),text:value});
      else {await navigator.clipboard.writeText(value);status.textContent=uiText("Рецензия скопирована.");status.hidden=false;}
    }catch(error){if(error.name!=="AbortError"){status.textContent=uiText("Не удалось поделиться рецензией.");status.hidden=false;}}
  }
  function setView(showAll) {
    fullList=showAll;filter="all";ascending=false;query.value="";
    set("#kg-rv-title",uiText(showAll?"Все рецензии и черновики":"Мои рецензии"));
    render();main.scrollTop=0;
    dialog.querySelector(showAll?"[data-rv-back]":"[data-rv-all]:not([hidden])")?.focus({preventScroll:true});
  }
  query.addEventListener("input",render);
  dialog.addEventListener("cancel",event=>{if(fullList){event.preventDefault();setView(false);}});
  pickerSearch.addEventListener("input",renderPicker);
  picker.addEventListener("close",()=>{if(!picker.open){clearTimeout(debounce);lookup++;}});
  for(const page of [dialog,reader])page.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.hidden=true;},true);
  reader.addEventListener("close",()=>{
    if(reader.open||!reading)return;
    const index=rows.findIndex(row=>!row.draft&&reviewKey(row)===reviewKey(reading));
    const opener=readerOpener?.isConnected ? readerOpener : dialog.querySelector(`[data-rv-open="${index}"]`);
    opener?.focus({preventScroll:true});
    reading=readerOpener=null;
  });
  reader.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button||!reading)return;
    if(button.hasAttribute("data-rv-reader-back"))reader.close();
    else if(button.hasAttribute("data-rv-reader-edit"))edit(reading,button);
    else if(button.hasAttribute("data-rv-reader-share"))share(reading,reader.querySelector("[role=status]"));
    else if(button.hasAttribute("data-rv-reader-subject")){
      const log=reading.film._episodeLog;
      if(log)window.KGEpisodePage.open(log.series,log.episode,log.season,{opener:button});
      else window.KGFilmCard.openDialog(window.KGFilmCard.savedFilm(reading.film),button);
    }
  });
  picker.addEventListener("click",event=>{
    const b=event.target.closest("button");
    if(!b)return;
    const {rvPick,rvPickerType,rvSeason}=b.dataset;
    if(b.hasAttribute("data-rv-picker-back"))picker.close();
    else if(rvPickerType){
      pickerType=rvPickerType;renderPicker();
      picker.querySelector(`[data-rv-picker-type="${pickerType}"]`)?.focus({preventScroll:true});
    }else if(rvSeason!==undefined)selectSeason(Number(rvSeason));
    else if(b.hasAttribute("data-rv-catalog")){
      if(pickerMode==="episodes")selectSeries(selectedSeries);
      else {pickerMode=pickerMode==="history"?"catalog":"history";renderPicker();}
    }else if(rvPick!==undefined){
      const item=choices[Number(rvPick)];if(!item)return;
      if(pickerMode==="catalog"&&pickerType==="episodes"){selectSeries(item.film);return;}
      picker.close();
      window.KGReviews.open(item.film,{log:item.log,opener:pickerOpener});
    }
  });
  dialog.addEventListener("click",event=>{
    const b=event.target.closest("button");
    if(!b)return;
    const {rvFilter,rvEdit,rvShare,rvOpen}=b.dataset;
    if(b.hasAttribute("data-rv-back")){if(fullList)setView(false);else dialog.close();}
    else if(b.hasAttribute("data-rv-all"))setView(true);
    else if(b.hasAttribute("data-rv-new"))pickReview(b);
    else if(b.hasAttribute("data-rv-sort")){ascending=!ascending;render();}
    else if(rvFilter){filter=rvFilter;render();dialog.querySelector(`[data-rv-filter="${filter}"]`).focus({preventScroll:true});
    }else{
      const row=rows[Number(rvEdit??rvShare??rvOpen)];
      if(!row)return;
      if(rvEdit!==undefined)edit(row,b);
      else if(rvShare!==undefined)share(row);
      else readReview(row,b);
    }
  });
  for(const event of ["kg:diary-note-change","kg:episode-note-change","kg:review-change"])document.addEventListener(event,()=>{
    if(dialog.open)render();
    if(!reader.open||!reading)return;
    const updated=window.KGReviews.entries().find(row=>reviewKey(row)===reviewKey(reading));
    if(updated){reading=updated;renderReader();}
    else reader.close();
  });
  window.KGOpenReviewPicker=pickReview;
  window.KGOpenReviews=()=>{
    dialog.querySelector(".kg-rv-status").hidden=true;
    setView(false);
    if(!dialog.open)dialog.showModal();
    main.scrollTop=0;
  };
})();
