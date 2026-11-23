/* Shared TMDB person profiles and related-film carousels. */
(function(){
  const pools=new Map(),relatedCache=new Map(),personCache=new Map(),personBackdropWarmCache=new Map(),personAltPortraitCache=new Map();
  const personBackdropPreloadTasks=new Map();
  let scrollFrame=0,personScrollFrame=0,personOpenRequest=0;
  const image=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const esc=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function tmdb(path,params={},language="ru-RU"){
    let key="";try{key=apiKey||"";}catch{}
    if(!key)throw new Error("Нужен ключ TMDB");
    const query=new URLSearchParams({...params,api_key:key});
    // Omit language when null: image endpoints can filter out stills tagged
    // with another language or with no language metadata at all.
    if(language)query.set("language",language);
    const response=await movieCatalog.request(`https://api.themoviedb.org/3/${path}?${query}`);
    if(!response.ok)throw new Error(`TMDB ${response.status}`);
    return response.json();
  }
  function warmPersonBackdrop(path,size="w780"){
    if(!path)return Promise.resolve(null);
    const src=`https://image.tmdb.org/t/p/${size}${path}`;
    if(personBackdropWarmCache.has(src))return personBackdropWarmCache.get(src);
    const promise=new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>resolve(null);
      img.src=src;
      if(img.complete)resolve(img.naturalWidth?img:null);
    }).then(async img=>{
      if(!img){personBackdropWarmCache.delete(src);return null;}
      try{await img.decode();}catch{}
      return img;
    });
    personBackdropWarmCache.set(src,promise);
    return promise;
  }
  async function personAltPortrait(personId,excludePath){
    const key=String(personId||"");
    if(!key)return [];
    if(!personAltPortraitCache.has(key)){
      const request=tmdb(`person/${key}/images`,{},"en-US").then(data=>{
        const profiles=(data.profiles||[])
          .filter(p=>p.file_path)
          .sort((a,b)=>(Number(b.vote_average)||0)-(Number(a.vote_average)||0)||
            (Number(b.vote_count)||0)-(Number(a.vote_count)||0));
        const wide=profiles.filter(p=>(Number(p.aspect_ratio)||0)>=0.9);
        return (wide.length?wide:profiles).map(p=>p.file_path);
      }).catch(error=>{
        personAltPortraitCache.delete(key);
        console.warn("[Moven backdrop] Actor profile images unavailable",{
          personId:key,message:error?.message||String(error)
        });
        return [];
      });
      personAltPortraitCache.set(key,request);
    }
    const paths=await personAltPortraitCache.get(key);
    // Keep one alternate portrait only. If it cannot be loaded, the caller
    // falls back to the person's primary profile_path with stronger blur.
    return paths.filter(path=>path!==excludePath).slice(0,1);
  }
  function preloadPersonBackdrop(personId,mainProfilePath=null){
    const key=String(personId||"");
    if(!key)return Promise.resolve(null);
    const taskKey=`${key}:${mainProfilePath||""}`;
    if(personBackdropPreloadTasks.has(taskKey))return personBackdropPreloadTasks.get(taskKey);
    const task=Promise.resolve(mainProfilePath).then(async path=>{
      const preferred=path?await warmPersonBackdrop(path,"h632"):null;
      if(preferred)return preferred;
      const [alternate]=await personAltPortrait(key,path);
      return alternate?warmPersonBackdrop(alternate,"h632"):null;
    }).catch(error=>{
      personBackdropPreloadTasks.delete(taskKey);
      throw error;
    });
    personBackdropPreloadTasks.set(taskKey,task);
    return task;
  }
  function ensureStyles(){
    if(document.getElementById("kg-film-interactions-style"))return;
    const style=document.createElement("style");style.id="kg-film-interactions-style";
    style.textContent=`.kg-person-link{color:rgb(var(--kg-primary));text-decoration:underline;text-decoration-color:rgb(var(--kg-primary-container)/0.4);text-underline-offset:3px;cursor:pointer}.kg-person-link:hover{color:rgb(var(--kg-accent-text))}.kg-person-card{cursor:pointer;transition:transform .18s,border-color .18s}.kg-person-card:hover{transform:translateY(-2px);border-color:rgb(var(--kg-primary-container))}
[data-kg-related-list]{min-width:0;max-width:100%;scroll-snap-type:x proximity}
.kgpi-film{flex:0 0 120px;min-width:0;scroll-snap-align:start}
.kgpi-film>[data-kg-related-open]{display:block;width:100%;padding:0;border:0;background:none;box-shadow:none;text-align:left}
.kgpi-film .kgpi-poster{display:block;width:100%;aspect-ratio:2/3;overflow:hidden;border-radius:10px}
.kgpi-film .kgpi-poster>img{display:block;width:100%;height:100%;object-fit:cover}
.kgpi-film .kgpi-poster>span{display:grid;place-items:center;width:100%;height:100%;text-align:center}
.kgpi-film-title{overflow-wrap:anywhere}`;
    document.head.appendChild(style);
  }
  function registerPool(key,films){
    if(!key)return;
    if(Array.isArray(films))pools.set(key,films);
    else pools.delete(key);
  }
  function scrollToDescription(element){
    if(!element?.isConnected)return;
    if(scrollFrame)cancelAnimationFrame(scrollFrame);
    const start=window.scrollY,target=Math.max(0,element.getBoundingClientRect().top+start-132),distance=target-start;
    if(matchMedia("(prefers-reduced-motion: reduce)").matches||Math.abs(distance)<8){window.scrollTo({top:target,behavior:"auto"});return;}
    const duration=1150,begin=performance.now();
    const step=now=>{const p=Math.min(1,(now-begin)/duration),eased=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;window.scrollTo({top:start+distance*eased,behavior:"auto"});if(p<1)scrollFrame=requestAnimationFrame(step);else scrollFrame=0;};
    scrollFrame=requestAnimationFrame(step);
  }
  function scrollPersonModalToFilm(element){
    const dialog=modal()?.querySelector(".kgpi-modal");if(!dialog||!element?.isConnected)return;
    if(personScrollFrame)cancelAnimationFrame(personScrollFrame);
    const start=dialog.scrollTop,target=Math.max(0,start+element.getBoundingClientRect().top-dialog.getBoundingClientRect().top-76),distance=target-start;
    if(matchMedia("(prefers-reduced-motion: reduce)").matches||Math.abs(distance)<8){dialog.scrollTop=target;return;}
    const duration=900,begin=performance.now();
    const step=now=>{const p=Math.min(1,(now-begin)/duration),eased=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;dialog.scrollTop=start+distance*eased;if(p<1)personScrollFrame=requestAnimationFrame(step);else personScrollFrame=0;};
    personScrollFrame=requestAnimationFrame(step);
  }
  function filmButton(f){const title=f.title||f.name||uiText("Фильм"),year=(f.release_date||"").slice(0,4);return `<div class="kgpi-film"><button class="w-full text-left" type="button" data-kg-related-open="${f.id}"><span class="kgpi-poster">${image(f.poster_path)?`<img loading="lazy" src="${image(f.poster_path)}" alt="${esc(uiText("Постер «{title}»", {title}))}" onerror="this.style.visibility='hidden'">`:`<span class="flex h-full w-full items-center justify-center text-xs text-[rgb(var(--kg-text-muted))]">${uiText("Нет постера")}</span>`}</span><span class="kgpi-film-title block mt-1 text-xs font-semibold leading-tight">${esc(title)}</span><span class="block text-[10px] text-[rgb(var(--kg-text-muted))]">${year}</span></button></div>`; }
  function modal(){return document.getElementById("kg-person-modal");}
  function closePerson(){
    personOpenRequest++;
    const root=modal();
    if(root?.open)root.close();
    root?.remove();
  }
  function ageFromBirthday(birthday, deathday) {
    if (!birthday) return "—";
    const born = new Date(birthday + "T00:00:00");
    const end = deathday ? new Date(deathday + "T00:00:00") : new Date();
    if (!Number.isFinite(+born) || !Number.isFinite(+end) || end < born) return "—";

    let age = end.getFullYear() - born.getFullYear();
    const beforeBirthday = end.getMonth() < born.getMonth() ||
      (end.getMonth() === born.getMonth() && end.getDate() < born.getDate());
    if (beforeBirthday) age--;

    const lastDigit = age % 10;
    const lastTwo = age % 100;
    const unit = lastTwo >= 11 && lastTwo <= 14 ? "лет" :
      lastDigit === 1 ? "год" : lastDigit >= 2 && lastDigit <= 4 ? "года" : "лет";
    return uiText("{age} " + unit, {age});
  }
  const crewRoles = [
    ["director","Режиссёр"],["producer","Продюсер"],["actor","Актёр"],["writer","Сценарист"],["other","Другие роли"]
  ];
  const roleLabels=Object.fromEntries(crewRoles);
  const personPageSize=12;
  const personIconPaths={
    arrow_back:"m12 5-7 7 7 7M5 12h14",
    chevron:"m9 18 6-6-6-6",
    share:"M12 15V3m-4 4 4-4 4 4M8 10H5v11h14V10h-3",
    star:"m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
    bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
    person:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    pin:"M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    calendar:"M3 5h18v16H3zM3 10h18M8 3v4m8-4v4",
    check:"m5 12 4 4 10-10"
  };
  const symbol=name=>`<svg class="kgpi-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${personIconPaths[name]}"/></svg>`;
  const label=(text,values)=>esc(uiText(text,values));
  const personNumber=new Intl.NumberFormat(interfaceLanguage,{maximumFractionDigits:1});

  function crewRole(credit) {
    const job=credit.job||"";
    if(/^(?:(?:Series |Co-)?Director)$/i.test(job))return "director";
    if(/\bproducer\b/i.test(job))return "producer";
    if(credit.department==="Writing"||/Writer|Screenplay|Teleplay|Story/i.test(job))return "writer";
    return "other";
  }
  function creditRoleText(credit,role) {
    if(role==="actor"&&credit.character)return uiText("Роль: {character}",{character:credit.character});
    if(credit.job==="Executive Producer")return uiText("Исполнительный продюсер");
    if(role==="other"&&credit.job)return credit.job;
    return uiText(roleLabels[role]);
  }
  function mergePersonCredits(data) {
    const projects=new Map();
    for(const kind of ["cast","crew"]){
      for(const credit of data[kind]||[]){
        if(!movieCatalog.allows(credit)||!Number.isSafeInteger(Number(credit.id))||Number(credit.id)<=0)continue;
        const tv=credit.media_type==="tv"||(!credit.media_type&&Boolean(credit.first_air_date||credit.name));
        if(credit.media_type&&!["tv","movie"].includes(credit.media_type))continue;
        const film=localizeFilmListItem(tv?window.KGSeries.normalize(credit):credit);
        const id=Number(film.id),role=kind==="cast"?"actor":crewRole(credit);
        const project=projects.get(id)||{...film,id,media_type:tv?"tv":"movie",_personRoles:new Set(),_personJobs:new Set()};
        if(!project.poster_path)project.poster_path=film.poster_path;
        project._personRoles.add(role);
        project._personJobs.add(creditRoleText(credit,role));
        projects.set(id,project);
      }
    }
    return [...projects.values()];
  }
  function creditCard(f) {
    const tv=f.media_type==="tv",name=f.title||f.name||uiText(tv?"Сериал":"Фильм");
    const original=f.original_title&&f.original_title!==name?f.original_title:"";
    const year=String(f.release_date||f.first_air_date||"").slice(0,4);
    const rating=Number(f.vote_average)||0;
    const watched=window.KGIsFilmWatched?.(f.id),favorite=window.KGFavorites?.has(f.id);
    const genres=genreLine(f).split(", ").filter(Boolean).map(genre=>uiText(genre)).join(", ");
    const countryCodes=[...(f.origin_country||[]),...(f.production_countries||[]).map(country=>country.iso_3166_1)];
    const countries=[...new Set(countryCodes)].filter(Boolean).map(cname).filter(Boolean).join(", ");
    const details=[year,genres,countries].filter(Boolean).join(" · ");
    return `<article class="kgpi-credit-row"><button type="button" class="kgpi-credit-open" data-kg-person-film-open="${f.id}">
      <span class="kg-film-card-poster relative flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high">
        ${window.KGCollectionPoster(f,"w185")}
        ${rating>0?`<span class="absolute top-1 left-1 px-1 py-0.5 rounded bg-surface-panel/90 text-primary-container font-micro-caption text-micro-caption font-bold">${personNumber.format(rating)} ★</span>`:""}
      </span>
      <span class="kgpi-credit-copy"><strong>${esc(name)}</strong>${original?`<small>${esc(original)}</small>`:""}
        <small class="kgpi-credit-kind">${label(tv?"Сериал":f.genre_ids?.includes(99)?"Док. фильм":"Фильм")}</small>
        ${details?`<small class="kgpi-credit-details">${esc(details)}</small>`:""}
        <small>${esc([...f._personJobs].join(", "))}</small>
        ${watched||favorite?`<small class="kgpi-credit-state">${watched?symbol("check"):""}${label(watched?"Просмотрено":"В любимых")}</small>`:""}
      </span>
      ${symbol("chevron")}
    </button>${watched?"":kgBookmarkButton(f)}</article>`;
  }
  const personSortModes=[["new","Сначала новые","calendar"],["rating","По рейтингу","star"]];
  function sortPersonFilms(films,mode) {
    const newest=(a,b)=>String(b.release_date||"").localeCompare(String(a.release_date||""));
    const compare={
      rating:(a,b)=>(Number(b.vote_average)||0)-(Number(a.vote_average)||0)||newest(a,b),
      new:newest
    };
    return [...films].sort(compare[mode]||newest);
  }
  function filterButtons(items,attribute,selected) {
    return items.map(([key,text,count,icon])=>`<button type="button" data-kg-person-${attribute}="${key}"
      aria-pressed="${key===selected}">${icon?symbol(icon):""}<span>${label(text)}${count===undefined?"":` (${personNumber.format(count)})`}</span></button>`).join("");
  }
  function renderPersonFilmography(root) {
    const profile=root._kgPersonProfile;
    if(!profile?.projects)return;
    const {projects,role,type,sort,limit}=profile;
    const roles=[["all","Все",projects.length],...crewRoles.map(([id,text])=>[id,text,projects.filter(f=>f._personRoles.has(id)).length]).filter(([, ,count])=>count)];
    const filtered=sortPersonFilms(projects.filter(f=>(role==="all"||f._personRoles.has(role))&&(type==="all"||f.media_type===type)),sort);
    root.querySelector("[data-kg-person-role-tabs]").innerHTML=filterButtons(roles,"role-filter",role);
    root.querySelector("[data-kg-person-media-tabs]").innerHTML=filterButtons([["all","Все"],["tv","Сериалы"],["movie","Фильмы"]],"media-filter",type);
    root.querySelector("[data-kg-person-sort-tabs]").innerHTML=filterButtons(personSortModes.map(([key,text,icon])=>[key,text,undefined,icon]),"sort",sort);
    root.querySelector("[data-kg-person-credit-total]").textContent=`(${personNumber.format(filtered.length)})`;
    root.querySelector("[data-kg-person-films]").innerHTML=filtered.length?filtered.slice(0,limit).map(creditCard).join(""):
      `<p class="kgpi-person-status" role="status">${label("Ничего не найдено")}</p>`;
    const more=root.querySelector("[data-kg-person-more]");
    more.hidden=filtered.length<=limit;
    more.textContent=more.hidden?"":uiText("Показать ещё ({count})",{count:personNumber.format(filtered.length-limit)});
    root.querySelector("[data-kg-person-count]").textContent=personNumber.format(projects.length);
    const rated=projects.map(f=>Number(f.vote_average)).filter(value=>value>0);
    root.querySelector("[data-kg-person-average]").textContent=rated.length?`★ ${personNumber.format(rated.reduce((sum,r)=>sum+r,0)/rated.length)}`:"—";
    root.querySelector("[data-kg-person-favorites]").textContent=personNumber.format(projects.filter(f=>window.KGFavorites?.has(f.id)).length);
  }
  const personActionsKey="kgPersonActions.v1";
  function paintPersonActions(root) {
    const record=store.get(personActionsKey,{})?.[root.dataset.personId]||{};
    for(const button of root.querySelectorAll("[data-kg-person-action]")){
      const favorite=button.dataset.kgPersonAction==="favorite",enabled=Boolean(record[button.dataset.kgPersonAction]);
      button.setAttribute("aria-pressed",String(enabled));
      const text=uiText(favorite?(enabled?"В любимых авторах":"В любимые авторы"):(enabled?"Отслеживается":"Отслеживать"));
      const caption=button.querySelector("span");
      if(caption)caption.textContent=text;
      else button.setAttribute("aria-label",text);
    }
  }
  function setPersonStatus(root,text) {
    const status=root.querySelector("[data-kg-person-status]");
    status.textContent=uiText(text);status.hidden=!text;
  }
  function paintPortrait(root,src) {
    if(!src)return;
    const host=root.querySelector("[data-kg-person-image]");
    if(host.querySelector("img")?.src===src)return;
    const art=new Image();
    art.alt="";art.decoding="async";
    const token=host._portraitToken=(host._portraitToken||0)+1;
    art.onload=()=>{
      if(!root.isConnected||host._portraitToken!==token)return;
      host.querySelector("img")?.remove();host.append(art);
    };
    art.src=src;
  }
  const biographyPreviewLength=320;
  function paintPersonBiography(root,biography,original="") {
    const section=root.querySelector(".kgpi-person-bio");
    const preview=section.querySelector("[data-kg-person-bio-preview]");
    const details=section.querySelector("details");
    const text=section.querySelector("[data-kg-person-bio-full]");
    const alternate=section.querySelector("[data-kg-person-bio-original]");
    const englishOnly=!biography&&Boolean(original);
    if(englishOnly){biography=original;original="";}
    const language=englishOnly?"en":interfaceLanguage;
    const abbreviated=biography.length>biographyPreviewLength;
    section.hidden=!biography;
    section.querySelector("h2").textContent=uiText(englishOnly?"Биография на английском":"Биография");
    preview.lang=text.lang=language;
    preview.hidden=!biography;
    preview.textContent=abbreviated?biography.slice(0,biographyPreviewLength).replace(/\s+\S*$/,"")+"…":biography;
    text.hidden=!abbreviated;
    text.textContent=abbreviated?biography:"";
    alternate.hidden=!original;
    alternate.querySelector("p").textContent=original;
    details.hidden=!abbreviated&&!original;
  }
  function loadPersonBiography(root,data,path,locale,isCurrent) {
    const biography=String(data.biography||"").trim();
    paintPersonBiography(root,biography);
    if(locale==="en-US"||biography.length>=biographyPreviewLength)return;
    data.englishBiography ||= tmdb(path,{},"en-US").then(profile=>String(profile.biography||"").trim()).catch(()=>{
      delete data.englishBiography;
      return "";
    });
    data.englishBiography.then(original=>{
      if(isCurrent()&&original.length>biography.length)paintPersonBiography(root,biography,original);
    });
  }
  async function showPerson(id,name,role,sourceElement=null){
    id=Number(id);
    if(!Number.isSafeInteger(id)||id<=0)return;
    ensureStyles();closePerson();
    const request=++personOpenRequest;
    const root=document.createElement("dialog");
    root.id="kg-person-modal";root.dataset.personId=id;
    root.setAttribute("aria-labelledby","kgpi-person-title");
    root.autofocus=true;
    root._kgPersonProfile={role:"all",type:"all",sort:"new",limit:personPageSize,projects:null};
    const personName=String(name||"").trim()||uiText("Кинематографист");
    root.innerHTML=`<div class="kgpi-modal">
      <header class="kgpi-person-header">
        <button class="kgpi-person-control" type="button" data-kg-person-close aria-label="${label("Назад")}">${symbol("arrow_back")}</button>
        <p data-kg-person-header>${esc(personName)}</p>
        <button class="kgpi-person-control" type="button" data-kg-person-share aria-label="${label("Поделиться")}">${symbol("share")}</button>
        <button class="kgpi-person-control" type="button" data-kg-person-action="favorite" aria-label="${label("В любимые авторы")}">${symbol("star")}</button>
        <button class="kgpi-person-control kgpi-person-account" type="button" data-kg-person-account aria-label="${label("Личный кабинет")}">${symbol("person")}</button>
      </header>
      <div class="kgpi-person-intro">
        <div data-kg-person-image class="kgpi-person-portrait" aria-hidden="true">${symbol("person")}</div>
        <section class="kgpi-person-copy">
          <h1 id="kgpi-person-title" data-kg-person-title>${esc(personName)}</h1>
          <div class="kgpi-person-meta"><span data-kg-person-original hidden></span><span data-kg-person-age hidden></span><span class="kgpi-person-location" hidden>${symbol("pin")}<span data-kg-person-location></span></span></div>
          <div class="kgpi-person-roles" data-kg-person-roles>${role?`<span>${label(role)}</span>`:""}</div>
          <div data-kg-person-stats class="kgpi-person-stats">
            <div><strong data-kg-person-count>—</strong><small>${label("Проекты")}</small></div>
            <div><strong data-kg-person-average>—</strong><small>${label("Средний балл TMDB")}</small></div>
            <div><strong data-kg-person-favorites>—</strong><small>${label("В моих любимых")}</small></div>
          </div>
          <div class="kgpi-person-actions">
            <button type="button" class="kgpi-person-control" data-kg-person-action="favorite">${symbol("star")}<span></span></button>
            <button type="button" class="kgpi-person-control" data-kg-person-action="follow">${symbol("bell")}<span></span></button>
            <button type="button" class="kgpi-person-control" data-kg-person-share aria-label="${label("Поделиться")}">${symbol("share")}</button>
          </div>
          <p class="kgpi-person-status" data-kg-person-status role="status" hidden></p>
        </section>
      </div>
      <main class="kgpi-person-main">
        <section class="kgpi-person-bio" hidden>
          <h2>${label("Биография")}</h2>
          <p data-kg-person-bio-preview></p>
          <details data-kg-person-bio-details hidden>
            <summary><span>${label("Читать полностью")}</span><span>${label("Свернуть")}</span></summary>
            <p data-kg-person-bio-full hidden></p>
            <div data-kg-person-bio-original lang="en" hidden><h3>${label("Биография на английском")}</h3><p></p></div>
          </details>
        </section>
        <section id="kgpi-person-filmography" class="kgpi-person-filmography">
          <div class="kgpi-person-filters kgpi-person-role-tabs" data-kg-person-role-tabs role="group" aria-label="${label("Профессия")}"></div>
          <div class="kgpi-person-category"><span>${label("Категория")}</span><div class="kgpi-person-filters" data-kg-person-media-tabs role="group" aria-label="${label("Тип контента")}"></div></div>
          <header class="kgpi-person-film-head"><h2>${label("Фильмография")} <small data-kg-person-credit-total></small></h2>
            <div class="kgpi-person-filters" data-kg-person-sort-tabs role="group" aria-label="${label("Сортировка")}"></div></header>
          <div data-kg-person-films class="kgpi-person-films" aria-live="polite"><p class="kgpi-person-status">${label("Загружаем фильмографию…")}</p></div>
          <button type="button" class="kgpi-person-control" data-kg-person-more hidden></button>
        </section>
      </main>
    </div>`;
    const opener=sourceElement||document.activeElement;
    document.body.append(root);root.showModal();
    root.addEventListener("close",()=>{root.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
    root.addEventListener("error",event=>{if(event.target.tagName==="IMG"&&!event.target.hasAttribute("data-collection-poster"))event.target.remove();},true);
    paintPortrait(root,sourceElement?.querySelector?.("img")?.currentSrc||"");
    paintPersonActions(root);
    window.KGFilmCard?.stopTrailers();
    root.addEventListener("click",async event=>{
      const button=event.target.closest("button");
      if(!button)return;
      const {kgPersonAction:action,kgPersonRoleFilter:nextRole,kgPersonMediaFilter:media,kgPersonSort:sort,kgPersonFilmOpen:filmId}=button.dataset;
      const profile=root._kgPersonProfile;
      if(button.hasAttribute("data-kg-person-close")){root.close();return;}
      if(button.hasAttribute("data-kg-person-account")){root.close();window.KGOpenAccountPage?.("register");return;}
      if(action){
        const records=store.get(personActionsKey,{})||{},record=records[id]||{};
        const enabled=!record[action];
        try {
          localStorage.setItem(personActionsKey,JSON.stringify({...records,[id]:{...record,[action]:enabled}}));
          paintPersonActions(root);
          setPersonStatus(root,action==="follow"&&enabled?"Отслеживание сохранено на устройстве.":"");
        } catch {setPersonStatus(root,"Изменения не сохранены");}
      }else if(button.hasAttribute("data-kg-person-share")){
        const title=root.querySelector("[data-kg-person-title]").textContent,url=`https://www.themoviedb.org/person/${id}`;
        try{
          if(navigator.share)await navigator.share({title,url});
          else {await navigator.clipboard.writeText(url);setPersonStatus(root,"Ссылка скопирована");}
        }catch(error){if(error.name!=="AbortError")setPersonStatus(root,"Не удалось поделиться");}
      }else if(nextRole||media||sort){
        if(nextRole)profile.role=nextRole;
        if(media)profile.type=media;
        if(sort)profile.sort=sort;
        profile.limit=personPageSize;renderPersonFilmography(root);
        root.querySelector(nextRole?`[data-kg-person-role-filter="${nextRole}"]`:media?`[data-kg-person-media-filter="${media}"]`:`[data-kg-person-sort="${sort}"]`)?.focus({preventScroll:true});
      }else if(button.hasAttribute("data-kg-person-more")){
        profile.limit+=personPageSize;renderPersonFilmography(root);
      }else if(filmId){
        const film=profile.projects?.find(f=>String(f.id)===filmId);
        if(film)window.KGFilmCard.openDialog({...film,_kgRelatedPool:profile.projects},button);
      }
    });
    const profileLocale=interfaceLanguage==="en"?"en-US":"ru-RU",path=`person/${id}`;
    const current=()=>root.isConnected&&root.open&&request===personOpenRequest;
    const meta=(selector,value)=>{const element=root.querySelector(selector);element.textContent=value;element.hidden=!value;};
    try{
      const cacheKey=`${id}:${profileLocale}:${filmLocale}`;
      let data=personCache.get(cacheKey);
      if(!data){
        const sameLocale=profileLocale===filmLocale;
        data=await tmdb(path,sameLocale?{append_to_response:"combined_credits"}:{},profileLocale);
        if(!current())return;
        personCache.set(cacheKey,data);
      }
      if(!current())return;
      const aliases=Array.isArray(data.also_known_as)?data.also_known_as.filter(value=>typeof value==="string"):[];
      const name=interfaceLanguage==="ru"?[data.name,...aliases].find(value=>/\p{Script=Cyrillic}/u.test(value||""))||data.name||personName:
        data.name||personName;
      const original=[data.name,...aliases].find(value=>value&&value!==name&&/[A-Za-z]/.test(value))||"";
      meta("[data-kg-person-title]",name);
      meta("[data-kg-person-header]",[name,original].filter(Boolean).join(" / "));
      meta("[data-kg-person-original]",original);
      meta("[data-kg-person-age]",data.birthday?ageFromBirthday(data.birthday,data.deathday):"");
      meta("[data-kg-person-location]",data.place_of_birth||"");
      root.querySelector(".kgpi-person-location").hidden=!data.place_of_birth;
      if(/^\/[\w.-]+$/.test(data.profile_path||"")){
        paintPortrait(root,image(data.profile_path,"h632"));
      }else{
        const cached=sourceElement?.dataset?.kgPersonProfile;
        if(/^\/[\w.-]+$/.test(cached||""))paintPortrait(root,image(cached,"h632"));
        else preloadPersonBackdrop(id).then(art=>{if(current()&&art)paintPortrait(root,art.src);}).catch(()=>{});
      }
      loadPersonBiography(root,data,path,profileLocale,current);
      data.combined_credits ||= await tmdb(`${path}/combined_credits`,{},filmLocale);
      if(!current())return;
      const projects=mergePersonCredits(data.combined_credits);
      root._kgPersonProfile.projects=projects;
      const roles=new Set(projects.flatMap(f=>[...f._personRoles]));
      const jobChips=crewRoles.filter(([id])=>id!=="other"&&roles.has(id)).map(([,text])=>text);
      if(projects.some(f=>f._personJobs.has(uiText("Исполнительный продюсер")))&&!jobChips.includes("Исполнительный продюсер"))jobChips.push("Исполнительный продюсер");
      if(jobChips.length)root.querySelector("[data-kg-person-roles]").innerHTML=jobChips.map(text=>`<span>${label(text)}</span>`).join("");
      renderPersonFilmography(root);
    }catch(error){
      if(!current())return;
      root.querySelector("[data-kg-person-films]").textContent=uiText("Не удалось загрузить профиль. Проверьте подключение к TMDB.");
    }
  }
  for(const event of ["kg:watched-change","kg:favorite-change"]){
    document.addEventListener(event,()=>{const root=modal();if(root?.open)renderPersonFilmography(root);});
  }

  async function related(section){
    const id=section.dataset.filmId;if(!id)return;
    const key=section.dataset.contextKey||"",cacheKey=`${id}:${key}`;if(relatedCache.has(cacheKey)){paint(section,relatedCache.get(cacheKey));return;}
    const list=section.querySelector("[data-kg-related-list]");if(!list)return;
    try{
      const pool=pools.get(key),allowed=pool&&section.dataset.globalRelated!=="true"?new Set(pool.map(f=>Number(f.id))):null;
      const data=await tmdb(`movie/${id}/recommendations`,{page:"1"});let results=(data.results||[]).filter(f=>Number(f.id)!==Number(id)&&(!allowed||allowed.has(Number(f.id))));
      if(results.length<8){const similar=await tmdb(`movie/${id}/similar`,{page:"1"});const have=new Set(results.map(f=>Number(f.id)));results=results.concat((similar.results||[]).filter(f=>Number(f.id)!==Number(id)&&!have.has(Number(f.id))&&(!allowed||allowed.has(Number(f.id)))));}
      if(pool&&results.length<8){const have=new Set(results.map(f=>Number(f.id)));const current=pool.find(f=>Number(f.id)===Number(id));const genres=new Set(current&&current.genre_ids||[]);const fallback=pool.filter(f=>Number(f.id)!==Number(id)&&!have.has(Number(f.id))).sort((a,b)=>{const score=f=>(f.genre_ids||[]).filter(g=>genres.has(g)).length*5+(Number(f.vote_average)||0)*.5+(Number(f.popularity)||0)*.01;return score(b)-score(a);});results=results.concat(fallback);}
      results=results.slice(0,14);relatedCache.set(cacheKey,results);paint(section,results);
    }catch(error){list.innerHTML=`<span class="text-xs text-[rgb(var(--kg-text-muted))]">${uiText("Не удалось загрузить похожие фильмы.")}</span>`;console.warn("[Moven] related films:",error);}
  }
  function paint(section,films){const list=section.querySelector("[data-kg-related-list]");if(!list)return;list.innerHTML=films.length?films.map(filmButton).join(""):`<span class="text-xs text-[rgb(var(--kg-text-muted))]">${uiText("В этом списке больше нет похожих фильмов.")}</span>`;}
  // Apply carousel poster sizing on every screen, not just after opening a person profile.
  ensureStyles();
  const personVisibilityObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const person=entry.target;
    preloadPersonBackdrop(person.dataset.kgPersonId,person.dataset.kgPersonProfile||null);
    personVisibilityObserver.unobserve(person);
  }),{rootMargin:"120px 0px"}):null;
  const watchPerson=node=>{
    if(!node?.matches?.("[data-kg-person-id]")||!node.dataset.kgPersonId)return;
    if(personVisibilityObserver)personVisibilityObserver.observe(node);
  };
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-related-films]"))related(node);node.querySelectorAll?.("[data-kg-related-films]").forEach(related);watchPerson(node);node.querySelectorAll?.("[data-kg-person-id]").forEach(watchPerson);}))) ;
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-related-films]").forEach(related);
  // Warm one alternate portrait only when its person card is near the viewport.
  document.querySelectorAll("[data-kg-person-id]").forEach(watchPerson);
  const warmPersonFromTarget=event=>{
    const person=event.target.closest?.("[data-kg-person-id]");
    if(person?.dataset.kgPersonId)preloadPersonBackdrop(person.dataset.kgPersonId,person.dataset.kgPersonProfile||null);
  };
  document.addEventListener("pointerover",warmPersonFromTarget,{passive:true});
  document.addEventListener("focusin",warmPersonFromTarget);
  document.addEventListener("click",e=>{
    const person=e.target.closest("[data-kg-person-id]");if(person){e.preventDefault();e.stopImmediatePropagation();showPerson(person.dataset.kgPersonId,person.dataset.kgPersonName||person.textContent,person.dataset.kgPersonRole,person);return;}
    const button=e.target.closest("[data-kg-related-open]");
    if(button){
      const section=button.closest("[data-kg-related-films]");
      const key=section?.dataset.contextKey||"";
      const id=section?.dataset.filmId;
      const pool=pools.get(key)||[];
      const filmId=button.dataset.kgRelatedOpen;
      const film=relatedCache.get(`${id}:${key}`)?.find(item=>String(item.id)===filmId)
        || pool.find(item=>String(item.id)===filmId);
      if(film){
        const enriched={...film,_kgRelatedPool:pool,_kgGlobalRelated:section.dataset.globalRelated==="true",
          _oscarContext:section.dataset.placement==="oscar"};
        const current=window.KGFilmCard.modelFor(button.closest(".kg-film-detail"));
        if(current&&window.KGFilmCard.openInlineRelated(enriched,current,button,pool,section.dataset.placement==="oscar"))return;
        const dialog=button.closest("dialog.kg-film-dialog");
        if(dialog&&window.KGFilmCard.navigateDialogRelated(enriched,dialog,button,pool,section.dataset.placement==="oscar"))return;
        if(current&&window.KGOpenInlineRelatedFilm?.(enriched,current,button))return;
        window.KGFilmCard.openDialog(enriched,button);
      }
      return;
    }
    if(e.target===modal())closePerson();
  },true);
  document.addEventListener("keydown",event=>{
    const profile=modal();
    if(event.key!=="Escape" || !profile || event.defaultPrevented) return;
    const top=[...document.querySelectorAll("dialog[open]")].at(-1);
    if(top && !top.contains(profile)) return;
    event.preventDefault();
    closePerson();
  });

  window.KGFilmInteractions={registerPool};
  window.KGPersonBackdropWarm=warmPersonBackdrop;
  window.KGPreloadPersonBackdrop=preloadPersonBackdrop;
  window.KGOpenPersonProfile=showPerson;
  window.KGScrollToFilmDescription=scrollToDescription;
  window.KGScrollPersonModalToFilm=scrollPersonModalToFilm;
})();
