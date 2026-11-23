/* A shared entrance to the director and actor catalogues. */
(() => {
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label=(text,params)=>esc(uiText(text,params));
  const art=(path,size)=>/^\/[\w.-]+$/.test(path||"")?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const tabs={
    directors:{name:"Режиссёры",role:"Режиссёр",department:"Directing",feature:"Режиссёр месяца",title:"Легенды и создатели",people:[525,137427,7467,7399]},
    actors:{name:"Актёры",role:"Актёр",department:"Acting",feature:"Актёр месяца",title:"Иконы и лица эпохи",people:[2037,3894,6193,5064]}
  };
  const directorJob=credit=>/^(director|co-director|series director)$/i.test(credit.job||"");
  const fold=value=>String(value||"").toLocaleLowerCase(interfaceLanguage).normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  const surname=name=>fold(String(name||"").trim().split(/\s+/).at(-1));
  const yearOf=film=>String(film.release_date||film.first_air_date||"").slice(0,4);
  const number=new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});
  const collator=new Intl.Collator(interfaceLanguage);
  const pageSize=16;
  const makeState=()=>({query:"",matches:null,letter:"",sort:"popularity",scroll:0,error:"",limit:pageSize});
  const states={directors:makeState(),actors:makeState()};
  let current=store.get("kgHallTab.v1","directors")==="actors"?"actors":"directors";
  let library={directors:new Map(),actors:new Map()};
  let nextPage=1,loading=null,readyKey=null,hasMore=true,loadError="",searchVersion=0,timer;
  const featured=new Map();
  const mountedWorks=new Map();
  const dialog=document.createElement("dialog");
  dialog.id="kg-hall-of-fame";
  dialog.setAttribute("aria-labelledby","kg-hof-title");
  dialog.innerHTML=`<header class="kg-hof-header">
    <button type="button" data-hof-back aria-label="${label("Назад")}">←</button>
    <h1 id="kg-hof-title">${label("Зал славы")}</h1>
  </header>
  <main class="kg-hof-main">
    <div class="kg-hof-banner">
      <img src="assets/hall-of-fame/directors-banner.png" alt="" data-hof-banner>
      <h2></h2>
    </div>
    <div class="kg-hof-switch" role="group" aria-label="${label("Персоны")}">${Object.entries(tabs).map(([key,tab])=>`<button type="button" data-hof-tab="${key}">${label(tab.name)}</button>`).join("")}</div>
    <div class="kg-hof-heading"><button type="button" data-hof-jump>${label("К каталогу")} <span aria-hidden="true">↓</span></button></div>
    <div data-hof-spotlight></div>
    <section class="kg-hof-catalog" aria-labelledby="kg-hof-catalog-title">
      <div class="kg-hof-catalog-head"><h2 id="kg-hof-catalog-title"></h2>
        <select data-hof-sort aria-label="${label("Сортировка")}">
          <option value="popularity">${label("По популярности")}</option><option value="name">${label("По фамилии")}</option>
        </select>
      </div>
      <form class="kg-hof-search" role="search"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        <input type="search" maxlength="100" autocomplete="off" aria-label="${label("Поиск по имени")}" placeholder="${label("Поиск по имени")}">
        <button type="button" data-hof-clear aria-label="${label("Очистить поиск")}" hidden>×</button>
      </form>
      <div class="kg-hof-letters" role="group" aria-label="${label("По алфавиту")}"></div>
      <p class="kg-hof-status" role="status" hidden></p>
      <div class="kg-hof-results"></div>
      <button type="button" class="kg-hof-more" data-hof-more hidden>${label("Показать ещё")}</button>
    </section>
  </main>`;
  document.body.append(dialog);
  const main=dialog.querySelector("main"),catalog=dialog.querySelector(".kg-hof-catalog");
  const input=catalog.querySelector("input"),sort=catalog.querySelector("select");
  const spotlight=dialog.querySelector("[data-hof-spotlight]"),results=catalog.querySelector(".kg-hof-results");
  const status=catalog.querySelector(".kg-hof-status"),more=catalog.querySelector("[data-hof-more]");
  const catalogStatus=text=>{status.textContent=uiText(text);status.hidden=!text;};
  const locale=interfaceLanguage==="en"?"en-US":"ru-RU";

  function normalizeWork(work){
    return localizeFilmListItem(work.media_type==="tv"?window.KGSeries.normalize(work):work);
  }
  function knownWorks(items){
    return [...new Map(items.filter(f=>Number.isSafeInteger(Number(f.id))&&movieCatalog.allows(f))
      .map(normalizeWork).map(f=>[Number(f.id),f])).values()]
      .sort((a,b)=>(Number(b.vote_count)||0)-(Number(a.vote_count)||0)||(Number(b.popularity)||0)-(Number(a.popularity)||0));
  }
  function cachedPerson(id,mode){
    const key=mode+":"+id;
    if(!featured.has(key)){
      featured.set(key,requestTmdb("person/"+id,{language:locale,append_to_response:"combined_credits"}).then(person=>{
        if(!person.name)throw new Error("Missing person name");
        const biographies=String(person.biography||"").trim().split(/\n\s*\n/);
        const biography=biographies[0].trim();
        const credits=person.combined_credits||{};
        return {...person,biography,works:knownWorks(mode==="directors"?(credits.crew||[]).filter(directorJob):credits.cast||[])};
      }).catch(error=>{featured.delete(key);throw error;}));
    }
    return featured.get(key);
  }
  function addCredits(map,credits,film){
    for(const credit of credits){
      const id=Number(credit.id);
      if(!Number.isSafeInteger(id)||id<=0||credit.adult===true||!credit.name)continue;
      const person=map.get(id)||{...credit,id,works:[]};
      if(!person.works.some(work=>work.id===film.id))person.works.push(film);
      if(!person.profile_path&&credit.profile_path)person.profile_path=credit.profile_path;
      map.set(id,person);
    }
  }
  async function loadCatalogue(){
    if(loading||!hasMore||!apiKey)return;
    loadError="";
    const page=nextPage,key=apiKey;
    loading=(async()=>{
      const responses=await Promise.allSettled(["movie","tv"].map(kind=>requestTmdb("discover/"+kind,{
        language:filmLocale,sort_by:"popularity.desc","vote_count.gte":250,page:String(page)
      })));
      if(responses.every(response=>response.status==="rejected"))throw new Error("No projects");
      const pages=responses.map(response=>response.status==="fulfilled"?response.value:null);
      const films=pages.flatMap((result,index)=>(result?.results||[]).filter(movieCatalog.allows).slice(0,index?8:12).map(normalizeWork));
      let successful=0;
      for(let i=0;i<films.length;i+=5){
        const responses=await Promise.allSettled(films.slice(i,i+5).map(async film=>[film,await requestTmdb("movie/"+film.id+"/credits",{language:locale})]));
        if(key!==readyKey)return;
        for(const response of responses){
          if(response.status!=="fulfilled")continue;
          successful++;
          const [film,credits]=response.value;
          addCredits(library.directors,(credits.crew||[]).filter(directorJob),film);
          addCredits(library.actors,(credits.cast||[]).slice(0,6),film);
        }
        if(dialog.open)renderCatalogue();
      }
      if(films.length&&!successful)throw new Error("No credits");
      nextPage++;
      hasMore=Boolean(films.length)&&pages.some(result=>page<(Number(result?.total_pages)||0));
    })().catch(()=>{loadError="Не удалось загрузить каталог."}).finally(()=>{
      loading=null;
      if(dialog.open)renderCatalogue();
    });
    renderCatalogue();
    return loading;
  }
  function photo(person){
    const url=art(person.profile_path,"w342");
    return `<span class="kg-hof-photo">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2m-3-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
      ${url?`<img src="${url}" alt="" loading="lazy" decoding="async">`:""}
    </span>`;
  }
  function worksMarkup(works,feature=false){
    if(!works.length)return "";
    return `<div class="kg-hof-works${feature?" kg-hof-works-feature":""}">${works.slice(0,3).map(film=>{
      mountedWorks.set(Number(film.id),film);
      const title=film.title||film.name||uiText("Без названия");
      const wide=art(film.backdrop_path,"w780")||art(film.poster_path,"w342");
      const frame=feature
        ?`<span class="kg-film-grid-poster">${window.KGCollectionPoster(film,"w342")}</span>`
        :`<span class="kg-hof-still">${wide?`<img alt="" src="${wide}" loading="lazy" decoding="async">`:""}</span>`;
      return `<button type="button" data-hof-work="${Number(film.id)}" title="${esc(title)}">
        ${frame}<span class="kg-hof-work-title">${esc(title)}</span></button>`;
    }).join("")}</div>`;
  }
  function renderFeature(person,mode){
    const description=person.biography.length>300?person.biography.slice(0,300).replace(/\s+\S*$/,"")+"…":person.biography;
    const dates=person.works.map(yearOf).filter(Boolean).sort();
    const scores=person.works.filter(film=>Number(film.vote_count)>0&&Number(film.vote_average)>0);
    const average=scores.length?number.format(scores.reduce((sum,film)=>sum+Number(film.vote_average),0)/scores.length):"";
    const backdrop=art(person.works.find(film=>film.backdrop_path)?.backdrop_path,"w780");
    spotlight.innerHTML=`<article class="kg-hof-spotlight">${backdrop?`<img class="kg-hof-backdrop" src="${backdrop}" alt="">`:""}
      <div class="kg-hof-spot-copy"><small class="kg-hof-feature-label">${label(tabs[mode].feature)}</small>
        <div class="kg-hof-identity">${photo(person)}<div><h3>${esc(person.name)}</h3>
          ${description?`<p>${esc(description)}</p>`:""}</div></div>
        <div class="kg-hof-metrics">${person.works.length?`<span>${label("Работ: {count}",{count:number.format(person.works.length)})}</span>`:""}
          ${average?`<span>★ ${average} TMDB</span>`:""}${dates.length?`<span>${dates[0]}${dates.at(-1)!==dates[0]?"–"+dates.at(-1):""}</span>`:""}</div>
        ${person.works.length?`<h4>${label("Знаковые работы")}</h4>${worksMarkup(person.works,true)}`:""}
        <button class="kg-hof-primary" type="button" data-hof-person="${Number(person.id)}" data-hof-name="${esc(person.name)}">${label("Открыть профиль")} →</button>
      </div></article>`;
  }
  async function loadFeature(){
    const mode=current,date=new Date(),pool=tabs[mode].people;
    const id=pool[(date.getFullYear()*12+date.getMonth())%pool.length];
    if(!apiKey){spotlight.replaceChildren();return;}
    spotlight.innerHTML=`<p class="kg-hof-status">${label("Загружаем…")}</p>`;
    try{
      const person=await cachedPerson(id,mode);
      if(dialog.open&&current===mode)renderFeature(person,mode);
    }catch{if(dialog.open&&current===mode)spotlight.replaceChildren();}
  }
  function renderCatalogue(){
    const state=states[current],query=state.query.trim();
    const listing=query.length>=2?(state.matches||[]):[...library[current].values()];
    const letters=[...new Set(listing.map(person=>surname(person.name).charAt(0)).filter(Boolean))].sort(collator.compare);
    const alphabet=catalog.querySelector(".kg-hof-letters");
    alphabet.hidden=!letters.length;
    if(!letters.includes(state.letter))state.letter="";
    alphabet.innerHTML=["",...letters].map(letter=>`<button type="button" data-hof-letter="${esc(letter)}" aria-pressed="${state.letter===letter}">${letter?esc(letter.toLocaleUpperCase(interfaceLanguage)):label("Все")}</button>`).join("");
    const favorites=new Set(window.KGFavoritePersonIds());
    const people=listing.filter(person=>!state.letter||surname(person.name).startsWith(state.letter)).sort((a,b)=>{
      if(state.sort==="name")return collator.compare(surname(a.name),surname(b.name));
      return Number(b.popularity||0)-Number(a.popularity||0);
    });
    results.innerHTML=people.slice(0,state.limit).map(person=>{
      const active=favorites.has(person.id);
      return `<article class="kg-hof-card">
        <div class="kg-hof-card-head"><button type="button" class="kg-hof-person" data-hof-person="${person.id}" data-hof-name="${esc(person.name)}">${photo(person)}<strong>${esc(person.name)}</strong></button>
          <button class="kg-hof-favorite" type="button" data-hof-favorite="${person.id}" aria-pressed="${active}">${label(active?"В любимых":"В любимые")}</button></div>
        ${worksMarkup(person.works)}
      </article>`;
    }).join("");
    const defaultView=query.length<2;
    more.hidden=!apiKey||(people.length<=state.limit&&(!defaultView||!hasMore));
    more.dataset.hofLocal=String(people.length>state.limit);
    more.disabled=Boolean(loading)&&more.dataset.hofLocal!=="true";
    more.textContent=uiText(more.disabled?"Загружаем…":loadError&&more.dataset.hofLocal!=="true"?"Повторить":"Показать ещё");
    const message=!apiKey?"Добавьте ключ TMDB в настройках, чтобы искать фильмы и людей.":
      people.length?"":defaultView?(loading?"Загружаем…":loadError||"Ничего не найдено"):state.matches===null?"Ищем точные совпадения…":state.error||"Ничего не найдено";
    catalogStatus(message);
  }
  function search(){
    const mode=current,state=states[mode],value=state.query.trim(),token=++searchVersion;
    clearTimeout(timer);
    state.matches=null;
    state.error="";
    state.letter="";state.limit=pageSize;
    renderCatalogue();
    if(value.length<2||!apiKey)return;
    timer=setTimeout(async()=>{
      try{
        const data=await requestTmdb("search/person",{query:value,language:locale,page:"1"});
        if(token!==searchVersion)return;
        state.matches=(data.results||[]).filter(person=>person.known_for_department===tabs[mode].department||library[mode].has(person.id))
          .map(person=>({...person,works:knownWorks(library[mode].get(person.id)?.works||person.known_for||[])}));
      }catch{
        if(token!==searchVersion)return;
        state.matches=[];state.error="Не удалось выполнить поиск.";
      }
      renderCatalogue();
    },240);
  }
  function paintTab(){
    dialog.querySelectorAll("[data-hof-tab]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.hofTab===current)));
    dialog.querySelector(".kg-hof-banner h2").textContent=uiText(tabs[current].title);
    const banner=dialog.querySelector("[data-hof-banner]");
    const bannerPath=`assets/hall-of-fame/${current}-banner.png`;
    if(banner.getAttribute("src")!==bannerPath)banner.src=bannerPath;
    catalog.querySelector("h2").textContent=uiText(tabs[current].name);
    const state=states[current];
    input.value=state.query;
    sort.value=state.sort;
    catalog.querySelector("[data-hof-clear]").hidden=!state.query;
    renderCatalogue();
    loadFeature();
    if(state.query.trim().length>=2&&state.matches===null)search();
  }
  dialog.addEventListener("error",event=>{if(event.target.tagName==="IMG"&&!event.target.hasAttribute("data-collection-poster"))event.target.remove();},true);
  dialog.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button)return;
    const {hofTab,hofLetter,hofPerson,hofName,hofWork,hofFavorite}=button.dataset;
    if(button.hasAttribute("data-hof-back"))dialog.close();
    else if(hofTab&&hofTab!==current){
      states[current].scroll=main.scrollTop;
      clearTimeout(timer);searchVersion++;
      current=hofTab;store.set("kgHallTab.v1",current);
      paintTab();main.scrollTop=states[current].scroll;
    }else if(button.hasAttribute("data-hof-jump")){
      catalog.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    }else if(button.hasAttribute("data-hof-clear")){input.value="";input.dispatchEvent(new Event("input"));input.focus();}
    else if(button.hasAttribute("data-hof-more")){
      const state=states[current];
      if(button.dataset.hofLocal==="true"){state.limit+=pageSize;renderCatalogue();}
      else {state.limit+=pageSize;loadCatalogue();}
    }
    else if(hofLetter!==undefined){states[current].letter=hofLetter;states[current].limit=pageSize;renderCatalogue();catalog.querySelector(`[data-hof-letter="${CSS.escape(hofLetter)}"]`)?.focus({preventScroll:true});}
    else if(hofPerson)window.KGOpenPersonProfile(Number(hofPerson),hofName,tabs[current].role,button);
    else if(hofWork){const film=mountedWorks.get(Number(hofWork));if(film)window.KGFilmCard.openDialog(film,button);}
    else if(hofFavorite){
      try{window.KGSetPersonFavorite(Number(hofFavorite),button.getAttribute("aria-pressed")!=="true");}
      catch{catalogStatus("Изменения не сохранены");}
    }
  });
  catalog.querySelector("form").addEventListener("submit",event=>{event.preventDefault();});
  input.addEventListener("input",()=>{states[current].query=input.value;catalog.querySelector("[data-hof-clear]").hidden=!input.value;search();});
  sort.addEventListener("change",()=>{states[current].sort=sort.value;renderCatalogue();});
  dialog.addEventListener("close",()=>{states[current].scroll=main.scrollTop;clearTimeout(timer);searchVersion++;});
  document.addEventListener("kg:favorite-person-change",()=>{
    if(!dialog.open)return;
    const favorites=new Set(window.KGFavoritePersonIds());
    results.querySelectorAll("[data-hof-favorite]").forEach(button=>{
      const active=favorites.has(Number(button.dataset.hofFavorite));
      button.setAttribute("aria-pressed",String(active));button.textContent=uiText(active?"В любимых":"В любимые");
    });
  });
  window.KGHallOfFame={open(){
    if(dialog.open)return;
    if(readyKey!==apiKey){readyKey=apiKey;library={directors:new Map(),actors:new Map()};nextPage=1;hasMore=true;loadError="";featured.clear();}
    window.KGFilmCard?.stopTrailers();
    window.KGMountBottomNav(dialog,dialog,"hall");
    dialog.showModal();paintTab();main.scrollTop=states[current].scroll;
    if(nextPage===1)loadCatalogue();
  }};
})();
