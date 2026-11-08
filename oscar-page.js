(function(){
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const image=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const state={films:[],decade:"all",shown:5,feature:null,featureDetails:null,selected:null,loading:false,loaded:false,modalFilm:null,request:0};
  let boundRoot=null;
  const yearOf=f=>Number((f.release_date||"").slice(0,4))||0;
  const decadeOf=y=>y<1960?"gold":`${Math.floor(y/10)*10}`;
  const decadeLabel=(id,count)=>id==="all"?`Все (${count})`:id==="gold"?`Золотой Голливуд (${count})`:`${id.slice(0,3)}0-е (${count})`;
  const watchedCount=deps=>state.films.filter(f=>deps.isWatched(f.id)).length;
  const detailPromises=new Map();
  function detailFor(deps,id){
    if(!detailPromises.has(id)){
      const request=Promise.resolve().then(()=>deps.details(id)).catch(error=>{detailPromises.delete(id);throw error;});
      detailPromises.set(id,request);
    }
    return detailPromises.get(id);
  }
  async function mapLimit(items,limit,fn){
    let next=0;
    await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
      while(next<items.length){const index=next++;await fn(items[index],index);}
    }));
  }
  function decadeOptions(){
    const groups=new Map();
    state.films.forEach(f=>{const y=yearOf(f);if(!y)return;const id=decadeOf(y);groups.set(id,(groups.get(id)||0)+1);});
    return [...groups].sort(([a],[b])=>a==="gold"?1:b==="gold"?-1:Number(b)-Number(a));
  }
  function currentFilms(){
    const sorted=state.films.filter(f=>state.decade==="all"||decadeOf(yearOf(f))===state.decade)
      .sort((a,b)=>yearOf(b)-yearOf(a)||Number(b.vote_average||0)-Number(a.vote_average||0));
    return sorted.slice(0,state.shown);
  }
  function render(root,deps){
    state.films=[];state.decade="all";state.shown=5;state.feature=null;state.featureDetails=null;state.selected=null;state.loaded=false;
    root.innerHTML=`<div class="flex flex-col w-full pb-safe max-w-[520px] mx-auto overflow-hidden">
    <div class="flex items-center justify-between px-gutter-mobile pt-2"><button type="button" data-oscar-back class="w-11 h-11 -ml-1.5 flex items-center gap-1.5 text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[22px]">arrow_back</span><span class="font-label-sm text-label-sm">Подборки</span></button><span class="font-micro-caption text-micro-caption text-text-muted">КИНОГЛОБУС · OSCAR WINNERS</span></div>
<div class="relative w-full px-gutter-mobile pt-space-md"><div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-panel to-surface-container-lowest p-space-lg shadow-xl shadow-canvas-obsidian/80">
<div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><div class="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-cinema-velvet-glow blur-3xl pointer-events-none"></div>
<div class="relative flex flex-col items-center text-center"><div class="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container shadow-inner mb-space-sm"><div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-container/20 to-transparent"></div><span class="material-symbols-outlined text-[34px] text-primary-container" style="font-variation-settings:'FILL' 1;">workspace_premium</span><div class="absolute -bottom-1 px-2 py-0.5 rounded-full bg-surface-panel shadow-sm"><span class="font-micro-caption text-micro-caption text-primary font-semibold tracking-wider" id="oscar-age">ОСКАР</span></div></div>
<h1 class="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 mb-1.5">Зал славы Оскара</h1><p class="font-body-sm text-body-sm text-text-muted max-w-xs mb-space-md">Случайный выбор лучшего фильма или персональная хроника картин, отмеченных Академией</p>
<button class="w-full flex items-center justify-between gap-space-sm bg-gradient-to-r from-primary-container via-primary-fixed-dim to-primary px-space-md py-3.5 rounded-xl text-on-primary-fixed shadow-lg shadow-cinema-amber-glow active:scale-[0.98] transition-all duration-200" id="oscar-roulette">
<span class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined text-[22px]">casino</span><span class="font-label-lg text-label-lg tracking-tight truncate">Случайный лауреат</span></span><span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas-obsidian/20 shrink-0"><span class="font-micro-caption text-micro-caption font-bold" id="oscar-total">Загружаем…</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></span></button>
</div></div></div>
<section class="w-full mt-space-lg"><div class="px-gutter-mobile flex items-center justify-between mb-space-xs"><span class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Эпохи кинематографа</span><span class="font-micro-caption text-micro-caption text-primary" id="oscar-range">История премии</span></div><div class="flex items-center gap-2 overflow-x-auto px-gutter-mobile py-1 no-scrollbar scroll-smooth" id="oscar-decades"></div></section>
<section class="px-gutter-mobile mt-space-lg"><div class="flex items-center justify-between mb-space-xs"><div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[18px]">auto_awesome</span><span class="font-headline-sm text-headline-sm text-on-surface">Лауреат дня</span></div><span class="font-micro-caption text-micro-caption px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-semibold" id="oscar-feature-label">Сегодня</span></div><div id="oscar-feature"></div></section>
<div id="oscar-film-detail" class="px-gutter-mobile mt-3"></div>
<section class="px-gutter-mobile mt-space-lg"><div class="p-space-md rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-panel to-surface-container-lowest shadow-md">
<div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[18px]">public</span></div><span class="font-headline-sm text-headline-sm text-on-surface">География триумфов</span></div><span class="font-micro-caption text-micro-caption text-primary" id="oscar-country-total">Считаем страны…</span></div>
<p class="font-body-sm text-body-sm text-text-muted mb-space-sm">Страны производства в первых 24 фильмах списка лауреатов.</p><div class="flex flex-wrap gap-1.5 mb-3" id="oscar-countries"><span class="font-micro-caption text-micro-caption text-text-muted">Загружаем данные о странах…</span></div>
<div class="flex flex-col gap-1"><div class="flex items-center justify-between text-micro-caption font-micro-caption"><span class="text-text-muted">Прогресс просмотра лауреатов</span><span class="text-primary font-semibold" id="oscar-progress">0 из 0 (0%)</span></div><div class="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden"><div class="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full transition-all" id="oscar-progress-bar" style="width:0%"></div></div></div>
</div></section>
<section class="px-gutter-mobile mt-space-lg mb-space-lg"><div class="flex items-center justify-between mb-space-sm"><div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[20px]">movie_filter</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Легендарные триумфаторы</h2></div><span class="font-label-sm text-label-sm text-primary flex items-center gap-0.5">Хронология <span class="material-symbols-outlined text-[16px]">swap_vert</span></span></div><div class="flex flex-col gap-space-sm" id="oscar-list"></div><button type="button" class="w-full mt-2 py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md" id="oscar-more" hidden>Показать ещё</button><p class="font-body-sm text-body-sm text-feedback-error mt-2" id="oscar-error" role="status" hidden></p></section>
<div class="fixed inset-0 z-[60] hidden items-end justify-center bg-canvas-obsidian/80 backdrop-blur-md" id="oscar-modal"><div class="w-full max-w-[520px] p-space-lg rounded-t-3xl bg-surface-panel shadow-2xl relative"><div class="w-12 h-1 bg-surface-container-highest rounded-full mx-auto mb-space-md"></div><div class="flex items-center justify-between mb-space-sm"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[24px]">casino</span><span class="font-headline-sm text-headline-sm text-primary">Кинорулетка Оскара</span></div><button class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-muted" id="oscar-modal-close" aria-label="Закрыть"><span class="material-symbols-outlined text-[20px]">close</span></button></div><div class="relative w-full min-h-32 rounded-xl bg-surface-container-lowest flex items-center justify-center my-space-md p-4 text-center"><div class="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-surface-container-lowest to-transparent pointer-events-none"></div><div id="oscar-slot" class="flex flex-col items-center gap-2 transition-transform duration-300"><span class="font-headline-lg text-headline-lg text-primary">Выберите лауреата</span></div></div><div class="flex gap-2"><button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-container to-primary-fixed-dim text-on-primary-fixed font-label-md text-label-md font-bold shadow-md active:scale-95 transition-all" id="oscar-spin-again">Крутить ещё раз</button><button class="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold active:scale-95 transition-all" id="oscar-open-result" disabled>О фильме</button></div></div></div>
</div>`;
    if(boundRoot!==root){
      root.addEventListener("click",e=>handleClick(e,root,deps));
      boundRoot=root;
    }
    load(root,deps);
  }
  async function load(root,deps){
    const token=++state.request,error=root.querySelector("#oscar-error");
    if(!deps.hasKey()){error.textContent="Добавьте ключ TMDB на экране «Глобус», чтобы загрузить лауреатов.";error.hidden=false;return;}
    try{
      state.loading=true;error.hidden=true;
      const films=await deps.getFilms();
      if(token!==state.request)return;
      state.films=films.filter(f=>f&&f.id&&yearOf(f)).sort((a,b)=>yearOf(b)-yearOf(a));
      state.loaded=true;
      if(!state.films.length)throw new Error("Список лауреатов не содержит фильмов с датой выхода.");
      const years=state.films.map(yearOf);
      root.querySelector("#oscar-total").textContent=`${state.films.length} фильмов`;
      root.querySelector("#oscar-age").textContent=`${Math.max(...years)-Math.min(...years)} ЛЕТ`;
      root.querySelector("#oscar-range").textContent=`${Math.min(...years)} — ${Math.max(...years)}`;
      const day=Math.floor((Date.now()-Date.UTC(new Date().getUTCFullYear(),0,0))/86400000);
      state.feature=state.films[(day-1+state.films.length)%state.films.length];
      renderDecades(root);renderFeature(root,deps);renderList(root,deps);renderProgress(root,deps);
      loadFeatureDetails(root,deps);
      loadCountries(root,deps).catch(error=>console.warn("[Kinoglobus] Не удалось загрузить географию лауреатов:",error));
    }catch(e){
      if(token!==state.request)return;
      error.textContent=e.message||"Не удалось загрузить список лауреатов.";
      error.hidden=false;
    }finally{if(token===state.request)state.loading=false;}
  }
  function renderDecades(root){
    const options=decadeOptions(),counts=Object.fromEntries(options);
    root.querySelector("#oscar-decades").innerHTML=[["all",state.films.length],...options].map(([id,count])=>{
      const selected=id===state.decade;
      return `<button type="button" class="decade-chip shrink-0 px-3.5 py-1.5 rounded-full ${selected?"bg-primary-container text-on-primary-container shadow-md font-semibold":"bg-surface-container text-text-muted font-medium"} font-label-sm text-label-sm transition-all hover:text-on-surface" data-decade="${id}">${decadeLabel(id,count)}</button>`;
    }).join("");
  }
  function renderFeature(root,deps){
    const f=state.feature;if(!f)return;
    const d=state.featureDetails||{};
    const title=esc(f.title||f.original_title||"Фильм"),year=yearOf(f),rating=Number(f.vote_average)||0;
    const backdrop=f.backdrop_path||f.poster_path;
    const countries=(d.countries||f.origin_country||[]).slice(0,2).map(c=>deps.countryName(c)).filter(Boolean);
    const director=(d.dirs||[])[0]||"";
    const runtime=d.runtime?`${d.runtime} мин`:"";
    const bg=backdrop?`<img class="w-full h-full object-cover" alt="Кадр из фильма «${title}»" src="${image(backdrop,"w780")}">`:'<div class="w-full h-full bg-surface-container-high"></div>';
    root.querySelector("#oscar-feature").innerHTML=`<article class="relative overflow-hidden rounded-2xl bg-surface-panel shadow-2xl p-3.5">
<div class="relative w-full h-56 rounded-xl overflow-hidden bg-surface-container-high">${bg}<div class="absolute inset-0 bg-gradient-to-t from-surface-panel via-surface-panel/40 to-transparent"></div>
<div class="absolute top-2.5 left-2.5 flex items-center gap-1.5"><span class="px-2 py-1 rounded-md bg-canvas-obsidian/85 text-primary font-label-sm text-label-sm font-bold shadow-sm">★ ${rating?rating.toFixed(1):"—"}</span>${runtime?`<span class="px-2 py-1 rounded-md bg-canvas-obsidian/85 text-on-surface font-micro-caption text-micro-caption">${runtime}</span>`:""}</div>
<div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-cinema-velvet-deep/90 text-secondary font-label-sm text-label-sm font-semibold shadow-md"><span class="material-symbols-outlined text-[15px] align-middle mr-1">military_tech</span>Лауреат</div>
<div class="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2"><div class="min-w-0"><div class="font-label-sm text-label-sm text-on-surface-variant mb-0.5">${countries.join(" / ")||"Кинематограф мира"} · ${year}</div><h2 class="font-headline-md text-headline-md text-on-surface font-bold drop-shadow truncate">${title}</h2></div><span class="text-text-muted font-body-sm text-body-sm shrink-0">${esc(director)}</span></div></div>
<div class="flex flex-wrap gap-1.5 mt-3"><span class="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-micro-caption text-micro-caption font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[13px] text-primary-container">trophy</span>Фильм — лауреат «Оскара»</span><span class="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-micro-caption text-micro-caption">${year}</span></div>
<div class="grid grid-cols-2 gap-2 mt-3.5"><button type="button" data-oscar-open="${f.id}" class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-colors active:scale-[0.98]"><span class="material-symbols-outlined text-[18px]">play_circle</span><span>Трейлер и детали</span></button><button type="button" data-oscar-watched="${f.id}" class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl ${deps.isWatched(f.id)?"bg-primary text-on-primary":"bg-secondary-container/60 text-secondary-fixed"} font-label-md text-label-md transition-colors active:scale-[0.98]"><span class="material-symbols-outlined text-[18px]">check_circle</span><span>${deps.isWatched(f.id)?"Просмотрено":"В просмотренные"}</span></button></div><div id="oscar-feature-detail-${f.id}" data-oscar-detail-host></div></article>`;
    if(deps.refreshFilm)deps.refreshFilm();
  }
  async function loadFeatureDetails(root,deps){
    const f=state.feature;if(!f)return;
    try{state.featureDetails=await detailFor(deps,f.id);renderFeature(root,deps);}
    catch(e){console.warn("[Kinoglobus] Не удалось загрузить сведения о лауреате дня:",e);}
  }
  async function loadCountries(root,deps){
    const request=state.request,films=state.films.slice(0,12),counts=new Map();
    await mapLimit(films,4,async f=>{
      const direct=(f.origin_country||[]).filter(Boolean);
      let countries=direct;
      if(!countries.length){
        try{const d=f.id===state.feature?.id&&state.featureDetails?state.featureDetails:await detailFor(deps,f.id);countries=d.countries||[];}catch(_){}
      }
      countries.forEach(c=>counts.set(c,(counts.get(c)||0)+1));
    });
    if(request!==state.request||!root.isConnected)return;
    const ordered=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,6);
    root.querySelector("#oscar-country-total").textContent=ordered.length?`${ordered.length} стран в выборке`:"Данные о странах недоступны";
    root.querySelector("#oscar-countries").innerHTML=ordered.length?ordered.map(([cc,n])=>`<div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"><span>${esc(deps.countryName(cc))}</span><span class="text-primary font-bold ml-0.5">${n}</span></div>`).join(""):'<span class="font-micro-caption text-micro-caption text-text-muted">TMDB не предоставил данные о странах для списка.</span>';
  }
  function renderProgress(root,deps){
    const n=watchedCount(deps),total=state.films.length,pct=total?Math.round(n/total*100):0;
    root.querySelector("#oscar-progress").textContent=`${n} из ${total} просмотрено (${pct}%)`;
    root.querySelector("#oscar-progress-bar").style.width=pct+"%";
  }
  function renderList(root,deps){
    const list=currentFilms(),box=root.querySelector("#oscar-list");
    box.innerHTML=list.length?list.map(f=>{
      const d=f._details||{},title=esc(f.title||f.original_title||"Фильм"),y=yearOf(f);
      const countries=(f.origin_country||d.countries||[]).slice(0,2).map(cc=>deps.countryName(cc)).filter(Boolean).join(" / ");
      const directors=(d.dirs||[]).slice(0,1).join(", ");
      return `<article class="group relative flex gap-3 p-2.5 rounded-xl bg-surface-panel hover:bg-surface-container transition-all">
<button type="button" class="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container-high shadow-md text-left" data-oscar-open="${f.id}">${f.poster_path?`<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Постер «${title}»" src="${image(f.poster_path,"w185")}">`:""}<span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-canvas-obsidian/85 text-primary font-micro-caption text-micro-caption font-bold">★ ${Number(f.vote_average||0).toFixed(1)}</span></button>
<div class="flex flex-col justify-between min-w-0 flex-1 py-0.5"><div><div class="flex items-center justify-between gap-1"><span class="font-micro-caption text-micro-caption text-primary flex items-center gap-1 truncate"><span>${esc(countries||"Кинематограф мира")}</span><span>• ${y}</span></span><span class="font-micro-caption text-micro-caption px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary font-semibold shrink-0">Лауреат</span></div>
<button type="button" data-oscar-open="${f.id}" class="text-left w-full"><h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate mt-0.5">${title}</h3></button><p class="font-body-sm text-body-sm text-text-muted line-clamp-1 mt-0.5">${esc(f.overview||"Фильм из коллекции лауреатов премии Американской киноакадемии.")}</p></div>
<div class="flex items-center justify-between pt-1"><span class="font-micro-caption text-micro-caption text-on-surface-variant font-medium truncate">${directors?`Реж. ${esc(directors)}`:"Лауреат «Оскара»"}</span><button type="button" data-oscar-watched="${f.id}" aria-label="${deps.isWatched(f.id)?"Уже просмотрено":"Отметить просмотренным"}" class="w-8 h-8 rounded-full ${deps.isWatched(f.id)?"bg-primary text-on-primary":"bg-surface-container-highest text-primary"} flex items-center justify-center transition-colors"><span class="material-symbols-outlined text-[18px]">${deps.isWatched(f.id)?"task_alt":"bookmark_add"}</span></button></div></div><div id="oscar-list-detail-${f.id}" data-oscar-detail-host></div></article>`;
    }).join(""):`<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">В этом десятилетии нет фильмов в загруженном списке.</p>`;
    const more=root.querySelector("#oscar-more");
    more.hidden=state.shown>=state.films.filter(f=>state.decade==="all"||decadeOf(yearOf(f))===state.decade).length;
    if(deps.refreshFilm)deps.refreshFilm();
    if(state.films.length){
      const detailsQueue=list.filter(f=>!f._details);
      mapLimit(detailsQueue,4,async f=>{try{f._details=await detailFor(deps,f.id);}catch(_){f._details={};}}).then(()=>{
        if(root.isConnected)renderList(root,deps);
      });
    }
  }
  function handleClick(e,root,deps){
    if(e.target.closest("[data-oscar-back]")){deps.back();return;}
    if(e.target.closest('[data-act="close-film"]')){deps.closeFilm("oscar");return;}
    const decade=e.target.closest("[data-decade]");
    if(decade){state.decade=decade.dataset.decade;state.shown=5;renderDecades(root);renderList(root,deps);return;}
    if(e.target.closest("#oscar-more")){state.shown+=5;renderList(root,deps);return;}
    if(e.target.closest("#oscar-roulette")){openModal(root);pickWinner(root,deps);return;}
    if(e.target.closest("#oscar-modal-close")){closeModal(root);return;}
    if(e.target.closest("#oscar-spin-again")){pickWinner(root,deps);return;}
    if(e.target.closest("#oscar-open-result")){
      if(state.modalFilm)deps.openFilm(state.modalFilm,"oscar");
      closeModal(root);return;
    }
    const open=e.target.closest("[data-oscar-open]");
    if(open){const f=state.films.find(item=>String(item.id)===open.dataset.oscarOpen);if(f){const host=open.closest("article")?.querySelector("[data-oscar-detail-host]");deps.openFilm(f,"oscar",host?.id||"oscar-film-detail");}return;}
    const watched=e.target.closest("[data-oscar-watched]");
    if(watched){
      const f=state.films.find(item=>String(item.id)===watched.dataset.oscarWatched);
      if(f)deps.markWatched(f).then(()=>{renderFeature(root,deps);renderList(root,deps);renderProgress(root,deps);});
    }
  }
  function openModal(root){
    const modal=root.querySelector("#oscar-modal");modal.classList.remove("hidden");modal.classList.add("flex");
  }
  function closeModal(root){
    const modal=root.querySelector("#oscar-modal");modal.classList.add("hidden");modal.classList.remove("flex");
  }
  function pickWinner(root,deps){
    const pool=state.decade==="all"?state.films:state.films.filter(f=>decadeOf(yearOf(f))===state.decade);
    const slot=root.querySelector("#oscar-slot"),open=root.querySelector("#oscar-open-result");
    if(!pool.length){slot.innerHTML='<span class="font-body-sm text-text-muted">В этой эпохе нет лауреатов.</span>';open.disabled=true;return;}
    open.disabled=true;slot.style.opacity=".35";slot.style.transform="scale(.9)";
    setTimeout(()=>{
      const f=pool[Math.floor(Math.random()*pool.length)];state.modalFilm=f;
      slot.innerHTML=`<div class="font-headline-lg text-headline-lg text-primary font-bold">${esc(f.title||f.original_title)}</div><div class="text-body-sm font-body-sm text-text-muted">${yearOf(f)} · Лауреат премии «Оскар»</div>`;
      slot.style.opacity="1";slot.style.transform="scale(1)";open.disabled=false;
    },280);
  }
  window.KGOscarPage={render};
})();
