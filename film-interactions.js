/* Shared TMDB person profiles and related-film carousels. */
(function(){
  const pools=new Map(),relatedCache=new Map(),personCache=new Map();
  let scrollFrame=0;
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
    style.textContent=`.kg-person-link{color:#ffdca8;text-decoration:underline;text-decoration-color:#ffb83066;text-underline-offset:3px;cursor:pointer}.kg-person-link:hover{color:#ffb830}.kg-person-card{cursor:pointer;transition:transform .18s,border-color .18s}.kg-person-card:hover{transform:translateY(-2px);border-color:#ffb830}.kgpi-backdrop{position:fixed;inset:0;z-index:1000;background:#07060add;display:flex;align-items:center;justify-content:center;padding:16px}.kgpi-modal{width:min(720px,100%);max-height:min(88dvh,850px);overflow:auto;background:#1c1822;color:#e8e0ea;border:1px solid #ffb83055;border-radius:20px;box-shadow:0 24px 80px #000b}.kgpi-film{box-sizing:border-box;flex:0 0 104px;width:104px;text-align:left}.kgpi-poster{display:block;width:104px;height:150px;overflow:hidden;border-radius:10px;background:#2c2830}.kgpi-film img{display:block;width:104px;height:150px;object-fit:cover;border-radius:10px;background:#2c2830}.kgpi-film:hover img{outline:2px solid #ffb830}`;
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
  function filmButton(f){const title=f.title||f.name||"Фильм",year=(f.release_date||"").slice(0,4);return `<button class="kgpi-film" type="button" data-kg-related-open="${f.id}"><span class="kgpi-poster">${image(f.poster_path)?`<img loading="lazy" src="${image(f.poster_path)}" alt="Постер «${esc(title)}»" onerror="this.style.visibility='hidden'">`:`<span class="flex h-full w-full items-center justify-center text-xs text-[#b3a79a]">Нет постера</span>`}</span><span class="block mt-1 text-xs font-semibold leading-tight">${esc(title)}</span><span class="block text-[10px] text-[#b3a79a]">${year}</span></button>`;}
  function modal(){return document.getElementById("kg-person-modal");}
  function closePerson(){modal()?.remove();}
  async function showPerson(id,name,role){
    ensureStyles();closePerson();
    const root=document.createElement("div");root.id="kg-person-modal";root.className="kgpi-backdrop";root.setAttribute("role","presentation");
    root.innerHTML=`<section class="kgpi-modal" role="dialog" aria-modal="true" aria-label="Профиль ${esc(name)}"><div class="sticky top-0 z-10 flex justify-end p-2 bg-[#1c1822]/95"><button type="button" data-kg-person-close aria-label="Закрыть" class="w-10 h-10 rounded-full bg-[#2c2830] text-xl">×</button></div><div class="px-4 pb-5"><div class="flex gap-4"><div class="w-28 h-40 shrink-0 rounded-xl overflow-hidden bg-[#2c2830]" data-kg-person-image></div><div class="min-w-0"><div class="text-xs uppercase tracking-widest text-[#ffb830]">${esc(role||"Кинематографист")}</div><h2 class="mt-1 text-2xl font-bold" data-kg-person-title>${esc(name)}</h2><p class="mt-2 text-sm text-[#b3a79a]" data-kg-person-meta>Загружаем профиль…</p></div></div><p class="mt-4 text-sm leading-relaxed text-[#d5c4ad]" data-kg-person-bio></p><div class="mt-5"><h3 class="font-semibold text-[#ffdca8]">Фильмография</h3><div data-kg-person-films class="mt-2 flex gap-3 overflow-x-auto pb-2"><span class="text-sm text-[#b3a79a]">Загружаем фильмы…</span></div></div></div></section>`;
    document.body.appendChild(root);
    root.addEventListener("click",e=>{if(e.target===root||e.target.closest("[data-kg-person-close]"))closePerson();});
    try{
      let data=personCache.get(id);if(!data){data=await tmdb(`person/${id}`,{append_to_response:"movie_credits"});personCache.set(id,data);}
      if(!root.isConnected)return;
      root.querySelector("[data-kg-person-title]").textContent=data.name||name;
      const meta=[data.known_for_department,data.birthday,data.place_of_birth].filter(Boolean).join(" · ");root.querySelector("[data-kg-person-meta]").textContent=meta||"";
      const bio=data.biography||"Биография пока недоступна на русском языке.";root.querySelector("[data-kg-person-bio]").textContent=bio;
      const photo=root.querySelector("[data-kg-person-image]");if(data.profile_path)photo.innerHTML=`<img class="h-full w-full object-cover" src="${image(data.profile_path,"w342")}" alt="${esc(data.name)}">`;
      const credits=(data.movie_credits&&data.movie_credits.cast||[]).concat(data.movie_credits&&data.movie_credits.crew||[]).filter(f=>f.id&&f.poster_path).sort((a,b)=>(b.popularity||0)-(a.popularity||0));
      const dedup=[...new Map(credits.map(f=>[f.id,f])).values()].slice(0,20);root.querySelector("[data-kg-person-films]").innerHTML=dedup.length?dedup.map(filmButton).join(""):'<span class="text-sm text-[#b3a79a]">Фильмы не найдены.</span>';
    }catch(error){if(root.isConnected)root.querySelector("[data-kg-person-meta]").textContent="Не удалось загрузить профиль. Проверьте подключение к TMDB.";console.warn("[Kinoglobus] person profile:",error);}
  }
  async function related(section){
    const id=section.dataset.filmId;if(!id)return;
    const key=section.dataset.contextKey||"",cacheKey=`${id}:${key}`;if(relatedCache.has(cacheKey)){paint(section,relatedCache.get(cacheKey));return;}
    const list=section.querySelector("[data-kg-related-list]");if(!list)return;
    try{
      const pool=pools.get(key),allowed=pool?new Set(pool.map(f=>Number(f.id))):null;
      const data=await tmdb(`movie/${id}/recommendations`,{page:"1"});let results=(data.results||[]).filter(f=>Number(f.id)!==Number(id)&&(!allowed||allowed.has(Number(f.id))));
      if(results.length<8){const similar=await tmdb(`movie/${id}/similar`,{page:"1"});const have=new Set(results.map(f=>Number(f.id)));results=results.concat((similar.results||[]).filter(f=>Number(f.id)!==Number(id)&&!have.has(Number(f.id))&&(!allowed||allowed.has(Number(f.id)))));}
      if(pool&&results.length<8){const have=new Set(results.map(f=>Number(f.id)));const current=pool.find(f=>Number(f.id)===Number(id));const genres=new Set(current&&current.genre_ids||[]);const fallback=pool.filter(f=>Number(f.id)!==Number(id)&&!have.has(Number(f.id))).sort((a,b)=>{const score=f=>(f.genre_ids||[]).filter(g=>genres.has(g)).length*5+(Number(f.vote_average)||0)*.5+(Number(f.popularity)||0)*.01;return score(b)-score(a);});results=results.concat(fallback);}
      results=results.slice(0,14);relatedCache.set(cacheKey,results);paint(section,results);
    }catch(error){list.innerHTML='<span class="text-xs text-[#b3a79a]">Не удалось загрузить похожие фильмы.</span>';console.warn("[Kinoglobus] related films:",error);}
  }
  function paint(section,films){const list=section.querySelector("[data-kg-related-list]");if(!list)return;list.innerHTML=films.length?films.map(filmButton).join(""):'<span class="text-xs text-[#b3a79a]">В этом списке больше нет похожих фильмов.</span>';}
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-related-films]"))related(node);node.querySelectorAll?.("[data-kg-related-films]").forEach(related);}))) ;
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-related-films]").forEach(related);
  document.addEventListener("click",e=>{
    const person=e.target.closest("[data-kg-person-id]");if(person){e.preventDefault();e.stopImmediatePropagation();showPerson(person.dataset.kgPersonId,person.dataset.kgPersonName||person.textContent,person.dataset.kgPersonRole);return;}
    const film=e.target.closest("[data-kg-related-open]");if(film){const section=film.closest("[data-kg-related-films]"),pool=pools.get(section?.dataset.contextKey||""),item=pool&&pool.find(f=>String(f.id)===film.dataset.kgRelatedOpen);if(item&&window.KGOpenFilmFromRelated){let panel=section.querySelector("[data-kg-related-detail]");if(!panel){panel=document.createElement("div");panel.dataset.kgRelatedDetail="";panel.id=`kg-related-detail-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;section.appendChild(panel);}window.KGOpenFilmFromRelated({...item,_kgRelatedPool:pool},"related",panel.id);}else if(item&&section?.dataset.placement==="discovery"&&window.KGShowRelatedDiscoveryFilm){window.KGShowRelatedDiscoveryFilm(item,pool);}else if(item&&window.openFilm){window.openFilm(item,"home-europe");}return;}
    if(e.target===modal())closePerson();
  },true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closePerson();});
  window.KGFilmInteractions={registerPool};
  window.KGScrollToFilmDescription=scrollToDescription;
})();
