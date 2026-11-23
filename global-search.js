/* Global TMDB search and local search history. */
(function(){
  "use strict";
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const label=(text,values)=>esc(uiText(text,values));
  const icons={
    back:"m12 5-7 7 7 7M5 12h14",
    search:"M21 21l-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
    close:"m6 6 12 12M18 6 6 18",
    bell:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
    person:"M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2m-3-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    movie:"M3 8h18v12H3zM3 8V4h18v4m-14-4 3 4m3-4 3 4",
    clock:"M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    info:"M12 10v6m0-9h.01m8.99 5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    mic:"M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-3 0h6"
  };
  const icon=name=>`<svg class="kgs-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name]}"/></svg>`;
  const image=path=>/^\/[\w.-]+$/.test(path||"")?`https://image.tmdb.org/t/p/w342${path}`:"";
  const ratingFormat=new Intl.NumberFormat(interfaceLanguage,{minimumFractionDigits:1,maximumFractionDigits:1});
  const roles={Directing:"Режиссёр",Acting:"Актёр",Production:"Продюсер",Writing:"Сценарист"};
  const root=document.createElement("div");
  root.id="kg-global-search";
  root.hidden=true;
  root.innerHTML=`
    <section class="kg-search-screen" role="dialog" aria-modal="true" aria-labelledby="kgs-heading">
      <header class="kgs-header">
        <button type="button" class="kgs-icon-button" data-kgs-close aria-label="${label("Закрыть поиск")}">${icon("back")}</button>
        <h1 id="kgs-heading">${icon("movie")}${label("Поиск")}</h1>
        <button type="button" class="kgs-icon-button" data-kgs-notifications aria-label="${label("Календарь моих релизов")}">${icon("bell")}</button>
        <button type="button" class="kgs-icon-button kgs-account" data-kgs-account aria-label="${label("Личный кабинет")}">${icon("person")}</button>
      </header>
      <div class="kgs-body">
        <div class="kgs-tools">
          <form class="kgs-form" role="search">
            <label>${icon("search")}<input type="search" autocomplete="off" maxlength="120" autocapitalize="off" spellcheck="false" placeholder="${label("Поиск")}" aria-label="${label("Поиск")}"></label>
            <button type="button" class="kgs-icon-button" data-kgs-clear aria-label="${label("Очистить поиск")}" hidden>${icon("close")}</button>
            <button type="button" class="kgs-icon-button" data-kgs-voice aria-label="${label("Голосовой поиск")}" aria-pressed="false" hidden>${icon("mic")}</button>
          </form>
          <div class="kgs-filters" role="group" aria-label="${label("Профессия")}">
            ${[["all","Все"],...["Directing","Acting","Production"].map(role=>[role,roles[role]])].map(([key,name])=>`<button type="button" data-kgs-filter="${key}" aria-pressed="${key==="all"}">${label(name)}</button>`).join("")}
          </div>
          <p class="kgs-voice-status" role="status" hidden></p>
        </div>
        <div class="kgs-results" data-kgs-results aria-live="polite"></div>
        <section class="kgs-history" hidden>
          <header><h2>${icon("clock")}${label("История поиска")}</h2><button type="button" data-kgs-history-clear>${label("Очистить всё")}</button></header>
          <div class="kgs-history-list"></div>
        </section>
      </div>
    </section>`;
  document.body.append(root);
  const form=root.querySelector("form"),input=form.querySelector("input"),body=root.querySelector(".kgs-body");
  const results=root.querySelector("[data-kgs-results]"),clearButton=root.querySelector("[data-kgs-clear]");
  const history=root.querySelector(".kgs-history"),historyList=root.querySelector(".kgs-history-list");
  const historyKey="kgSearchHistory.v1";
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const voiceButton=root.querySelector("[data-kgs-voice]"),voiceStatus=root.querySelector(".kgs-voice-status");
  voiceButton.hidden=!Recognition;
  window.KGMountBottomNav(root,root.querySelector(".kg-search-screen"),"",close);
  let timer,request,items=[],matches=[],active=-1,filter="all",lastFocus,previousOverflow,recognition;

  function normalize(value){
    return String(value||"").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
  }
  function matchRank(item,query){
    if(!query)return 0;
    const names=item.kind==="person"?[item.name,item.original_name]:[item.title,item.original_title];
    return Math.max(...names.map(name=>{
      const value=normalize(name);
      if(value===query)return 4;
      if(value.startsWith(query))return 3;
      if(value.split(" ").some(word=>word.startsWith(query)))return 2;
      return value.includes(query)?1:0;
    }));
  }
  function readHistory(){
    const entries=store.get(historyKey,[]);
    return Array.isArray(entries)?entries.filter(entry=>typeof entry==="string"&&entry.trim()):[];
  }
  function updateHistory(entries,paint=true){
    store.set(historyKey,entries);
    if(paint)renderHistory();
  }
  function rememberQuery(){
    const value=input.value.trim();
    if(value.length<2)return;
    updateHistory([value,...readHistory().filter(entry=>normalize(entry)!==normalize(value))].slice(0,10));
  }
  function renderHistory(){
    const entries=readHistory();
    history.hidden=!entries.length;
    historyList.innerHTML=entries.map((entry,index)=>`<div class="kgs-history-chip">
      <button type="button" data-kgs-recent="${index}">${icon("clock")}<span>${esc(entry)}</span></button>
      <button type="button" class="kgs-icon-button" data-kgs-history-delete="${index}" aria-label="${label("Удалить из истории поиска {query}",{query:entry})}">${icon("close")}</button>
    </div>`).join("");
  }
  function status(heading,description=""){
    results.innerHTML=`<div class="kgs-status"><h2>${label(heading)}</h2>${description?`<p>${label(description)}</p>`:""}</div>`;
  }
  async function tmdb(path,query,signal){
    const url=new URL(`https://api.themoviedb.org/3/search/${path}`);
    url.search=new URLSearchParams({api_key:apiKey,language:path==="person"?(interfaceLanguage==="en"?"en-US":"ru-RU"):filmLocale,query,page:"1"});
    const response=await movieCatalog.request(url,{signal});
    if(!response.ok)throw new Error(response.status===401?uiText("Ключ TMDB не принят. Проверьте его в настройках."):uiText("Ошибка TMDB ({status}).",{status:response.status}));
    return response.json();
  }
  function art(path,fallback){
    const poster=image(path);
    return `<span class="kgs-card-art">${icon(fallback)}${poster?`<img src="${poster}" alt="" loading="lazy" decoding="async">`:""}</span>`;
  }
  function resultButton(item,index){
    const person=item.kind==="person",tv=item.media_type==="tv";
    const title=person?item.name:(item.title||item.original_title||uiText("Без названия"));
    const kind=person?(roles[item.known_for_department]||"Кинематографист"):tv?"Сериал":"Фильм";
    const original=person?item.original_name:item.original_title;
    const year=(item.release_date||"").slice(0,4);
    const subtitle=[original!==title?original:"",year].filter(Boolean).join(" · ");
    const genres=person?[]:genreLine(item).split(", ").filter(Boolean);
    const known=person?(item.known_for||[]).map(film=>film.title||film.name).filter(Boolean).slice(0,3).join(", "):"";
    const rating=Number(item.vote_average)||0;
    const openLabel=person?label("Открыть профиль {name}",{name:title}):label(tv?"Открыть сериал {title}":"Открыть фильм {title}",{title});
    return `<article class="kgs-card${person?" kgs-person":""}">
      <button type="button" class="kgs-result" data-kgs-item="${index}" aria-label="${openLabel}">
        ${art(person?item.profile_path:item.poster_path,person?"person":"movie")}
        <span class="kgs-result-copy">
          <span class="kgs-result-top"><span>${label(kind)}</span>${item.rank===4?`<span class="kgs-exact">${label("Точное совпадение")}</span>`:""}</span>
          <strong class="kgs-result-title">${esc(title)}</strong>
          ${subtitle?`<span class="kgs-result-sub">${esc(subtitle)}</span>`:""}
          ${genres.length?`<span class="kgs-genres">${genres.map(genre=>`<span>${label(genre)}</span>`).join("")}</span>`:""}
          ${known?`<span class="kgs-result-sub">${esc(known)}</span>`:""}
          ${rating?`<span class="kgs-rating">★ ${ratingFormat.format(rating)} <small>TMDB</small></span>`:""}
        </span>
      </button>
      ${person?"":`<div class="kgs-card-actions">${kgBookmarkButton(item)}<button type="button" class="kgs-icon-button" data-kgs-details="${index}" aria-label="${openLabel}">${icon("info")}</button></div>`}
    </article>`;
  }
  function renderResults(){
    items=filter==="all"?matches:matches.filter(item=>item.kind==="person"&&item.known_for_department===filter);
    active=items.length?0:-1;
    if(!items.length){status("Ничего не нашлось","Попробуйте изменить или сократить запрос.");return;}
    results.innerHTML=`<header class="kgs-results-heading"><h2>${label("Результаты поиска")}</h2><span>${label("Найдено: {count}",{count:items.length})}</span></header>
      <div class="kgs-card-list">${items.map(resultButton).join("")}</div>`;
  }
  async function search(query){
    const controller=new AbortController();
    request=controller;
    const endpoints=window.KGSeries?.active?["tv","movie","person"]:["movie","tv","person"];
    const answers=await Promise.allSettled(endpoints.map(path=>tmdb(path,query,controller.signal)));
    if(controller.signal.aborted||root.hidden)return;
    request=null;
    if(answers.every(answer=>answer.status==="rejected")){
      status(answers[0].reason?.message||"Не удалось выполнить поиск.");
      return;
    }
    const normalized=normalize(query);
    matches=answers.flatMap((answer,index)=>{
      if(answer.status!=="fulfilled")return [];
      const kind=endpoints[index]==="person"?"person":"media";
      return (answer.value.results||[]).map(item=>({...item,kind}));
    }).map(item=>({...item,rank:matchRank(item,normalized)}))
      .sort((a,b)=>b.rank-a.rank||(Number(b.popularity)||0)-(Number(a.popularity)||0))
      .map(item=>item.kind==="media"?localizeFilmListItem(item):item);
    renderResults();
  }
  function schedule(immediate=false){
    clearTimeout(timer);
    request?.abort();
    request=null;
    matches=[];
    items=[];
    active=-1;
    clearButton.hidden=!input.value;
    body.scrollTop=0;
    const query=input.value.trim();
    if(query.length<2){
      results.replaceChildren();
      if(query)status("Введите минимум две буквы");
      return;
    }
    if(!apiKey){status("Добавьте ключ TMDB в настройках, чтобы искать фильмы и людей.");return;}
    status("Ищем точные совпадения…");
    if(immediate)search(query);
    else timer=setTimeout(()=>search(query),260);
  }
  function stopVoice(){
    const current=recognition;
    recognition=null;
    current?.abort();
    voiceButton.setAttribute("aria-pressed","false");
    voiceStatus.hidden=true;
  }
  function startVoice(){
    if(recognition){stopVoice();return;}
    if(!Recognition)return;
    const current=new Recognition();
    recognition=current;
    current.lang=interfaceLanguage==="en"?"en-US":"ru-RU";
    current.onresult=event=>{
      if(recognition!==current)return;
      input.value=event.results[0][0].transcript.trim();
      rememberQuery();
      schedule(true);
    };
    current.onerror=()=>{
      if(recognition!==current)return;
      voiceStatus.textContent=uiText("Голосовой поиск недоступен.");
      voiceStatus.hidden=false;
    };
    current.onend=()=>{
      if(recognition!==current)return;
      recognition=null;
      voiceButton.setAttribute("aria-pressed","false");
    };
    try{
      current.start();
      voiceButton.setAttribute("aria-pressed","true");
      voiceStatus.hidden=true;
    }catch{
      stopVoice();
      voiceStatus.textContent=uiText("Голосовой поиск недоступен.");
      voiceStatus.hidden=false;
    }
  }
  function close(){
    if(root.hidden)return;
    root.hidden=true;
    clearTimeout(timer);
    request?.abort();
    stopVoice();
    document.body.style.overflow=previousOverflow;
    lastFocus?.focus?.();
    lastFocus=null;
  }
  function open(){
    if(!root.hidden)return;
    window.KGFilmCard.stopTrailers();
    lastFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    input.value="";
    filter="all";
    root.querySelectorAll("[data-kgs-filter]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.kgsFilter===filter)));
    renderHistory();
    root.hidden=false;
    schedule();
    if(matchMedia("(min-width: 768px) and (pointer: fine)").matches&&!window.Capacitor?.isNativePlatform?.())input.focus();
    else root.querySelector("[data-kgs-close]").focus({preventScroll:true});
  }
  function openItem(index,opener=input){
    const item=items[index];
    if(!item)return;
    rememberQuery();
    input.blur();
    if(item.kind==="person")window.KGOpenPersonProfile?.(item.id,item.name,roles[item.known_for_department]||"Кинематографист",opener);
    else window.KGFilmCard.openDialog({...item,_kgGlobalRelated:true},opener);
  }
  results.addEventListener("error",event=>{if(event.target.tagName==="IMG")event.target.remove();},true);
  root.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button)return;
    const {kgsFilter,kgsRecent,kgsHistoryDelete,kgsDetails,kgsItem}=button.dataset;
    if(button.hasAttribute("data-kgs-close"))close();
    else if(button.hasAttribute("data-kgs-account"))window.KGOpenAccountPage?.("register");
    else if(button.hasAttribute("data-kgs-notifications"))window.KGReleaseFollow.openCalendar();
    else if(button.hasAttribute("data-kgs-clear")){input.value="";schedule();input.focus();}
    else if(button.hasAttribute("data-kgs-voice"))startVoice();
    else if(kgsFilter){
      filter=kgsFilter;
      root.querySelectorAll("[data-kgs-filter]").forEach(tab=>tab.setAttribute("aria-pressed",String(tab===button)));
      if(matches.length)renderResults();
    }else if(kgsRecent!==undefined){
      input.value=readHistory()[Number(kgsRecent)]||"";
      rememberQuery();
      schedule(true);
    }else if(kgsHistoryDelete!==undefined){
      updateHistory(readHistory().filter((_,index)=>index!==Number(kgsHistoryDelete)));
      (historyList.querySelector("[data-kgs-history-delete]")||input).focus();
    }else if(button.hasAttribute("data-kgs-history-clear")){updateHistory([]);input.focus();}
    else if(kgsDetails!==undefined||kgsItem!==undefined)openItem(Number(kgsDetails??kgsItem),button);
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    rememberQuery();
    if(active>=0)openItem(active);
    else schedule(true);
  });
  input.addEventListener("input",()=>schedule());
  document.addEventListener("click",event=>{
    if(event.target.closest("[data-kg-search-open]")){event.preventDefault();open();}
  });
  document.addEventListener("keydown",event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open();return;}
    if(root.hidden||document.querySelector("dialog[open]"))return;
    if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();return;}
    if(event.target!==input||!items.length||!["ArrowDown","ArrowUp"].includes(event.key))return;
    event.preventDefault();
    active=(active+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;
    const buttons=results.querySelectorAll("[data-kgs-item]");
    buttons.forEach((button,index)=>button.classList.toggle("is-active",index===active));
    buttons[active]?.scrollIntoView({block:"nearest"});
  });
})();
