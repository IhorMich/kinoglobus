(function(){
  const moods=[
    {id:"wine",emoji:"🍷",title:"«Для уютного вечера с бокалом»",tag:"#Уют #Эстетика",description:"Тёплый вечер, приглушённый свет, изящные диалоги и живописная эстетика европейских улиц.",countries:["FR","IT","ES","PT","AR"],genres:[18,10749],labels:["🇫🇷 Франция","🇮🇹 Италия","🇪🇸 Испания"],genreLabel:"Романтика · Драма"},
    {id:"mindfuck",emoji:"🧠",title:"«Взрыв мозга / Психоделика»",tag:"#ЛабиринтыРазума",description:"Запутанные сюжетные петли, сюрреализм, гипнотический саундтрек и глубокий экзистенциальный шок.",countries:["JP","KR","GB","US","FR"],genres:[53,9648,878],labels:["🇯🇵 Япония","🇬🇧 Великобритания","🇰🇷 Южная Корея"],genreLabel:"Неонуар · Триллер"},
    {id:"adrenaline",emoji:"🍿",title:"«Динамичный вечер / Адреналин»",tag:"#Драйв #Неон",description:"Пульсирующий темп, филигранная хореография боёв, погони в неоновом дожде и чистый драйв.",countries:["HK","KR","ID","US"],genres:[28,80,53],labels:["🇭🇰 Гонконг","🇰🇷 Южная Корея","🇮🇩 Индонезия"],genreLabel:"Боевик · Криминал"},
    {id:"melancholy",emoji:"🌧️",title:"«Меланхолия и дождь»",tag:"#Скандинавия #СеверныйВетер",description:"Свинцовое северное небо, холодные фьорды, неспешный ритм и философское одиночество.",countries:["DK","SE","IS","NO","FI"],genres:[18,9648],labels:["🇩🇰 Дания","🇸🇪 Швеция","🇮🇸 Исландия"],genreLabel:"Скандинавский нуар"},
    {id:"sunshine",emoji:"☀️",title:"«Солнечный побег / Дофамин»",tag:"#Солнце #Энергия",description:"Искренний юмор, тёплое побережье, жизнеутверждающая драма без фальши.",countries:["MX","BR","AR","ES","IN"],genres:[35,12,10751],labels:["🇲🇽 Мексика","🇧🇷 Бразилия","🇦🇷 Аргентина"],genreLabel:"Комедия · Драма"}
  ];
  const runtimes=[
    {id:"short",label:"Короткий метр (< 90 мин)",button:"<90 мин",icon:"bolt",test:m=>m>0&&m<90},
    {id:"classic",label:"Классика (90–120 мин)",button:"90–120 мин",icon:"schedule",test:m=>m>=90&&m<=120},
    {id:"epic",label:"Эпопея (150+ мин)",button:"150+ мин",icon:"movie",test:m=>m>=150},
    {id:"any",label:"Любой",button:"любой хронометраж",icon:"all_inclusive",test:()=>true}
  ];
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const poster=(path,size="w185")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const state={mood:"wine",runtime:"short",films:[],loading:false,loadedKey:"",token:0,spinToken:0};
  let boundRoot=null;
  const currentMood=()=>moods.find(m=>m.id===state.mood)||moods[0];
  const currentRuntime=()=>runtimes.find(r=>r.id===state.runtime)||runtimes[0];
  function filtered(){return state.films.filter(f=>currentRuntime().test(f.runtime||0));}
  function updateCounts(root){
    const n=filtered().length,m=currentMood(),r=currentRuntime();
    const counter=root.querySelector("#mood-runtime-count"),pool=root.querySelector("#mood-pool-count"),launch=root.querySelector("#mood-launch-label");
    if(counter)counter.textContent=state.loading?"Ищем фильмы…":`Найдено: ${n} ${n===1?"картина":"картин"}`;
    if(pool)pool.textContent=`В пуле: ${n} ${n===1?"фильм":"фильмов"} · ${m.countries.length} стран`;
    if(launch)launch.textContent=`Запустить рулетку (${m.emoji} + ${r.button})`;
    const activeCount=root.querySelector(`[data-mood-card="${state.mood}"] .mood-count`);
    if(activeCount)activeCount.textContent=state.loading?"Ищем фильмы…":`${state.films.length} в выборке`;
  }
  function renderFilms(root){
    const box=root.querySelector("#mood-films");if(!box)return;
    const films=filtered();
    if(state.loading){box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Загружаем фильмы и хронометраж из TMDB…</p>';return;}
    if(!films.length){box.innerHTML='<p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Нет фильмов для выбранного настроения и хронометража. Выберите другой интервал или настроение.</p>';return;}
    box.innerHTML=films.map(f=>{
      const target=`mood-film-detail-${f.id}`,detail=f.detail||{},year=(f.release_date||"").slice(0,4);
      return `<article class="flex flex-col gap-2 p-3 rounded-xl bg-surface-panel shadow-md"><button type="button" class="flex items-center gap-3 text-left" data-mood-film="${f.id}" data-detail-target="${target}">
<span class="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container-lowest">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер «${esc(f.title||f.original_title)}»" src="${poster(f.poster_path)}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-primary-container">movie</span>'}<span class="absolute bottom-1 left-1 px-1 rounded bg-canvas-obsidian/85 text-primary font-micro-caption text-micro-caption font-bold">★ ${Number(f.vote_average||0).toFixed(1)}</span></span>
<span class="min-w-0 flex-1"><span class="block font-micro-caption text-micro-caption text-text-muted">${year}${detail.runtime?` · ${detail.runtime} мин`:""}</span><span class="block font-headline-sm text-headline-sm text-on-surface font-semibold">${esc(f.title||f.original_title||"Фильм")}</span><span class="block font-body-sm text-body-sm text-text-muted line-clamp-2 mt-1">${esc(detail.overview||f.overview||"Описание пока недоступно.")}</span><span class="block font-micro-caption text-micro-caption text-primary-container mt-1">Трейлер и подробности</span></span></button><div id="${target}"></div></article>`;
    }).join("");
  }
  function render(root,deps){
    root.innerHTML=`
<div class="flex flex-col w-full pb-8">
<div class="flex items-center justify-between pt-2 pb-1"><button type="button" data-mood-back class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[20px]">arrow_back</span><span class="font-label-sm text-label-sm">Подборки</span></button><span class="font-micro-caption text-micro-caption text-primary/80 uppercase tracking-widest">Mood &amp; Vibe</span></div>
<div class="relative w-full rounded-2xl overflow-hidden bg-surface-container-low p-3.5 shadow-xl mb-2">
<div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><div class="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-cinema-velvet-glow blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col gap-1.5"><div class="flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-fixed-dim"><span class="material-symbols-outlined text-[14px]">sensors</span><span class="font-micro-caption text-micro-caption tracking-widest uppercase">Эмоциональный навигатор</span></div>
<h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">Кино под твоё настроение</h1><p class="font-body-sm text-body-sm text-text-muted leading-relaxed">Забудьте сухие жанры. Выбирайте атмосферу вечера, а Киноглобус подберёт шедевры мирового кино.</p></div></div>
<section class="flex flex-col mb-4"><div class="flex items-center justify-between mb-1 px-1"><div class="flex items-center gap-1.5 text-primary-fixed-dim"><span class="material-symbols-outlined text-[18px]">timelapse</span><span class="font-label-md text-label-md tracking-wide">Хронометраж сеанса</span></div><span class="font-micro-caption text-micro-caption px-2 py-0.5 rounded-full bg-surface-container-high text-primary" id="mood-runtime-count">Подборка загружается…</span></div>
<div class="flex items-center gap-2 overflow-x-auto py-1 -mx-gutter-mobile px-gutter-mobile">${runtimes.map((r,i)=>`<button class="mood-runtime shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-full ${i===0?"bg-primary-container text-on-primary shadow-[0_0_18px_rgba(255,184,48,0.28)]":"bg-surface-container text-text-muted"} font-label-sm text-label-sm transition-all active:scale-95" data-runtime="${r.id}" type="button"><span class="material-symbols-outlined text-[16px]">${r.icon}</span><span>${r.label.replace("<","&lt;")}</span></button>`).join("")}</div>
<div class="mt-2 px-3 py-2 rounded-xl bg-surface-container-lowest/80 flex items-start gap-2"><span class="material-symbols-outlined text-primary-container text-[16px] mt-0.5">tips_and_updates</span><p class="font-micro-caption text-micro-caption text-text-muted italic">«Мало времени вечером? Никаких трёхчасовых драм — только кино под ваш ритм»</p></div></section>
<section class="flex flex-col gap-2 mb-6"><div class="flex items-center justify-between px-1"><div class="flex items-center gap-1.5 text-on-surface"><span class="material-symbols-outlined text-secondary text-[20px]">filter_vintage</span><span class="font-headline-sm text-headline-sm tracking-wide">Палитра вайбов</span></div><span class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wider">5 настроений</span></div>
<div class="flex flex-col gap-3" id="mood-cards">${moods.map((m,i)=>`<article class="mood-card relative flex flex-col p-4 rounded-2xl ${i===0?"bg-surface-container-high shadow-lg shadow-black/40":"bg-surface-container shadow-md shadow-black/30"} transition-all duration-200 cursor-pointer" data-mood-card="${m.id}" role="button" tabindex="0">
<div data-mood-glow class="absolute inset-0 rounded-2xl bg-gradient-to-r from-cinema-amber-glow to-transparent ${i===0?"opacity-20":"opacity-0"} pointer-events-none"></div>
<div class="relative flex items-start justify-between gap-2 mb-2"><div class="flex items-start gap-2 min-w-0"><div class="w-10 h-10 shrink-0 rounded-xl bg-surface-container-lowest flex items-center justify-center text-xl shadow-inner">${m.emoji}</div><div class="min-w-0"><h2 class="mood-title font-headline-sm text-headline-sm ${i===0?"text-primary":"text-on-surface"} leading-snug">${m.title}</h2><div class="flex items-center gap-2 mt-0.5"><span class="mood-count font-micro-caption text-micro-caption px-2 py-0.5 rounded-full ${i===0?"bg-secondary-container/50 text-secondary":"bg-surface-container-high text-text-muted"}">Подборка TMDB</span><span class="font-micro-caption text-micro-caption text-text-muted">${m.tag}</span></div></div></div><div class="mood-radio w-6 h-6 shrink-0 rounded-full ${i===0?"bg-primary-container text-on-primary shadow-md":"bg-surface-container-highest text-transparent"} flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">check</span></div></div>
<p class="relative font-body-sm text-body-sm text-on-surface-variant mb-3 leading-snug">${m.description}</p>
<div class="relative flex flex-wrap items-center gap-1.5 pt-1">${m.labels.map(x=>`<span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-text-muted">${x}</span>`).join("")}<span class="font-micro-caption text-micro-caption px-2 py-1 rounded-full bg-surface-container-low text-on-surface-variant ml-auto">${m.genreLabel}</span></div></article>`).join("")}</div></section>
<aside class="sticky bottom-20 z-30 flex flex-col gap-2 p-3 rounded-2xl bg-surface-panel/95 backdrop-blur-md shadow-2xl shadow-black/80">
<div class="flex items-center justify-between px-1"><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-primary-container"></span><span class="font-micro-caption text-micro-caption text-primary" id="mood-pool-count">В пуле: загружаем…</span></div><button class="flex items-center gap-1 text-on-surface-variant hover:text-primary" id="mood-surprise" type="button"><span class="material-symbols-outlined text-[15px]">shuffle</span><span class="font-micro-caption text-micro-caption underline">Удиви меня</span></button></div>
<button class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,184,48,0.35)] active:scale-[0.98] transition-all" id="mood-launch" type="button"><span class="material-symbols-outlined text-[20px]">casino</span><span id="mood-launch-label">Запустить рулетку</span></button>
<p class="font-body-sm text-body-sm text-feedback-error" id="mood-error" role="status" hidden></p></aside><section class="flex flex-col gap-2 mt-4"><h2 class="font-headline-sm text-headline-sm text-on-surface">Фильмы по настроению</h2><div id="mood-films"><p class="font-body-sm text-body-sm text-text-muted p-3 rounded-xl bg-surface-panel">Загрузка из TMDB…</p></div></section><div id="mood-result" class="mt-4"></div></div>`;
    state.mood="wine";state.runtime="short";state.films=[];state.loadedKey="";
    updateCounts(root);
    if(boundRoot!==root){
      root.addEventListener("click",e=>handleClick(e,root,deps));
      root.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-mood-card]")){e.preventDefault();selectMood(e.target.dataset.moodCard,root,deps);}});
      boundRoot=root;
    }
    loadMood(root,deps);
    renderFilms(root);
  }
  function paintSelection(root){
    root.querySelectorAll(".mood-card").forEach(card=>{
      const active=card.dataset.moodCard===state.mood;
      card.className=`mood-card relative flex flex-col p-4 rounded-2xl ${active?"bg-surface-container-high shadow-lg shadow-black/40":"bg-surface-container shadow-md shadow-black/30"} transition-all duration-200 cursor-pointer`;
      const title=card.querySelector(".mood-title");title.className=`mood-title font-headline-sm text-headline-sm ${active?"text-primary":"text-on-surface"} leading-snug`;
      const radio=card.querySelector(".mood-radio");radio.className=`mood-radio w-6 h-6 shrink-0 rounded-full ${active?"bg-primary-container text-on-primary shadow-md":"bg-surface-container-highest text-transparent"} flex items-center justify-center`;
      const count=card.querySelector(".mood-count");count.className=`mood-count font-micro-caption text-micro-caption px-2 py-0.5 rounded-full ${active?"bg-secondary-container/50 text-secondary":"bg-surface-container-high text-text-muted"}`;
      card.querySelector("[data-mood-glow]").classList.toggle("opacity-20",active);
      card.querySelector("[data-mood-glow]").classList.toggle("opacity-0",!active);
    });
  }
  function selectMood(id,root,deps){if(!moods.some(m=>m.id===id))return;deps.closeFilm("mood");state.spinToken++;root.querySelector("#mood-result").replaceChildren();state.mood=id;state.films=[];state.loadedKey="";paintSelection(root);loadMood(root,deps);renderFilms(root);}
  async function loadMood(root,deps){
    const token=++state.token,key=state.mood;
    state.loading=true;updateCounts(root);renderFilms(root);
    const error=root.querySelector("#mood-error");if(error){error.hidden=true;error.textContent="";}
    if(!deps.hasKey()){state.loading=false;updateCounts(root);renderFilms(root);if(error){error.textContent="Добавьте ключ TMDB на экране «Глобус», чтобы загружать подборки.";error.hidden=false;}return;}
    try{
      const mood=currentMood();
      const result=await deps.api({with_origin_country:mood.countries.join("|"),with_genres:mood.genres.join("|"),"vote_count.gte":30,"vote_average.gte":5.5,sort_by:"popularity.desc",page:1,include_adult:"false"});
      const films=(result.results||[]).filter(f=>f.poster_path);
      const candidateFilms=films.slice(0,20),details=[];
      let detailFailures=0;
      await mapLimit(candidateFilms,4,async f=>{
        try{details.push([f.id,await deps.details(f.id)]);}catch(_){detailFailures++;details.push([f.id,null]);}
      });
      if(token!==state.token||key!==state.mood)return;
      const byId=new Map(details);
      state.films=candidateFilms.map(f=>({...f,runtime:(byId.get(f.id)||{}).runtime||0,detail:byId.get(f.id)})).filter(f=>f.runtime>0);
      state.loadedKey=key;
      if(candidateFilms.length&&!state.films.length&&detailFailures===candidateFilms.length){
        throw new Error("Не удалось получить хронометраж из TMDB. Проверьте API-ключ и подключение.");
      }
      renderFilms(root);
    }catch(e){
      if(token!==state.token)return;
      if(error){error.textContent=e.message||"Не удалось загрузить фильмы. Попробуйте ещё раз.";error.hidden=false;}
    }finally{
      if(token===state.token){state.loading=false;updateCounts(root);renderFilms(root);}
    }
  }
  async function mapLimit(items,limit,fn){
    let next=0;
    await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
      while(next<items.length){const index=next++;await fn(items[index],index);}
    }));
  }
  function handleClick(e,root,deps){
    if(e.target.closest("[data-mood-back]")){deps.back();return;}
    if(e.target.closest('[data-act="close-film"]')){deps.closeFilm("mood");return;}
    const card=e.target.closest("[data-mood-card]");
    if(card){selectMood(card.dataset.moodCard,root,deps);return;}
    const runtime=e.target.closest("[data-runtime]");
    if(runtime){
      deps.closeFilm("mood");
      state.spinToken++;root.querySelector("#mood-result").replaceChildren();
      state.runtime=runtime.dataset.runtime;
      root.querySelectorAll(".mood-runtime").forEach(b=>b.className=`mood-runtime shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-full ${b===runtime?"bg-primary-container text-on-primary shadow-[0_0_18px_rgba(255,184,48,0.28)]":"bg-surface-container text-text-muted"} font-label-sm text-label-sm transition-all active:scale-95`);
      updateCounts(root);return;
    }
    if(e.target.closest("#mood-surprise")){
      const m=moods[Math.floor(Math.random()*moods.length)];
      selectMood(m.id,root,deps);root.querySelector(`[data-mood-card="${m.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});return;
    }
    if(e.target.closest("#mood-launch")){launch(root,deps);return;}
    const film=e.target.closest("[data-mood-film]");
    if(film){
      const item=state.films.find(f=>String(f.id)===film.dataset.moodFilm);
      if(item)deps.openFilm(item,"mood",film.dataset.detailTarget||"mood-roulette-detail");
    }
  }
  function launch(root,deps){
    deps.closeFilm("mood");
    const error=root.querySelector("#mood-error"),pool=filtered();
    if(error){error.hidden=true;error.textContent="";}
    if(state.loading){if(error){error.textContent="Подборка ещё загружается.";error.hidden=false;}return;}
    if(!pool.length){if(error){error.textContent="В выбранном настроении и хронометраже фильмов не нашлось. Выберите другой хронометраж.";error.hidden=false;}return;}
    const film=pool[Math.floor(Math.random()*pool.length)];
    const token=++state.spinToken,trackLength=16,winnerIndex=12;
    const sequence=Array.from({length:trackLength},(_,i)=>i===winnerIndex?film:pool[Math.floor(Math.random()*pool.length)]);
    const panel=root.querySelector("#mood-result");
    panel.innerHTML=`<div class="relative overflow-hidden rounded-2xl bg-surface-panel p-4 shadow-xl"><div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><h2 class="relative font-headline-sm text-headline-sm text-primary mb-3">Кинорулетка настроения</h2><div class="relative h-28 overflow-hidden rounded-xl bg-canvas-obsidian border border-primary-container/30"><div class="absolute inset-y-0 left-1/2 z-10 w-20 -translate-x-1/2 border-x-2 border-primary-container/80 pointer-events-none"></div><div id="mood-reel-track" class="absolute inset-y-0 left-0 flex items-center gap-2 px-2">${sequence.map((item,i)=>`<div data-mood-reel-index="${i}" class="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">${item.poster_path?`<img class="h-full w-full object-cover" alt="" src="${poster(item.poster_path)}">`:'<div class="h-full w-full flex items-center justify-center"><span class="material-symbols-outlined text-primary-container">movie</span></div>'}</div>`).join("")}</div></div><div id="mood-roulette-result" class="mt-3 min-h-8 font-body-sm text-body-sm text-text-muted" aria-live="polite">Прокручиваем плёнку…</div><div id="mood-roulette-open" class="mt-2"></div><div id="mood-roulette-detail" class="mt-4"></div></div>`;
    const reel=panel.querySelector("#mood-reel-track"),viewport=reel.parentElement,winningCard=reel.querySelector(`[data-mood-reel-index="${winnerIndex}"]`);
    requestAnimationFrame(()=>{
      if(token!==state.spinToken||!reel.isConnected)return;
      const offset=winningCard.offsetLeft+winningCard.offsetWidth/2-viewport.clientWidth/2;
      reel.style.transform="translateX(0)";
      requestAnimationFrame(()=>{
        if(token!==state.spinToken||!reel.isConnected)return;
        reel.style.transition="transform 2.4s cubic-bezier(.12,.72,.12,1)";
        reel.style.transform=`translateX(${-Math.max(0,offset)}px)`;
      });
    });
    setTimeout(()=>{
      if(token!==state.spinToken||!panel.isConnected)return;
      panel.querySelector("#mood-roulette-result").innerHTML=`<span class="text-primary-fixed font-semibold">Ваша находка:</span> ${esc(film.title||film.original_title)} · ${film.runtime} мин · ★ ${Number(film.vote_average||0).toFixed(1)}`;
      panel.querySelector("#mood-roulette-open").innerHTML=`<button class="px-3 py-2 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-bold" data-mood-film="${film.id}" data-detail-target="mood-roulette-detail" type="button">Трейлер и подробности</button>`;
    },2450);
    panel.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  window.KGMoodPage={render};
})();
