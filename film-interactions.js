/* Shared TMDB person profiles and related-film carousels. */
(function(){
  const pools=new Map(),relatedCache=new Map(),personCache=new Map(),personFilmPools=new Map();
  let scrollFrame=0,personScrollFrame=0;
  const image=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const esc=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function tmdb(path,params={}){
    let key="";try{key=apiKey||"";}catch{}
    if(!key)throw new Error("Нужен ключ TMDB");
    const query=new URLSearchParams({...params,api_key:key,language:"ru-RU"});
    const response=await fetch(`https://api.themoviedb.org/3/${path}?${query}`);
    if(!response.ok)throw new Error(`TMDB ${response.status}`);
    return response.json();
  }
  function ensureStyles(){
    if(document.getElementById("kg-film-interactions-style"))return;
    const style=document.createElement("style");style.id="kg-film-interactions-style";
    style.textContent=`.kg-person-link{color:#ffdca8;text-decoration:underline;text-decoration-color:#ffb83066;text-underline-offset:3px;cursor:pointer}.kg-person-link:hover{color:#ffb830}.kg-person-card{cursor:pointer;transition:transform .18s,border-color .18s}.kg-person-card:hover{transform:translateY(-2px);border-color:#ffb830}.kgpi-backdrop{position:fixed;inset:0;z-index:1000;background:#151219;display:block;padding:0}.kgpi-modal{width:100%;height:100dvh;max-height:100dvh;overflow-y:auto;overscroll-behavior:contain;background:#151219;color:#e8e0ea;border:0;border-radius:0;box-shadow:0 24px 80px #000b}.kgpi-film{box-sizing:border-box;display:block;flex:0 0 120px!important;width:120px!important;min-width:120px!important;max-width:120px!important;align-self:flex-start;text-align:left}.kgpi-film>.kgpi-poster{position:relative;box-sizing:border-box;display:block;flex:none;width:120px!important;min-width:120px!important;max-width:120px!important;height:180px!important;min-height:180px!important;max-height:180px!important;aspect-ratio:2/3;overflow:hidden;border-radius:10px;background:#2c2830}.kgpi-film>.kgpi-poster>img,.kgpi-film img{position:absolute;inset:0;box-sizing:border-box;display:block;flex:none;width:120px!important;min-width:120px!important;max-width:120px!important;height:180px!important;min-height:180px!important;max-height:180px!important;object-fit:cover!important;object-position:center!important;border-radius:10px;background:#2c2830}.kgpi-film>.kgpi-poster>span:not(img){position:absolute;inset:0;display:flex;width:100%;height:100%;align-items:center;justify-content:center}.kgpi-film:hover img{outline:2px solid #ffb830}.kgpi-film>span:nth-child(2){display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em}.kgpi-profile-credit{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:136px}.kgpi-profile-credit-poster{display:block;box-sizing:border-box;flex:none;width:76px!important;min-width:76px;max-width:76px;height:112px!important;min-height:112px;max-height:112px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;background:#2c2830}.kgpi-profile-credit-poster.is-empty{display:flex;align-items:center;justify-content:center}.kgpi-profile-credit:focus-visible{outline:2px solid #ffb830;outline-offset:2px}.kgpi-bio-clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}`;
    document.head.appendChild(style);
  }
  function registerPool(key,films){if(key&&Array.isArray(films))pools.set(key,films);}
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
  function filmButton(f){const title=f.title||f.name||"Фильм",year=(f.release_date||"").slice(0,4);return `<button class="kgpi-film" type="button" data-kg-related-open="${f.id}"><span class="kgpi-poster">${image(f.poster_path)?`<img loading="lazy" src="${image(f.poster_path)}" alt="Постер «${esc(title)}»" onerror="this.style.visibility='hidden'">`:`<span class="flex h-full w-full items-center justify-center text-xs text-[#b3a79a]">Нет постера</span>`}</span><span class="block mt-1 text-xs font-semibold leading-tight">${esc(title)}</span><span class="block text-[10px] text-[#b3a79a]">${year}</span></button>`;}
  function modal(){return document.getElementById("kg-person-modal");}
  function closePerson(){const root=modal();root?.querySelectorAll("[data-kg-person-detail]").forEach(panel=>{if(panel.id)window.KGCloseFilmFromRelated?.(panel.id);});root?.remove();}
  const ageFromBirthday=birthday=>{if(!birthday)return "—";const born=new Date(`${birthday}T00:00:00`);if(Number.isNaN(+born))return "—";const now=new Date();let age=now.getFullYear()-born.getFullYear();if(now<new Date(now.getFullYear(),born.getMonth(),born.getDate()))age--;return `${age} лет`;};
  function roleFor(person,credit){
    if(credit._personRole)return credit._personRole;
    const explicitActor=/акт[её]р/i.test(person._profileRole||""),explicitDirector=/режисс[её]р/i.test(person._profileRole||"");
    return explicitActor||(!explicitDirector&&person.known_for_department==="Acting")?"Актёр":"Режиссёр";
  }
  function creditCard(f,person){
    const title=f.title||f.name||"Фильм",year=(f.release_date||"").slice(0,4),role=esc(roleFor(person,f));
    const poster=f.poster_path?`<img class="kgpi-profile-credit-poster" loading="lazy" src="${image(f.poster_path,"w185")}" alt="Постер «${esc(title)}»">`:'<div class="kgpi-profile-credit-poster is-empty"><span class="material-symbols-outlined text-[#b3a79a]">movie</span></div>';
    const rating=Number(f.vote_average)>0?`<span class="shrink-0 px-2 py-1 rounded-lg bg-[#100d14] text-xs font-semibold text-[#ffdca8]">★ ${Number(f.vote_average).toFixed(1)}</span>`:"";
    return `<div data-kg-person-credit class="flex flex-col gap-0.5"><button type="button" class="kgpi-profile-credit w-full p-3 rounded-xl bg-[#211d26] text-left transition-colors hover:bg-[#2c2830]" data-kg-person-film-open="${f.id}" aria-label="Открыть фильм «${esc(title)}»">${poster}<span class="min-w-0 flex flex-col gap-1"><span class="text-sm font-semibold leading-snug text-[#f1e7dc] line-clamp-2">${esc(title)}${year?` <span class="font-normal text-[#b3a79a]">(${year})</span>`:""}</span><span class="text-xs text-[#d5c4ad] line-clamp-1">${role}</span><span class="text-[11px] text-[#b3a79a]">${esc((f.original_language||"").toUpperCase())||"Фильм"}</span></span>${rating}</button><div data-kg-person-detail class=""></div></div>`;
  }
  async function showPerson(id,name,role){
    ensureStyles();closePerson();
    const root=document.createElement("div");root.id="kg-person-modal";root.className="kgpi-backdrop";root.setAttribute("role","presentation");root.dataset.personId=id;
    root.innerHTML=`<section class="kgpi-modal" role="dialog" aria-modal="true" aria-label="Профиль ${esc(name)}"><header class="sticky top-0 z-20 h-16 px-4 flex items-center justify-between bg-[#151219]/95 backdrop-blur-xl border-b border-white/5"><div class="flex items-center gap-2 min-w-0"><button type="button" data-kg-person-close aria-label="Назад" class="w-10 h-10 rounded-full text-[#ffdca8] text-2xl">‹</button><div class="min-w-0"><span class="block text-[9px] uppercase tracking-[.2em] text-[#ffb830]">${esc(role||"Кинематографист")}</span><h2 class="text-base font-semibold truncate">${esc(name)}</h2></div></div><button type="button" data-kg-person-close aria-label="Закрыть профиль" class="w-10 h-10 rounded-full bg-[#2c2830] text-xl">×</button></header><div class="pb-10"><section class="relative px-4 pt-3"><div data-kg-person-backdrop class="h-48 rounded-xl bg-gradient-to-br from-[#51402c] via-[#241c20] to-[#100d14] bg-cover bg-center overflow-hidden relative"><div class="absolute inset-0 bg-gradient-to-t from-[#151219] via-[#151219]/35 to-transparent"></div></div><div class="relative z-10 -mt-24 flex flex-col items-center text-center"><div class="relative rounded-xl p-[3px] bg-gradient-to-tr from-[#861a45] via-[#ffb830] to-[#ffdead] shadow-[0_0_32px_rgba(255,184,48,.3)]"><div data-kg-person-image class="w-[188px] h-[250px] rounded-[9px] overflow-hidden bg-[#2c2830] flex items-center justify-center"><span class="material-symbols-outlined text-5xl text-[#b3a79a]">person</span></div></div><h1 data-kg-person-title class="mt-4 text-2xl font-bold font-serif text-[#ffdca8]"></h1><p data-kg-person-original class="text-sm text-[#b3a79a]"></p><div class="flex flex-wrap justify-center gap-2 mt-3"><span data-kg-person-location class="px-3 py-1 rounded-full bg-[#2c2830] text-xs text-[#d5c4ad]"></span><span data-kg-person-department class="px-3 py-1 rounded-full bg-[#861a45]/70 text-xs text-[#ffd9e1]"></span></div><div class="w-full grid grid-cols-3 gap-1.5 mt-5 py-3 px-2 rounded-xl bg-[#1d1a21]"><div class="flex flex-col items-center"><span class="text-[9px] uppercase tracking-wider text-[#b3a79a]">Возраст</span><span data-kg-person-age class="text-sm font-semibold mt-1"></span></div><div class="flex flex-col items-center"><span class="text-[9px] uppercase tracking-wider text-[#b3a79a]">Фильмы</span><span data-kg-person-count class="text-sm font-semibold text-[#ffdca8] mt-1">—</span></div><div class="flex flex-col items-center"><span class="text-[9px] uppercase tracking-wider text-[#b3a79a]">Профессия</span><span data-kg-person-stat-role class="text-sm font-semibold text-[#ffdead] mt-1"></span></div></div><button type="button" data-kg-person-best class="w-full h-12 mt-4 rounded-full bg-[#ffb830] text-[#281900] font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"><span class="material-symbols-outlined">local_fire_department</span><span data-kg-person-best-label>Смотреть лучшие роли</span></button></div></section><section class="px-4 mt-7"><div class="flex items-center justify-between mb-3"><h2 data-kg-person-bio-heading class="text-lg font-semibold text-[#f1e7dc]">Об актёре</h2><span class="text-[9px] uppercase tracking-widest text-[#ffb830]">Биография</span></div><div class="rounded-xl bg-[#211d26] p-4"><p data-kg-person-bio class="text-sm leading-relaxed text-[#d5c4ad] kgpi-bio-clamp"></p><button type="button" data-kg-person-bio-toggle class="mt-3 text-xs font-semibold text-[#ffb830]">Читать полностью</button></div></section><section class="px-4 mt-7"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-[#ffb830]">movie</span><h2 class="text-lg font-semibold text-[#f1e7dc]">Фильмография в Киноглобусе</h2></div><span data-kg-person-credit-total class="text-xs text-[#ffb830]"></span></div><p data-kg-person-credit-subtitle class="text-xs text-[#b3a79a] mb-3"></p><div data-kg-person-films class="flex flex-col gap-2.5"><span class="text-sm text-[#b3a79a]">Загружаем фильмы…</span></div></section></div></section>`;
    document.body.appendChild(root);
    const dialog=root.querySelector(".kgpi-modal");
    root.addEventListener("click",e=>{
      if(e.target===root||e.target.closest("[data-kg-person-close]")){closePerson();return;}
      if(e.target.closest("[data-kg-person-best]")){const list=root.querySelector("[data-kg-person-films]");dialog.scrollTo({top:dialog.scrollTop+list.getBoundingClientRect().top-dialog.getBoundingClientRect().top-16,behavior:"smooth"});return;}
      if(e.target.closest("[data-kg-person-bio-toggle]")){const bio=root.querySelector("[data-kg-person-bio]"),button=e.target.closest("[data-kg-person-bio-toggle]"),expanded=bio.classList.toggle("kgpi-bio-clamp");button.textContent=expanded?"Читать полностью":"Свернуть";return;}
      const filmButton=e.target.closest("[data-kg-person-film-open]");if(filmButton){
        const filmPool=personFilmPools.get(String(id))||[];const film=filmPool.find(item=>String(item.id)===filmButton.dataset.kgPersonFilmOpen);if(!film||!window.KGOpenFilmFromRelated)return;
        const panel=filmButton.closest("[data-kg-person-credit]")?.querySelector("[data-kg-person-detail]");if(!panel)return;if(!panel.id)panel.id=`kg-person-film-detail-${id}-${film.id}`;
        window.KGOpenFilmFromRelated({...film,_kgRelatedPool:filmPool},"person-related",panel.id);
      }
    });
    try{
      let data=personCache.get(id);if(!data){data=await tmdb(`person/${id}`,{append_to_response:"movie_credits"});personCache.set(id,data);}data._profileRole=role||"";
      if(!root.isConnected)return;
      const actor=data.known_for_department==="Acting"||/акт[её]р/i.test(role||""),profession=actor?"Актёр":"Режиссёр";
      root.querySelector("[data-kg-person-bio-heading]").textContent=actor?"Об актёре":"О режиссёре";
      root.querySelector("[data-kg-person-best-label]").textContent=actor?"Смотреть лучшие роли":"Смотреть лучшие фильмы";
      root.querySelector("[data-kg-person-title]").textContent=data.name||name;
      root.querySelector("[data-kg-person-original]").textContent=data.also_known_as?.[0]||"";
      root.querySelector("[data-kg-person-department]").textContent=profession;
      root.querySelector("[data-kg-person-stat-role]").textContent=profession;
      root.querySelector("[data-kg-person-age]").textContent=ageFromBirthday(data.birthday);
      const birthplace=data.place_of_birth||"Место рождения не указано";root.querySelector("[data-kg-person-location]").textContent=`⌖ ${birthplace}`;
      const bio=data.biography||"Биография пока недоступна на русском языке.";root.querySelector("[data-kg-person-bio]").textContent=bio;
      const photo=root.querySelector("[data-kg-person-image]");if(data.profile_path)photo.innerHTML=`<img class="h-full w-full object-cover" src="${image(data.profile_path,"w500")}" alt="${esc(data.name)}">`;
      const castCredits=(data.movie_credits&&data.movie_credits.cast||[]).map(f=>({...f,_personRole:f.character?`Роль: ${f.character}`:"Актёр"}));
      const crewCredits=(data.movie_credits&&data.movie_credits.crew||[]).map(f=>({...f,_personRole:f.job||"Участие в проекте"}));
      const allCredits=castCredits.concat(crewCredits).filter(f=>f.id);
      let credits=actor?castCredits:crewCredits.filter(f=>f.job==="Director");
      if(!credits.length)credits=allCredits;
      credits.sort((a,b)=>(b.popularity||0)-(a.popularity||0));
      const dedup=[...new Map(credits.map(f=>[String(f.id),f])).values()].slice(0,30);personFilmPools.set(String(id),dedup);
      root.querySelector("[data-kg-person-count]").textContent=String(dedup.length);
      root.querySelector("[data-kg-person-credit-total]").textContent=`${dedup.length} фильмов`;
      root.querySelector("[data-kg-person-credit-subtitle]").textContent=actor?`Главные и заметные роли ${data.name||name}`:`Фильмы, снятые ${data.name||name}`;
      root.querySelector("[data-kg-person-films]").innerHTML=dedup.length?dedup.map(f=>creditCard(f,data)).join(""):'<span class="text-sm text-[#b3a79a]">Фильмы не найдены.</span>';
      const backdrop=dedup.find(f=>f.backdrop_path)?.backdrop_path;if(backdrop)root.querySelector("[data-kg-person-backdrop]").style.backgroundImage=`linear-gradient(0deg,#151219 0%,transparent 85%),url("${image(backdrop,"w780")}")`;
    }catch(error){if(root.isConnected){root.querySelector("[data-kg-person-original]").textContent="";root.querySelector("[data-kg-person-credit-total]").textContent="";root.querySelector("[data-kg-person-films]").innerHTML='<span class="text-sm text-[#b3a79a]">Не удалось загрузить профиль. Проверьте подключение к TMDB.</span>';}console.warn("[Kinoglobus] person profile:",error);}
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
    }catch(error){list.innerHTML='<span class="text-xs text-[#b3a79a]">Не удалось загрузить похожие фильмы.</span>';console.warn("[Kinoglobus] related films:",error);}
  }
  function paint(section,films){const list=section.querySelector("[data-kg-related-list]");if(!list)return;list.innerHTML=films.length?films.map(filmButton).join(""):'<span class="text-xs text-[#b3a79a]">В этом списке больше нет похожих фильмов.</span>';}
  // Apply carousel poster sizing on every screen, not just after opening a person profile.
  ensureStyles();
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-related-films]"))related(node);node.querySelectorAll?.("[data-kg-related-films]").forEach(related);}))) ;
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-related-films]").forEach(related);
  document.addEventListener("click",e=>{
    const closeDetail=e.target.closest("#kg-person-modal [data-act='close-film']");if(closeDetail){e.preventDefault();e.stopImmediatePropagation();const panel=closeDetail.closest("[data-kg-related-detail], [data-kg-person-detail]");if(panel)window.KGCloseFilmFromRelated?.(panel.id);return;}
    const person=e.target.closest("[data-kg-person-id]");if(person){e.preventDefault();e.stopImmediatePropagation();showPerson(person.dataset.kgPersonId,person.dataset.kgPersonName||person.textContent,person.dataset.kgPersonRole);return;}
    const film=e.target.closest("[data-kg-related-open]");if(film){const section=film.closest("[data-kg-related-films]"),filmId=film.dataset.kgRelatedOpen;let pool=pools.get(section?.dataset.contextKey||"")||[];if(!pool.some(f=>String(f.id)===filmId))pool=[...relatedCache.values()].find(list=>list.some(f=>String(f.id)===filmId))||pool;const item=pool.find(f=>String(f.id)===filmId);if(item&&window.KGOpenFilmFromRelated){let panel=section.querySelector("[data-kg-related-detail]");if(!panel){panel=document.createElement("div");panel.dataset.kgRelatedDetail="";panel.id=`kg-related-detail-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;section.appendChild(panel);}const placement=section.dataset.placement?.startsWith("oscar")?"oscar-related":film.closest("#kg-person-modal")?"person-related":"related";window.KGOpenFilmFromRelated({...item,_kgRelatedPool:pool,_kgGlobalRelated:section.dataset.globalRelated==="true"},placement,panel.id);}else if(item&&section?.dataset.placement==="discovery"&&window.KGShowRelatedDiscoveryFilm){window.KGShowRelatedDiscoveryFilm(item,pool);}else if(item&&window.openFilm){window.openFilm(item,"home-europe");}return;}
    if(e.target===modal())closePerson();
  },true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closePerson();});
  window.KGFilmInteractions={registerPool};
  window.KGOpenPersonProfile=(id,name,role)=>showPerson(id,name,role);
  window.KGScrollToFilmDescription=scrollToDescription;
  window.KGScrollPersonModalToFilm=scrollPersonModalToFilm;
})();
