/* Personal favorites, separate from watched history and bookmarks. */
(() => {
  const KEY='kgFavorites.v1';let dialog,filter='all';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=()=>'<svg class="kg-favorite-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const isSeries=id=>window.KGSeries?.isSeriesId(id)??(Number(id)>1e12&&Number(id)<1e12+2147483648);
  function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
  function snapshot(f){
    const id=Number(f?.id);if(!Number.isSafeInteger(id)||id<=0||!movieCatalog.allows({...f,id})||f.media_type==='person')return null;
    return {id,adult:false,media_type:isSeries(id)?'tv':'movie',title:f.title||f.name||f.original_title||f.original||uiText(isSeries(id)?'Сериал':'Фильм'),original_title:f.original_title||f.originalTitle||f.original_name||f.original||'',release_date:f.release_date||f.release||f.first_air_date||String(f.year||''),poster_path:f.localizedPoster?.path||f.poster_path||f.poster||'',backdrop_path:f.backdrop_path||'',vote_average:Number(f.average??f.vote_average??f.score)||0,overview:String(f.overview||'').slice(0,500),runtime:Number(f.runtime)||0,number_of_seasons:Number(f.number_of_seasons)||0,genre_ids:Array.isArray(f.genre_ids)?f.genre_ids.filter(Number.isSafeInteger):[],genres:Array.isArray(f.genres)?f.genres.filter(g=>typeof g==="string").slice(0,12):[],director:f.director||f.dirs?.[0]||f.created_by?.[0]?.name||"",_cc:f._cc||f.cc||''};
  }
  function list(){return Object.values(read()).filter(f=>Number.isSafeInteger(Number(f?.id))&&movieCatalog.allows(f)).sort((a,b)=>(Date.parse(b.favoritedAt)||0)-(Date.parse(a.favoritedAt)||0));}
  const has=id=>!!read()[Number(id)];
  const label=enabled=>uiText(enabled?'Убрать из любимых':'Добавить в любимые');
  function button(f){const film=snapshot(f);if(!film)return '';const enabled=has(film.id);return `<button type="button" class="kg-favorite-button" data-kg-favorite="${film.id}" data-kg-favorite-film="${esc(encodeURIComponent(JSON.stringify(film)))}" aria-pressed="${enabled}" aria-label="${esc(label(enabled))}" title="${esc(label(enabled))}">${icon()}</button>`;}
  function paint(){document.querySelectorAll('[data-kg-favorite]').forEach(b=>{const enabled=has(b.dataset.kgFavorite);b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',label(enabled));b.title=label(enabled);});}
  function toggle(f){
    const id=Number(f?.id);if(!Number.isSafeInteger(id)||id<=0)return false;const records=read(),enabled=!records[id];
    if(enabled){const record=snapshot(f);if(!record)return false;records[id]={...record,favoritedAt:new Date().toISOString()};}else delete records[id];
    localStorage.setItem(KEY,JSON.stringify(records));paint();render();document.dispatchEvent(new CustomEvent('kg:favorite-change',{detail:{id,enabled,mediaType:isSeries(id)?'tv':'movie'}}));return enabled;
  }
  const glyph=name=>`<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const labelText=(key,params)=>esc(uiText(key,params));
  const categories=[["all","Все","collections_bookmark"],["films","Фильмы","movie"],["series","Сериалы","tv"],["people","Персоны","person"]];
  const sortOptions=[["added","По дате добавления"],["rating","По рейтингу"],["title","По названию"]];
  const meta=new Map(),peopleDetails=new Map(),peopleLoading=new Set();
  let peopleFilter="all";
  let peopleDates;
  let genre="",layout="list",visible=[],generation=0;
  const count=(n,text)=>labelText(text,{count:n.toLocaleString(interfaceLanguage)});
  const poster=(path,size)=>/^\/[\w.-]+$/.test(path||"") ? "https://image.tmdb.org/t/p/"+size+path : "";
  const genresOf=f=>{
    const names=Array.isArray(f.genres)?f.genres.filter(g=>typeof g==="string"):[];
    const dictionary=isSeries(f.id) ? window.KGSeries.genreLabels : GENRES;
    return [...new Set([...names,...(Array.isArray(f.genre_ids)?f.genre_ids:[]).map(id=>dictionary[id]).filter(Boolean)].map(name=>uiText(name)))];
  };
  const inCategory=(f,key)=>key==="all" || (key==="series")===isSeries(f.id);
  const rating=f=>Number(f.vote_average)||0;

  function cardArt(f,{title=f.title,subtitle=""}={}) {
    const tv=isSeries(f.id);
    const [image,...fallbacks]=[...new Set([
      poster(f.backdrop_path,"w780"),
      poster(f.localizedPoster?.path,"w500"),
      poster(f.poster_path || f.poster,"w500")
    ].filter(Boolean))];
    const year=/^\d{4}/.test(f.release_date||"") ? String(f.release_date).slice(0,4) : "";
    const runtime=Number(f.runtime);
    const length=tv && Number(f.number_of_seasons)>0
      ? uiText("Сезонов: {count}",{count:f.number_of_seasons})
      : !tv && runtime>0 ? uiText("{minutes} мин",{minutes:runtime}) : "";
    return `<span class="kg-favorites-art">
      ${image ? `<img src="${image}" alt="" loading="lazy" decoding="async" data-saved-art="${esc(fallbacks.join(" "))}">` : ""}${icon()}
      <span class="kg-favorites-meta"><small>${labelText(tv?"Сериал":"Фильм")}</small>${year||length?`<small>${esc([year,length].filter(Boolean).join(" · "))}</small>`:""}</span>
      ${rating(f)>0 ? `<small class="kg-favorites-score"><span aria-hidden="true">★</span> ${rating(f).toFixed(1)}</small>` : ""}
      <span class="kg-favorites-caption"><strong>${esc(title)}</strong>${subtitle?`<small>${esc(subtitle)}</small>`:""}</span>
    </span>`;
  }

  function recoverCardArt(event) {
    const image=event.target;
    if (!image.matches?.("img[data-saved-art]")) return;
    const [next,...fallbacks]=image.dataset.savedArt.split(" ").filter(Boolean);
    if (!next) {image.hidden=true;return;}
    image.dataset.savedArt=fallbacks.join(" ");
    image.src=next;
  }

  function favoriteCard(f,notes) {
    const tv=isSeries(f.id);
    const credit=f.director ? uiText(tv?"Создатель: {name}":"Реж. {name}",{name:f.director}) : "";
    const subtitle=[f.original_title!==f.title&&f.original_title,credit].filter(Boolean).join(" · ");
    const overview=String(f.overview||"").trim();
    const note=notes[f.id];
    const tags=genresOf(f).slice(0,3);
    return `<article class="kg-favorites-row">
      <button type="button" class="kg-favorites-open" data-favorite-open="${esc(f.id)}" aria-label="${esc(f.title)}">
        ${cardArt(f,{subtitle})}
        ${overview||tags.length ? `<span class="kg-favorites-copy">
          ${overview?`<span class="kg-favorites-overview">${esc(overview)}</span>`:""}
          ${tags.length?`<span class="kg-favorites-tags">${tags.map(t=>`<span>${esc(t)}</span>`).join("")}</span>`:""}
        </span>` : ""}
      </button>
      <footer>
        ${note?.title ? `<button class="kg-favorites-note" type="button" data-favorites-note="${esc(f.id)}">${glyph("edit_note")}<span>${esc(note.title)}</span></button>` : ""}
        <button class="kg-favorites-control" type="button" data-favorite-open="${esc(f.id)}">${glyph("play_arrow")}${labelText("Смотреть")}</button>
        ${button(f)}
      </footer>
    </article>`;
  }

  function peopleCard(saved){
    const {id,favorite,follow}=saved;
    const data=peopleDetails.get(id);
    const name=data?.name||saved.name||uiText("Профиль TMDB #{id}",{id});
    const role=data?.role||saved.role||"Кинематографист";
    const photo=poster(data?.profilePath||saved.profilePath,"w185");
    const upcoming=follow?(data?.upcoming||[]).slice(0,3):[];
    return `<article class="kg-fv-person">`
      +`<button type="button" class="kg-fv-person-open" data-fv-person="${esc(id)}" data-fv-name="${esc(name)}" data-fv-role="${esc(role)}">
        <span class="kg-fv-person-photo">${glyph("person")}${photo?`<img src="${esc(photo)}" alt="" loading="lazy">`:""}</span>
        <span><strong>${esc(name)}</strong><small>${labelText(role)}</small></span>
      </button>
      <div class="kg-fv-person-actions">
        <button type="button" class="kg-favorites-control" data-fv-person-follow="${esc(id)}" aria-pressed="${Boolean(follow)}">${labelText(follow?"Отслеживаю":"Отслеживать")}</button>
        ${favorite?`<button type="button" class="kg-favorites-control" data-fv-person-favorite="${esc(id)}" aria-label="${labelText("Убрать из любимых")}">${icon()}</button>`:""}
      </div>
      ${follow?`<div class="kg-fv-upcoming"><h3>${labelText("Ближайшие работы")}</h3>
        ${upcoming.length?`<ul>${upcoming.map(film=>{
          const title=film.title||film.name||uiText("Без названия");
          const date=peopleDates.format(new Date(film.release_date+"T12:00:00"));
          return `<li><button type="button" data-fv-work="${esc(film.id)}" data-fv-work-owner="${esc(id)}"><strong>${esc(title)}</strong><small>${esc(date)}</small></button>
            ${window.KGReleaseFollow?.compactButton(film)||""}</li>`;
        }).join("")}</ul>`:`<p>${labelText(data?"Пока нет предстоящих работ с датой.":peopleLoading.has(id)?"Загружаем…":"Не удалось загрузить ближайшие работы.")}</p>`}
      </div>`:""}</article>`;
  }
  async function loadPeople(people){
    if(!apiKey)return;
    const queue=people.filter(person=>!peopleDetails.has(person.id)&&!peopleLoading.has(person.id));
    queue.forEach(person=>peopleLoading.add(person.id));
    const worker=async()=>{
      while(queue.length){
        const {id}=queue.shift();
        try{peopleDetails.set(id,await window.KGPeopleActions.details(id));}catch{}
        finally{peopleLoading.delete(id);}
        if(dialog.open&&filter==="people"){
          const node=dialog.querySelector(`[data-fv-person="${id}"]`)?.closest("article");
          const saved=window.KGPeopleActions.list().find(person=>person.id===id);
          if(node&&saved){
            const active=node.contains(document.activeElement)?document.activeElement:null;
            const focus=active?.hasAttribute("data-fv-person-follow")?"data-fv-person-follow":
              active?.hasAttribute("data-fv-person-favorite")?"data-fv-person-favorite":active?.hasAttribute("data-fv-person")?"data-fv-person":"";
            node.outerHTML=peopleCard(saved);
            if(focus)dialog.querySelector(`[${focus}="${id}"]`)?.focus({preventScroll:true});
          }
        }
      }
    };
    await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));
  }
  function renderPeople(people){
    peopleDates ||= new Intl.DateTimeFormat(interfaceLanguage,{day:"numeric",month:"short",year:"numeric"});
    const root=dialog.querySelector("[data-favorites-people]");
    const shown=people.filter(person=>peopleFilter==="all"||(peopleFilter==="follow"?person.follow:person.favorite));
    root.querySelector(".kg-fv-people-filters").innerHTML=[["all","Все"],["favorite","В любимых"],["follow","Отслеживаю"]].map(([key,text])=>
      `<button type="button" data-fv-people-filter="${key}" aria-pressed="${peopleFilter===key}">${labelText(text)}</button>`).join("");
    loadPeople(shown);
    root.querySelector(".kg-fv-people-list").innerHTML=shown.length?shown.map(peopleCard).join(""):`<div class="kg-favorites-empty">
      <h2>${labelText(people.length?"В этом разделе пока пусто":"Пока нет любимых персон")}</h2>
      <p>${labelText("Добавляйте актёров и режиссёров из «Зала славы» или их профиля.")}</p></div>`;
  }
  function render() {
    if(!dialog?.open)return;
    const main=dialog.querySelector("main"),top=main.scrollTop;
    const items=list().map(f=>({...f,...meta.get(Number(f.id)),id:Number(f.id)}));
    const people=window.KGPeopleActions?.list()||[];
    const showingPeople=filter==="people";
    dialog.querySelector('[data-favorites-movies]').textContent=String(items.filter(f=>!isSeries(f.id)).length);
    dialog.querySelector('[data-favorites-series]').textContent=String(items.filter(f=>isSeries(f.id)).length);
    dialog.querySelector('.kg-favorites-tabs').innerHTML=categories.map(([key,text,symbol])=>`<button type="button" data-favorites-filter="${key}" aria-pressed="${filter===key}">${glyph(symbol)}${labelText(text)} <small>${key==="people"?people.length:items.filter(f=>inCategory(f,key)).length}</small></button>`).join("");
    for(const control of dialog.querySelectorAll("[data-favorites-random],[data-favorites-genres],.kg-favorites-tools,.kg-favorites-list,[data-favorites-settings],[data-favorites-share]"))control.hidden=showingPeople;
    dialog.querySelector("[data-favorites-people]").hidden=!showingPeople;
    if(showingPeople){renderPeople(people);main.scrollTop=top;return;}
    const category=items.filter(f=>inCategory(f,filter));
    const genres=[...new Set(category.flatMap(genresOf))].sort((a,b)=>a.localeCompare(b,interfaceLanguage));
    if(!genres.includes(genre))genre="";
    visible=category.filter(f=>!genre||genresOf(f).includes(genre));
    const sort=dialog.querySelector("select").value;
    if(sort==="rating")visible.sort((a,b)=>rating(b)-rating(a));
    if(sort==="title")visible.sort((a,b)=>a.title.localeCompare(b.title,interfaceLanguage));
    dialog.querySelector('[data-favorites-genres]').innerHTML=["",...genres].map(value=>`<button type="button" data-favorites-genre="${esc(value)}" aria-pressed="${genre===value}">${value?esc(value):labelText("Все жанры")}</button>`).join("");
    dialog.querySelector('[data-favorites-random]').disabled=!visible.length;
    for(const btn of dialog.querySelectorAll("[data-favorites-layout]"))btn.setAttribute("aria-pressed",String(layout===btn.dataset.favoritesLayout));
    const results=dialog.querySelector('.kg-favorites-list');
    results.dataset.layout=layout;
    const notes=store.get("kgCinemaDiaryNotes",{})||{};
    results.innerHTML=visible.length ? visible.map(f=>favoriteCard(f,notes)).join("") : `<div class="kg-favorites-empty">${icon()}<h2>${labelText(items.length?"В этом разделе пока пусто":"Пока нет любимых")}</h2><p>${labelText("Нажмите на сердечко в карточке фильма или сериала.")}</p></div>`;
    main.scrollTop=top;
  }

  async function hydrate() {
    if(!apiKey)return;
    const token=++generation;
    const queue=list().filter(f=>!meta.has(Number(f.id)) && (!f.backdrop_path || !f.overview || !f.genres?.length));
    const worker=async()=>{
      while(dialog.open && token===generation && queue.length){
        const film=queue.shift(),id=Number(film.id);
        try {
          const d=await filmDetails(id);
          meta.set(id,{backdrop_path:d.backdrop_path||film.backdrop_path,poster_path:d.localizedPoster?.path||d.posterPath||film.poster_path,
            overview:d.overview||film.overview,genres:d.genres?.length?d.genres:film.genres, vote_average:d.average||film.vote_average,
            runtime:d.runtime||film.runtime,number_of_seasons:d.number_of_seasons||film.number_of_seasons,
            director:(isSeries(id)?d.created_by?.[0]?.name:d.dirs?.[0])||film.director});
        }catch{}
      }
    };
    await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));
    if(dialog.open&&token===generation)render();
  }

  async function share(action) {
    const close=dialog.querySelector('[data-favorites-share-sheet]');
    const lines=list().map(f=>f.title);
    if(!lines.length)return;
    const title=uiText("Любимые");
    const content=[title,...lines].join("\n");
    const status=close.querySelector("[data-favorite-status]");
    try{
      if(action==="export"){
        const csv=["Title,Type,Year",...list().map(f=>[f.title,isSeries(f.id)?"Series":"Film",String(f.release_date||"").slice(0,4)]
          .map(value=>'"'+String(value).replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"').join(","))].join("\n");
        const file=new File(["\ufeff",csv],"moven-favorites.csv",{type:"text/csv"});
        if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title});
        else {
          const url=URL.createObjectURL(file),link=document.createElement("a");
          link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
        }
      }else if(action==="share"&&navigator.share)await navigator.share({title,text:content});
      else {await navigator.clipboard.writeText(content);dialog.querySelector("[data-favorites-message]").textContent=uiText("Список скопирован.");}
      close.close();
    }catch(error){if(error.name!=="AbortError")status.textContent=uiText("Не удалось поделиться списком любимых.");}
  }

  function open() {
    if(!dialog){
      dialog=document.createElement("dialog");dialog.id="kg-favorites";dialog.setAttribute("aria-labelledby","kg-favorites-title");
      dialog.innerHTML=`<div class="kg-favorites-shell"><header>
        <button type="button" class="kg-favorites-control" data-favorites-back autofocus aria-label="${labelText("Назад")}">${glyph("arrow_back")}</button>
        <h1 id="kg-favorites-title">${labelText("Любимые")}</h1>
        <button type="button" class="kg-favorites-control" data-favorites-share aria-label="${labelText("Поделиться коллекцией")}">${glyph("share")}</button>
        <button type="button" class="kg-favorites-control" data-favorites-settings aria-label="${labelText("Сортировка")}">${glyph("tune")}</button>
        <button type="button" class="kg-favorites-control" data-favorites-profile aria-label="${labelText("Профиль")}">${glyph("person")}</button>
      </header><main>
        <section class="kg-favorites-hero">
          <h2>${labelText("Любимые")}${icon()}</h2>
          <p>${labelText("Фильмы и сериалы, к которым хочется возвращаться.")}</p>
          <div class="kg-favorites-metrics"><div>${glyph("movie")}<span><strong data-favorites-movies></strong><small>${labelText("Фильмы")}</small></span></div>
          <div>${glyph("tv")}<span><strong data-favorites-series></strong><small>${labelText("Сериалы")}</small></span></div></div>
        </section>
        <div class="kg-favorites-tabs kg-favorites-chips" aria-label="${labelText("Тип контента")}"></div>
        <button class="kg-favorites-control kg-favorites-random" type="button" data-favorites-random>${glyph("casino")}${labelText("Случайный фильм или сериал")}</button>
        <div class="kg-favorites-chips" data-favorites-genres aria-label="${labelText("Жанры")}"></div>
        <div class="kg-favorites-tools">
          <label class="kg-favorites-sort"><span>${labelText("Сортировка")}</span><select aria-label="${labelText("Сортировка")}">${sortOptions.map(([key,text])=>`<option value="${key}">${labelText(text)}</option>`).join("")}</select>${glyph("expand_more")}</label>
          <div class="kg-favorites-layout"><button type="button" data-favorites-layout="list" aria-label="${labelText("Список")}">${glyph("view_list")}</button><button type="button" data-favorites-layout="grid" aria-label="${labelText("Плитки")}">${glyph("grid_view")}</button></div>
        </div>
        <p data-favorites-message role="status"></p>
        <div class="kg-favorites-list"></div>
        <section data-favorites-people hidden>
          <div class="kg-favorites-chips kg-fv-people-filters" role="group" aria-label="${labelText("Персоны")}"></div>
          <div class="kg-fv-people-list"></div>
        </section>
      </main></div>
      <dialog class="kg-favorites-share" data-favorites-share-sheet aria-labelledby="kg-favorites-share-title">
        <h2 id="kg-favorites-share-title">${labelText("Поделиться коллекцией")}</h2>
        <button class="kg-favorites-control" type="button" data-favorites-export="share">${glyph("share")}${labelText("Поделиться списком")}</button>
        <button class="kg-favorites-control" type="button" data-favorites-export="copy">${labelText("Скопировать список")}</button>
        <button class="kg-favorites-control" type="button" data-favorites-export="export">${labelText("Экспорт CSV")}</button>
        <p data-favorite-status role="status"></p>
        <button class="kg-favorites-control" type="button" data-favorites-share-close>${labelText("Закрыть")}</button>
      </dialog>`;
      document.body.append(dialog);
      const shareSheet=dialog.querySelector('[data-favorites-share-sheet]');
      dialog.querySelector("select").addEventListener("change",render);
      dialog.addEventListener("error",event=>{
        if(event.target.matches?.(".kg-fv-person-photo img"))event.target.remove();
        else recoverCardArt(event);
      },true);
      dialog.addEventListener("click",event=>{
        const b=event.target.closest("button");
        if(!b)return;
        const {favoritesFilter,favoritesGenre,favoritesLayout,favoriteOpen,favoritesNote,favoritesExport,
          fvPeopleFilter,fvPerson,fvName,fvRole,fvPersonFollow,fvPersonFavorite,fvWork,fvWorkOwner}=b.dataset;
        if(b.hasAttribute("data-favorites-back"))dialog.close();
        else if(b.hasAttribute("data-favorites-share")&&list().length){shareSheet.querySelector("[data-favorite-status]").textContent="";shareSheet.showModal();}
        else if(b.hasAttribute("data-favorites-share-close"))shareSheet.close();
        else if(favoritesExport)share(favoritesExport);
        else if(b.hasAttribute("data-favorites-settings")){const select=dialog.querySelector("select");select.scrollIntoView({block:"nearest"});select.focus({preventScroll:true});}
        else if(b.hasAttribute("data-favorites-profile")){dialog.close();window.KGOpenAccountPage("register");}
        else if(favoritesFilter){filter=favoritesFilter;genre="";render();dialog.querySelector(`[data-favorites-filter="${filter}"]`).focus({preventScroll:true});}
        else if(fvPeopleFilter){
          peopleFilter=fvPeopleFilter;render();
          dialog.querySelector(`[data-fv-people-filter="${peopleFilter}"]`)?.focus({preventScroll:true});
        }
        else if(fvPerson)window.KGOpenPersonProfile(Number(fvPerson),fvName,fvRole,b);
        else if(fvPersonFollow||fvPersonFavorite){
          try{
            if(fvPersonFollow)window.KGPeopleActions.setFollow(Number(fvPersonFollow),b.getAttribute("aria-pressed")!=="true");
            else window.KGSetPersonFavorite(Number(fvPersonFavorite),false);
          }catch{dialog.querySelector("[data-favorites-message]").textContent=uiText("Изменения не сохранены");}
          if(fvPersonFollow)dialog.querySelector(`[data-fv-person-follow="${fvPersonFollow}"]`)?.focus({preventScroll:true});
        }
        else if(fvWork){
          const film=peopleDetails.get(Number(fvWorkOwner))?.upcoming.find(item=>item.id===Number(fvWork));
          if(film)window.KGFilmCard.openDialog(film,b);
        }
        else if(favoritesGenre!==undefined){genre=favoritesGenre;render();}
        else if(favoritesLayout){layout=favoritesLayout;store.set("kgFavoritesLayout",layout);render();}
        else if(b.hasAttribute("data-favorites-random")&&visible.length)window.KGFilmCard.openDialog(visible[Math.floor(Math.random()*visible.length)],b);
        else if(favoriteOpen||favoritesNote){
          const film=visible.find(f=>f.id===Number(favoriteOpen||favoritesNote));
          if(!film)return;
          if(favoritesNote)window.KGOpenCinemaDiaryNote(film);
          else window.KGFilmCard.openDialog(film,b);
        }
      });
      dialog.addEventListener("close",()=>{if(dialog.open)return;generation++;dialog.__opener?.isConnected&&dialog.__opener.focus({preventScroll:true});});
    }
    dialog.__opener=document.activeElement;
    filter="all";genre="";peopleFilter="all";layout=store.get("kgFavoritesLayout","list")==="grid"?"grid":"list";
    if(!dialog.open)dialog.showModal();
    render();dialog.querySelector("main").scrollTop=0;hydrate();
  }
  document.addEventListener('kg:person-action-change',render);
  document.addEventListener('click',event=>{const target=event.target.closest('[data-kg-favorite]');if(!target)return;event.preventDefault();event.stopPropagation();try{toggle(JSON.parse(decodeURIComponent(target.dataset.kgFavoriteFilm)));}catch{const host=target.closest('.kg-film-detail')||dialog;if(host){let status=host.querySelector('[data-favorite-status]');if(!status){status=document.createElement('p');status.dataset.favoriteStatus='';status.setAttribute('role','status');host.append(status);}status.textContent=uiText('Не удалось изменить список любимых.');}}},true);
  window.KGFavorites={button,icon,has,toggle,list,snapshot,open,cardArt,recoverCardArt};
})();
