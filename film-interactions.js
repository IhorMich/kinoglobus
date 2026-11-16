/* Shared TMDB person profiles and related-film carousels. */
(function(){
  const pools=new Map(),relatedCache=new Map(),personCache=new Map(),personFilmPools=new Map();
  let scrollFrame=0,personScrollFrame=0;
  const image=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const esc=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function tmdb(path,params={},language="ru-RU"){
    let key="";try{key=apiKey||"";}catch{}
    if(!key)throw new Error("Нужен ключ TMDB");
    const query=new URLSearchParams({...params,api_key:key,language});
    const response=await movieCatalog.request(`https://api.themoviedb.org/3/${path}?${query}`);
    if(!response.ok)throw new Error(`TMDB ${response.status}`);
    return response.json();
  }
  function ensureStyles(){
    if(document.getElementById("kg-film-interactions-style"))return;
    const style=document.createElement("style");style.id="kg-film-interactions-style";
    style.textContent=`.kg-person-link{color:rgb(var(--kg-primary));text-decoration:underline;text-decoration-color:rgb(var(--kg-primary-container)/0.4);text-underline-offset:3px;cursor:pointer}.kg-person-link:hover{color:rgb(var(--kg-accent-text))}.kg-person-card{cursor:pointer;transition:transform .18s,border-color .18s}.kg-person-card:hover{transform:translateY(-2px);border-color:rgb(var(--kg-primary-container))}.kgpi-backdrop{position:fixed;inset:0;z-index:1000;background:rgb(var(--kg-surface));display:block;padding:0}.kgpi-modal{width:100%;height:100dvh;max-height:100dvh;overflow-y:auto;overscroll-behavior:contain;background:rgb(var(--kg-surface));color:rgb(var(--kg-on-surface));border:0;border-radius:0;box-shadow:0 24px 80px rgb(var(--kg-black)/0.73333)}
[data-kg-related-list]{min-width:0;max-width:100%;scroll-snap-type:x proximity}
.kgpi-film{flex:0 0 120px;min-width:0;scroll-snap-align:start}
.kgpi-film>[data-kg-related-open]{display:block;width:100%;text-align:left}
.kgpi-film .kgpi-poster{position:relative;display:block;width:100%;aspect-ratio:2/3;overflow:hidden;border-radius:10px;background:rgb(var(--kg-surface-container-high))}
.kgpi-film .kgpi-poster>img{display:block;width:100%;height:100%;object-fit:contain}
.kgpi-film .kgpi-poster>span{display:grid;place-items:center;width:100%;height:100%;text-align:center}
.kgpi-film-title{overflow-wrap:anywhere}
.kgpi-profile-credit{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:136px}.kgpi-profile-credit-poster{display:block;box-sizing:border-box;flex:none;width:76px!important;min-width:76px;max-width:76px;height:112px!important;min-height:112px;max-height:112px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;background:rgb(var(--kg-surface-container-high))}.kgpi-profile-credit-poster.is-empty{display:flex;align-items:center;justify-content:center}.kgpi-profile-credit:focus-visible{outline:2px solid rgb(var(--kg-primary-container));outline-offset:2px}.kgpi-bio-clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}`;
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
  function filmButton(f){const title=f.title||f.name||uiText("Фильм"),year=(f.release_date||"").slice(0,4);return `<div class="kg-bookmark-card kgpi-film"><button class="w-full text-left" type="button" data-kg-related-open="${f.id}"><span class="kgpi-poster">${image(f.poster_path)?`<img loading="lazy" src="${image(f.poster_path)}" alt="${esc(uiText("Постер «{title}»", {title}))}" onerror="this.style.visibility='hidden'">`:`<span class="flex h-full w-full items-center justify-center text-xs text-[rgb(var(--kg-text-muted))]">${uiText("Нет постера")}</span>`}</span><span class="kgpi-film-title block mt-1 text-xs font-semibold leading-tight">${esc(title)}</span><span class="block text-[10px] text-[rgb(var(--kg-text-muted))]">${year}</span></button></div>`; }
  function modal(){return document.getElementById("kg-person-modal");}
  function closePerson(){const root=modal();root?.querySelectorAll("[data-kg-person-detail]").forEach(panel=>{if(panel.id)window.KGCloseFilmFromRelated?.(panel.id);});root?.remove();}
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
  function roleFor(person,credit){
    if(credit._personRole)return credit._personRole;
    const explicitActor=/акт[её]р/i.test(person._profileRole||""),explicitDirector=/режисс[её]р/i.test(person._profileRole||"");
    return explicitActor||(!explicitDirector&&person.known_for_department==="Acting")?"Актёр":"Режиссёр";
  }
  function creditCard(f,person){
    const title=f.title||f.name||uiText("Фильм"),year=(f.release_date||"").slice(0,4),role=esc(uiText(roleFor(person,f)));
    const poster=f.poster_path?`<img class="kgpi-profile-credit-poster" loading="lazy" src="${image(f.poster_path,"w185")}" alt="${esc(uiText("Постер «{title}»", {title}))}">`:'<div class="kgpi-profile-credit-poster is-empty"><span class="material-symbols-outlined text-[rgb(var(--kg-text-muted))]">movie</span></div>';
    const rating=Number(f.vote_average)>0?`<span class="shrink-0 px-2 py-1 rounded-lg bg-surface-container-lowest text-xs font-semibold text-[rgb(var(--kg-primary))]">★ ${Number(f.vote_average).toFixed(1)}</span>`:"";
    return `<div data-kg-person-credit class="flex flex-col gap-0.5"><div class="kg-bookmark-row"><button type="button" class="kgpi-profile-credit w-full p-3 rounded-xl bg-[rgb(var(--kg-neutral-71))] text-left transition-colors hover:bg-surface-container-high" data-kg-person-film-open="${f.id}" aria-label="${esc(uiText("Открыть фильм {title}", {title}))}">${poster}<span class="min-w-0 flex flex-col gap-1"><span class="text-sm font-semibold leading-snug text-[rgb(var(--kg-warm-text-28))] line-clamp-2">${esc(title)}${year?` <span class="font-normal text-[rgb(var(--kg-text-muted))]">(${year})</span>`:""}</span><span class="text-xs text-[rgb(var(--kg-on-surface-variant))] line-clamp-1">${role}</span><span class="text-[11px] text-[rgb(var(--kg-text-muted))]">${esc((f.original_language||"").toUpperCase())||uiText("Фильм")}</span></span>${rating}</button>${kgBookmarkButton(f)}</div><div data-kg-person-detail class=""></div></div>`;
  }
  async function showPerson(id,name,role,sourceElement=null){
    ensureStyles();closePerson();window.KGFilmCard?.stopTrailers();
    const root=document.createElement("div");root.id="kg-person-modal";root.className="kgpi-backdrop";root.setAttribute("role","presentation");root.dataset.personId=id;
    root.innerHTML=`<section class="kgpi-modal" role="dialog" aria-modal="true" aria-label="${esc(uiText("Профиль {name}", {name}))}"><header class="sticky top-0 z-20 h-16 px-4 flex items-center justify-between bg-surface/95 backdrop-blur-xl border-b border-white/5"><div class="flex items-center gap-2 min-w-0"><button type="button" data-kg-person-close aria-label="${uiText("Назад")}" class="w-10 h-10 rounded-full text-[rgb(var(--kg-primary))] text-2xl">‹</button><div class="min-w-0"><span class="block text-[9px] uppercase tracking-[.2em] text-[rgb(var(--kg-primary-container))]">${esc(uiText(role||"Кинематографист"))}</span><h2 class="text-base font-semibold truncate">${esc(name)}</h2></div></div><button type="button" data-kg-person-close aria-label="${uiText("Закрыть профиль")}" class="w-10 h-10 rounded-full bg-surface-container-high text-xl">×</button></header><div class="pb-10"><section class="relative px-4 pt-3"><div data-kg-person-backdrop class="h-48 rounded-xl bg-gradient-to-br from-[rgb(var(--kg-warm-surface-22))] via-[rgb(var(--kg-neutral-65))] to-[rgb(var(--kg-surface-container-lowest))] bg-cover bg-center overflow-hidden relative"><div class="absolute inset-0 bg-gradient-to-t from-[rgb(var(--kg-surface))] via-[rgb(var(--kg-surface))]/35 to-transparent"></div></div><div class="relative z-10 -mt-24 flex flex-col items-center text-center"><div class="relative rounded-xl p-[3px] bg-gradient-to-tr from-[rgb(var(--kg-secondary-container))] via-[rgb(var(--kg-primary-container))] to-[rgb(var(--kg-primary-fixed))] shadow-[0_0_32px_rgb(var(--kg-primary-container)/.3)]"><div data-kg-person-image class="w-[188px] h-[250px] rounded-[9px] overflow-hidden bg-surface-container-high flex items-center justify-center"><span class="material-symbols-outlined text-5xl text-[rgb(var(--kg-text-muted))]">person</span></div></div><h1 data-kg-person-title class="mt-4 text-2xl font-bold font-serif text-[rgb(var(--kg-primary))]"></h1><p data-kg-person-original class="text-sm text-[rgb(var(--kg-text-muted))]"></p><div class="flex flex-wrap justify-center gap-2 mt-3"><span data-kg-person-location class="px-3 py-1 rounded-full bg-surface-container-high text-xs text-[rgb(var(--kg-on-surface-variant))]"></span><span data-kg-person-department class="px-3 py-1 rounded-full bg-[rgb(var(--kg-secondary-container))]/70 text-xs text-[rgb(var(--kg-secondary-fixed))]"></span></div><div class="w-full grid grid-cols-3 gap-1.5 mt-5 py-3 px-2 rounded-xl bg-surface-container-low"><div class="flex flex-col items-center"><span data-kg-person-age-label class="text-[9px] uppercase tracking-wider text-[rgb(var(--kg-text-muted))] text-center">${uiText("Возраст")}</span><span data-kg-person-age class="text-sm font-semibold mt-1"></span></div><div class="flex flex-col items-center"><span class="text-[9px] uppercase tracking-wider text-[rgb(var(--kg-text-muted))]">${uiText("Фильмы")}</span><span data-kg-person-count class="text-sm font-semibold text-[rgb(var(--kg-primary))] mt-1">—</span></div><div class="flex flex-col items-center"><span class="text-[9px] uppercase tracking-wider text-[rgb(var(--kg-text-muted))]">${uiText("Профессия")}</span><span data-kg-person-stat-role class="text-sm font-semibold text-[rgb(var(--kg-primary-fixed))] mt-1"></span></div></div><button type="button" data-kg-person-best class="w-full h-12 mt-4 rounded-full bg-[rgb(var(--kg-primary-container))] text-[rgb(var(--kg-on-primary-fixed))] font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"><span class="material-symbols-outlined">local_fire_department</span><span data-kg-person-best-label>${uiText("Смотреть лучшие роли")}</span></button></div></section><section class="px-4 mt-7"><div class="flex items-center justify-between mb-3"><h2 data-kg-person-bio-heading class="text-lg font-semibold text-[rgb(var(--kg-warm-text-28))]">${uiText("Об актёре")}</h2><span class="text-[9px] uppercase tracking-widest text-[rgb(var(--kg-primary-container))]">${uiText("Биография")}</span></div><div class="rounded-xl bg-[rgb(var(--kg-neutral-71))] p-4"><p data-kg-person-bio class="text-sm leading-relaxed text-[rgb(var(--kg-on-surface-variant))] kgpi-bio-clamp"></p><button type="button" data-kg-person-bio-toggle class="mt-3 text-xs font-semibold text-[rgb(var(--kg-primary-container))]">${uiText("Читать полностью")}</button></div></section><section class="px-4 mt-7"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-[rgb(var(--kg-primary-container))]">movie</span><h2 class="text-lg font-semibold text-[rgb(var(--kg-warm-text-28))]">${uiText("Фильмография в Moven: Explore")}</h2></div><span data-kg-person-credit-total class="text-xs text-[rgb(var(--kg-primary-container))]"></span></div><p data-kg-person-credit-subtitle class="text-xs text-[rgb(var(--kg-text-muted))] mb-3"></p><div data-kg-person-films class="flex flex-col gap-2.5"><span class="text-sm text-[rgb(var(--kg-text-muted))]">${uiText("Загружаем фильмы…")}</span></div></section></div></section>`;
    // Native modal dialogs live in the browser top layer. A profile appended to
    // body would sit behind an open Journey dialog and look like a dead click.
    const ownerDialog=sourceElement?.closest?.("dialog[open]");
    (ownerDialog||document.body).appendChild(root);
    const dialog=root.querySelector(".kgpi-modal");
    root.addEventListener("click",e=>{
      if(e.target===root||e.target.closest("[data-kg-person-close]")){closePerson();return;}
      if(e.target.closest("[data-kg-person-best]")){const list=root.querySelector("[data-kg-person-films]");dialog.scrollTo({top:dialog.scrollTop+list.getBoundingClientRect().top-dialog.getBoundingClientRect().top-16,behavior:"smooth"});return;}
      if(e.target.closest("[data-kg-person-bio-toggle]")){const bio=root.querySelector("[data-kg-person-bio]"),button=e.target.closest("[data-kg-person-bio-toggle]"),expanded=bio.classList.toggle("kgpi-bio-clamp");button.textContent=uiText(expanded?"Читать полностью":"Свернуть");return;}
      const filmButton=e.target.closest("[data-kg-person-film-open]");if(filmButton){
        const filmPool=personFilmPools.get(String(id))||[];
        const film=filmPool.find(item=>String(item.id)===filmButton.dataset.kgPersonFilmOpen);
        if(film) window.KGFilmCard.openDialog({...film,_kgRelatedPool:filmPool},filmButton);
      }
    });
    try{
      const personPath = `person/${id}`;
      const profileLocale = interfaceLanguage === "en" ? "en-US" : "ru-RU";
      const sharedLocale = profileLocale === filmLocale;
      let data = personCache.get(id);
      if (!data) {
        const params = sharedLocale ? {append_to_response: "movie_credits"} : {};
        data = await tmdb(personPath, params, profileLocale);
        personCache.set(id, data);
      }
      if(!root.isConnected)return;
      const actor=data.known_for_department==="Acting"||/акт[её]р/i.test(role||""),profession=actor?"Актёр":"Режиссёр";
      root.querySelector("[data-kg-person-bio-heading]").textContent=uiText(actor?"Об актёре":"О режиссёре");
      root.querySelector("[data-kg-person-best-label]").textContent=uiText(actor?"Смотреть лучшие роли":"Смотреть лучшие фильмы");
      root.querySelector("[data-kg-person-title]").textContent=data.name||name;
      root.querySelector("[data-kg-person-original]").textContent=data.also_known_as?.[0]||"";
      root.querySelector("[data-kg-person-department]").textContent=uiText(profession);
      root.querySelector("[data-kg-person-stat-role]").textContent=uiText(profession);
      root.querySelector("[data-kg-person-age]").textContent=ageFromBirthday(data.birthday, data.deathday);
      root.querySelector("[data-kg-person-age-label]").textContent =
        uiText(data.deathday ? "Возраст на момент смерти" : "Возраст");
      const birthplace=data.place_of_birth||uiText("Место рождения не указано");root.querySelector("[data-kg-person-location]").textContent=`⌖ ${birthplace}`;
      const bio=data.biography?.trim()||uiText("Биография пока недоступна на русском языке.");root.querySelector("[data-kg-person-bio]").textContent=bio;
      const photo=root.querySelector("[data-kg-person-image]");if(data.profile_path)photo.innerHTML=`<img class="h-full w-full object-cover" src="${image(data.profile_path,"w500")}" alt="${esc(data.name)}">`;
      let movieCredits = data.movie_credits;
      if (!movieCredits) {
        try {
          movieCredits = await tmdb(`${personPath}/movie_credits`, {}, filmLocale);
          data.movie_credits = movieCredits;
        } catch (error) {
          if (root.isConnected) {
            root.querySelector("[data-kg-person-films]").textContent = uiText("Не удалось загрузить фильмографию. Проверьте подключение к TMDB.");
          }
          console.warn("[Moven: Explore] person filmography:",error);
          return;
        }
      }
      if (!root.isConnected) return;
      const castCredits=(movieCredits.cast||[]).map(f=>({
        ...localizeFilmListItem(f),
        _personRole:f.character?uiText("Роль: {character}", {character: f.character}):"Актёр"
      }));
      const crewCredits=(movieCredits.crew||[]).map(f=>({
        ...localizeFilmListItem(f),
        _personRole:f.job==="Director"?"Режиссёр":f.job||"Участие в проекте"
      }));
      const allCredits=castCredits.concat(crewCredits).filter(f=>f.id);
      let credits=actor?castCredits:crewCredits.filter(f=>f.job==="Director");
      if(!credits.length)credits=allCredits;
      credits.sort((a,b)=>(b.popularity||0)-(a.popularity||0));
      const dedup=[...new Map(credits.map(f=>[String(f.id),f])).values()].slice(0,30);personFilmPools.set(String(id),dedup);
      root.querySelector("[data-kg-person-count]").textContent=String(dedup.length);
      root.querySelector("[data-kg-person-credit-total]").textContent=uiText(interfaceLanguage==="en"&&dedup.length===1?"{count} фильм":"{count} фильмов", {count: dedup.length});
      root.querySelector("[data-kg-person-credit-subtitle]").textContent=uiText(actor?"Главные и заметные роли {name}":"Фильмы, снятые {name}", {name: data.name||name});
      const profile = {known_for_department: data.known_for_department, _profileRole: role || ""};
      root.querySelector("[data-kg-person-films]").innerHTML=dedup.length?dedup.map(f=>creditCard(f,profile)).join(""):`<span class="text-sm text-[rgb(var(--kg-text-muted))]">${uiText("Фильмы не найдены.")}</span>`;
      const backdrop=dedup.find(f=>f.backdrop_path)?.backdrop_path;if(backdrop)root.querySelector("[data-kg-person-backdrop]").style.backgroundImage=`linear-gradient(0deg,rgb(var(--kg-surface)) 0%,transparent 85%),url("${image(backdrop,"w780")}")`;
    }catch(error){if(root.isConnected){root.querySelector("[data-kg-person-original]").textContent="";root.querySelector("[data-kg-person-credit-total]").textContent="";root.querySelector("[data-kg-person-films]").innerHTML=`<span class="text-sm text-[rgb(var(--kg-text-muted))]">${uiText("Не удалось загрузить профиль. Проверьте подключение к TMDB.")}</span>`;}console.warn("[Moven: Explore] person profile:",error);}
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
    }catch(error){list.innerHTML=`<span class="text-xs text-[rgb(var(--kg-text-muted))]">${uiText("Не удалось загрузить похожие фильмы.")}</span>`;console.warn("[Moven: Explore] related films:",error);}
  }
  function paint(section,films){const list=section.querySelector("[data-kg-related-list]");if(!list)return;list.innerHTML=films.length?films.map(filmButton).join(""):`<span class="text-xs text-[rgb(var(--kg-text-muted))]">${uiText("В этом списке больше нет похожих фильмов.")}</span>`;}
  // Apply carousel poster sizing on every screen, not just after opening a person profile.
  ensureStyles();
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-related-films]"))related(node);node.querySelectorAll?.("[data-kg-related-films]").forEach(related);}))) ;
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-related-films]").forEach(related);
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
      if(film)window.KGFilmCard.openDialog({
        ...film,_kgRelatedPool:pool,_kgGlobalRelated:section.dataset.globalRelated==="true",
        _oscarContext:section.dataset.placement==="oscar"
      },button);
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
  window.KGOpenPersonProfile=showPerson;
  window.KGScrollToFilmDescription=scrollToDescription;
  window.KGScrollPersonModalToFilm=scrollPersonModalToFilm;
})();
