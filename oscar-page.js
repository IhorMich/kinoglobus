(function(){
  if(!document.getElementById("kgo-style")){
    const st=document.createElement("style");st.id="kgo-style";
    st.textContent='.kgo-reel .kgr-cell{pointer-events:auto}.kgo-reel .kgr-frame::before,.kgo-reel .kgr-frame::after{content:"";position:absolute;left:50%;transform:translateX(-50%);border:6px solid transparent}.kgo-reel .kgr-frame::before{top:-9px;border-top:7px solid #ffb830;border-bottom:0}.kgo-reel .kgr-frame::after{bottom:-9px;border-bottom:7px solid #ffb830;border-top:0}';
    document.head.appendChild(st);
  }
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const image=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const state={films:[],decade:"all",shown:6,sort:"new",onlyBest:false,onlyUnseen:false,group:true,view:"list",feature:null,featureDetails:null,selected:null,loading:false,loaded:false,request:0,spinToken:0,spinFrame:0,spinning:false,skipSpin:false,spun:false};
  let boundRoot=null;
  const yearOf=f=>Number((f.release_date||"").slice(0,4))||0;
  const decadeOf=y=>y<1960?"gold":`${Math.floor(y/10)*10}`;
  // «Лучший фильм» по порядку церемоний (номер церемонии = индекс + 1): [год выхода, оригинальное название]
  const BEST_PICTURE=`1927 Wings|1929 The Broadway Melody|1930 All Quiet on the Western Front|1931 Cimarron|1932 Grand Hotel|1933 Cavalcade|1934 It Happened One Night|1935 Mutiny on the Bounty|1936 The Great Ziegfeld|1937 The Life of Emile Zola|1938 You Can't Take It with You|1939 Gone with the Wind|1940 Rebecca|1941 How Green Was My Valley|1942 Mrs. Miniver|1943 Casablanca|1944 Going My Way|1945 The Lost Weekend|1946 The Best Years of Our Lives|1947 Gentleman's Agreement|1948 Hamlet|1949 All the King's Men|1950 All About Eve|1951 An American in Paris|1952 The Greatest Show on Earth|1953 From Here to Eternity|1954 On the Waterfront|1955 Marty|1956 Around the World in 80 Days|1957 The Bridge on the River Kwai|1958 Gigi|1959 Ben-Hur|1960 The Apartment|1961 West Side Story|1962 Lawrence of Arabia|1963 Tom Jones|1964 My Fair Lady|1965 The Sound of Music|1966 A Man for All Seasons|1967 In the Heat of the Night|1968 Oliver!|1969 Midnight Cowboy|1970 Patton|1971 The French Connection|1972 The Godfather|1973 The Sting|1974 The Godfather Part II|1975 One Flew Over the Cuckoo's Nest|1976 Rocky|1977 Annie Hall|1978 The Deer Hunter|1979 Kramer vs. Kramer|1980 Ordinary People|1981 Chariots of Fire|1982 Gandhi|1983 Terms of Endearment|1984 Amadeus|1985 Out of Africa|1986 Platoon|1987 The Last Emperor|1988 Rain Man|1989 Driving Miss Daisy|1990 Dances with Wolves|1991 The Silence of the Lambs|1992 Unforgiven|1993 Schindler's List|1994 Forrest Gump|1995 Braveheart|1996 The English Patient|1997 Titanic|1998 Shakespeare in Love|1999 American Beauty|2000 Gladiator|2001 A Beautiful Mind|2002 Chicago|2003 The Lord of the Rings: The Return of the King|2004 Million Dollar Baby|2005 Crash|2006 The Departed|2007 No Country for Old Men|2008 Slumdog Millionaire|2009 The Hurt Locker|2010 The King's Speech|2011 The Artist|2012 Argo|2013 12 Years a Slave|2014 Birdman or (The Unexpected Virtue of Ignorance)|2015 Spotlight|2016 Moonlight|2017 The Shape of Water|2018 Green Book|2019 Parasite|2020 Nomadland|2021 CODA|2022 Everything Everywhere All at Once|2023 Oppenheimer|2024 Anora`.split("|").map(x=>[Number(x.slice(0,4)),x.slice(5)]);
  const normTitle=t=>String(t||"").toLowerCase().replace(/[^a-z0-9а-яё]+/g,"");
  const ceremonyYear=n=>n===1?1929:n===2||n===3?1930:n===4?1931:n===5?1932:n===6?1934:1928+n;
  // Сопоставление по названию и году (±1): если не нашли, награду не выдумываем и показываем общий статус лауреата
  function oscarInfo(f){
    const y=yearOf(f),names=[normTitle(f.original_title),normTitle(f.title)].filter(Boolean);
    for(let i=0;i<BEST_PICTURE.length;i++){
      const [by,title]=BEST_PICTURE[i];
      if(Math.abs(by-y)>1)continue;
      if(names.includes(normTitle(title)))return {best:true,n:i+1,year:ceremonyYear(i+1),film:y};
    }
    return {best:false,film:y};
  }
  // ---------- награды и номинации из Wikidata (по TMDB-ID, свойство P4947) ----------
  const awardCache=new Map();
  async function wikidata(params){
    const url=new URL("https://www.wikidata.org/w/api.php");
    Object.entries({format:"json",origin:"*",...params}).forEach(([k,v])=>url.searchParams.set(k,v));
    const r=await fetch(url);
    if(!r.ok)throw new Error("wikidata "+r.status);
    return r.json();
  }
  async function fetchAwards(film){
    const found=await wikidata({action:"query",list:"search",srsearch:`haswbstatement:P4947=${film.id}`,srlimit:1});
    const hit=found.query&&found.query.search&&found.query.search[0];
    if(!hit)return [];
    const entity=(await wikidata({action:"wbgetentities",ids:hit.title,props:"claims"})).entities[hit.title];
    const claims=(entity&&entity.claims)||{},rows=[];
    [["P166",true],["P1411",false]].forEach(([prop,won])=>(claims[prop]||[]).forEach(st=>{
      const id=st.mainsnak&&st.mainsnak.datavalue&&st.mainsnak.datavalue.value&&st.mainsnak.datavalue.value.id;
      if(!id)return;
      const t=st.qualifiers&&st.qualifiers.P585&&st.qualifiers.P585[0]&&st.qualifiers.P585[0].datavalue&&st.qualifiers.P585[0].datavalue.value.time;
      const year=t&&(String(t).match(/(\d{4})/)||[])[1];
      rows.push({id,won,year:year?Number(year):0});
    }));
    if(!rows.length)return [];
    const ids=[...new Set(rows.map(r=>r.id))].slice(0,50);
    const labels=(await wikidata({action:"wbgetentities",ids:ids.join("|"),props:"labels",languages:"ru|en"})).entities||{};
    const seen=new Set(),list=[];
    rows.forEach(r=>{
      const l=labels[r.id]&&labels[r.id].labels,label=(l&&((l.ru&&l.ru.value)||(l.en&&l.en.value)))||"";
      if(!/academy award|оскар|киноакадеми/i.test(label))return;   // только «Оскар», без BAFTA и прочих
      const key=r.won+"|"+label;if(seen.has(key))return;seen.add(key);
      list.push({won:r.won,label,year:r.year});
    });
    return list.sort((a,b)=>(b.won-a.won)||a.label.localeCompare(b.label,"ru")).slice(0,14);
  }
  function awardsFor(film){
    if(!awardCache.has(film.id)){
      const p=fetchAwards(film).catch(e=>{awardCache.delete(film.id);throw e;});
      awardCache.set(film.id,p);
    }
    return awardCache.get(film.id);
  }
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
  function eraName(){return state.decade==="all"?"Все эпохи":state.decade==="gold"?"Золотой Голливуд":`${state.decade.slice(0,3)}0-е`;}
  const filmsWord=n=>{const a=n%100,b=n%10;return a>10&&a<15?"фильмов":b===1?"фильм":b>1&&b<5?"фильма":"фильмов";};
  function poolFilms(){return state.decade==="all"?state.films:state.films.filter(f=>decadeOf(yearOf(f))===state.decade);}
  function updateEra(root){
    const n=poolFilms().length,total=root.querySelector("#oscar-total"),era=root.querySelector("#oscar-list-era");
    if(total)total.textContent=`${n} ${filmsWord(n)}`;
    if(era)era.textContent=eraName();
  }
  function render(root,deps){
    stopSpin(root);
    state.sort="new";state.onlyBest=false;state.onlyUnseen=false;state.group=true;state.view="list";
    state.films=[];state.decade="all";state.shown=6;state.feature=null;state.featureDetails=null;state.selected=null;state.loaded=false;
    root.innerHTML=`<div class="flex flex-col w-full pb-safe max-w-[520px] mx-auto overflow-hidden">
    <div class="flex items-center justify-between px-gutter-mobile pt-2"><button type="button" data-oscar-back class="w-11 h-11 -ml-1.5 flex items-center gap-1.5 text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[22px]">arrow_back</span><span class="font-label-sm text-label-sm">Подборки</span></button><span class="font-micro-caption text-micro-caption text-text-muted">КИНОГЛОБУС · OSCAR WINNERS</span></div>
<div class="relative w-full px-gutter-mobile pt-space-md"><div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-panel to-surface-container-lowest p-space-lg shadow-xl shadow-canvas-obsidian/80">
<div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div><div class="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-cinema-velvet-glow blur-3xl pointer-events-none"></div>
<div class="relative flex flex-col items-center text-center"><div class="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container shadow-inner mb-space-sm"><div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-container/20 to-transparent"></div><span class="material-symbols-outlined text-[34px] text-primary-container" style="font-variation-settings:'FILL' 1;">workspace_premium</span><div class="absolute -bottom-1 px-2 py-0.5 rounded-full bg-surface-panel shadow-sm"><span class="font-micro-caption text-micro-caption text-primary font-semibold tracking-wider" id="oscar-age">ОСКАР</span></div></div>
<h1 class="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 mb-1.5">Зал славы Оскара</h1><p class="font-body-sm text-body-sm text-text-muted max-w-xs mb-space-md">Случайный выбор лучшего фильма или персональная хроника картин, отмеченных Академией</p>
<div class="w-full mb-space-sm text-left"><div class="flex items-center justify-between mb-1.5"><span class="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Эпоха для рулетки</span><span class="font-micro-caption text-micro-caption text-primary" id="oscar-range">История премии</span></div><div class="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth" id="oscar-decades"></div><p class="font-micro-caption text-micro-caption text-text-muted mt-1">Выбранная эпоха работает для рулетки и для списка ниже</p></div>
<button class="w-full flex items-center justify-between gap-space-sm bg-gradient-to-r from-primary-container via-primary-fixed-dim to-primary px-space-md py-3.5 rounded-xl text-on-primary-fixed shadow-lg shadow-cinema-amber-glow active:scale-[0.98] transition-all duration-200" id="oscar-roulette">
<span class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined text-[22px]" id="oscar-roulette-icon">casino</span><span class="font-label-lg text-label-lg tracking-tight truncate" id="oscar-roulette-label">Случайный лауреат</span></span><span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas-obsidian/20 shrink-0"><span class="font-micro-caption text-micro-caption font-bold" id="oscar-total">Загружаем…</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></span></button>
</div></div></div>
<div id="oscar-reel" class="px-gutter-mobile mt-space-md" hidden></div>
<section class="px-gutter-mobile mt-space-lg"><div class="flex items-center justify-between mb-space-xs"><div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[18px]">auto_awesome</span><span class="font-headline-sm text-headline-sm text-on-surface">Лауреат дня</span></div><span class="font-micro-caption text-micro-caption px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-semibold" id="oscar-feature-label">Сегодня</span></div><div id="oscar-feature"></div></section>
<div id="oscar-film-detail" class="px-gutter-mobile mt-3"></div>
<section class="px-gutter-mobile mt-space-lg"><div class="p-space-md rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-panel to-surface-container-lowest shadow-md">
<div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[18px]">public</span></div><span class="font-headline-sm text-headline-sm text-on-surface">География триумфов</span></div><span class="font-micro-caption text-micro-caption text-primary" id="oscar-country-total">Считаем страны…</span></div>
<p class="font-body-sm text-body-sm text-text-muted mb-space-sm">Страны производства в первых 24 фильмах списка лауреатов.</p><div class="flex flex-wrap gap-1.5 mb-3" id="oscar-countries"><span class="font-micro-caption text-micro-caption text-text-muted">Загружаем данные о странах…</span></div>
<div class="flex flex-col gap-1"><div class="flex items-center justify-between text-micro-caption font-micro-caption"><span class="text-text-muted">Прогресс просмотра лауреатов</span><span class="text-primary font-semibold" id="oscar-progress">0 из 0 (0%)</span></div><div class="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden"><div class="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full transition-all" id="oscar-progress-bar" style="width:0%"></div></div></div></div></section>
<section class="px-gutter-mobile mt-space-lg mb-space-lg"><div class="flex items-center justify-between mb-space-sm"><div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[20px]">movie_filter</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Легендарные триумфаторы</h2></div><span class="font-label-sm text-label-sm text-primary flex items-center gap-0.5"><span id="oscar-list-era">Все эпохи</span> <span class="material-symbols-outlined text-[16px]">swap_vert</span></span></div><div class="flex flex-col gap-2 mb-space-sm" id="oscar-toolbar"></div>
<div class="flex flex-col gap-space-sm" id="oscar-list"></div><button type="button" class="w-full mt-2 py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md" id="oscar-more" hidden>Показать ещё</button><p class="font-body-sm text-body-sm text-feedback-error mt-2" id="oscar-error" role="status" hidden></p><button type="button" class="mt-2 px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm" id="oscar-retry" hidden>Повторить загрузку</button></section>
</div>`;
    if(boundRoot!==root){
      root.addEventListener("click",e=>handleClick(e,root,deps));
      root.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("[role=button][data-oscar-open]")){e.preventDefault();e.target.click();}});
      boundRoot=root;
    }
    load(root,deps);
  }
  async function load(root,deps){
    const token=++state.request,error=root.querySelector("#oscar-error"),retry=root.querySelector("#oscar-retry");
    if(retry)retry.hidden=true;
    if(!deps.hasKey()){error.textContent="Добавьте ключ TMDB на экране «Глобус», чтобы загрузить лауреатов.";error.hidden=false;return;}
    try{
      state.loading=true;error.hidden=true;
      const films=await deps.getFilms();
      if(token!==state.request)return;
      error.hidden=true;
      state.films=films.filter(f=>f&&f.id&&yearOf(f)).sort((a,b)=>yearOf(b)-yearOf(a));
      state.loaded=true;
      if(!state.films.length)throw new Error("Список лауреатов не содержит фильмов с датой выхода.");
      const years=state.films.map(yearOf);
      updateEra(root);
      root.querySelector("#oscar-age").textContent=`${Math.max(...years)-Math.min(...years)} ЛЕТ`;
      root.querySelector("#oscar-range").textContent=`${Math.min(...years)} — ${Math.max(...years)}`;
      const day=Math.floor((Date.now()-Date.UTC(new Date().getUTCFullYear(),0,0))/86400000);
      state.feature=state.films[(day-1+state.films.length)%state.films.length];
      renderDecades(root);renderFeature(root,deps);renderToolbar(root);renderList(root,deps);renderProgress(root,deps);
      loadFeatureDetails(root,deps);
      loadCountries(root,deps).catch(error=>console.warn("[Kinoglobus] Не удалось загрузить географию лауреатов:",error));
    }catch(e){
      if(token!==state.request)return;
      error.textContent=e.message||"Не удалось загрузить список лауреатов.";
      error.hidden=false;if(retry)retry.hidden=false;
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
    const title=esc(f.title||f.original_title||"Фильм"),year=yearOf(f),rating=Number(f.vote_average)||0,info=oscarInfo(f);
    const backdrop=f.backdrop_path||f.poster_path;
    const countries=(d.countries||f.origin_country||[]).slice(0,2).map(c=>deps.countryName(c)).filter(Boolean);
    const director=(d.dirs||[])[0]||"";
    const runtime=d.runtime?`${d.runtime} мин`:"";
    const bg=backdrop?`<img class="w-full h-full object-cover" alt="Кадр из фильма «${title}»" src="${image(backdrop,"w780")}">`:'<div class="w-full h-full bg-surface-container-high"></div>';
    root.querySelector("#oscar-feature").innerHTML=`<article class="relative overflow-hidden rounded-2xl bg-surface-panel shadow-2xl p-3.5">
<div class="relative w-full h-56 rounded-xl overflow-hidden bg-surface-container-high cursor-pointer" data-oscar-open="${f.id}" role="button" tabindex="0" aria-label="Трейлер и подробности: ${title}">${bg}<div class="absolute inset-0 bg-gradient-to-t from-surface-panel via-surface-panel/40 to-transparent"></div>
<div class="absolute top-2.5 left-2.5 flex items-center gap-1.5"><span class="px-2 py-1 rounded-md bg-canvas-obsidian/85 text-primary font-label-sm text-label-sm font-bold shadow-sm">★ ${rating?rating.toFixed(1):"—"}</span>${runtime?`<span class="px-2 py-1 rounded-md bg-canvas-obsidian/85 text-on-surface font-micro-caption text-micro-caption">${runtime}</span>`:""}</div>
<div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-cinema-velvet-deep/90 text-secondary font-label-sm text-label-sm font-semibold shadow-md"><span class="material-symbols-outlined text-[15px] align-middle mr-1">military_tech</span>Лауреат</div>
<div class="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2"><div class="min-w-0"><div class="font-label-sm text-label-sm text-on-surface-variant mb-0.5">${countries.join(" / ")||"Кинематограф мира"} · ${year}</div><h2 class="font-headline-md text-headline-md text-on-surface font-bold drop-shadow truncate">${title}</h2></div><span class="text-text-muted font-body-sm text-body-sm shrink-0">${esc(director)}</span></div></div>
<div class="flex flex-wrap gap-1.5 mt-3"><span class="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-micro-caption text-micro-caption font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[13px] text-primary-container">trophy</span>${info.best?`Оскар · Лучший фильм · ${info.n}-я церемония, ${info.year}`:"Фильм — лауреат «Оскара»"}</span><span class="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-micro-caption text-micro-caption">${year}</span></div>
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
  const PAGE_LIST=6,PAGE_GRID=9;
  const pageSize=()=>state.view==="grid"?PAGE_GRID:PAGE_LIST;
  const SORTS=[["new","Новые"],["old","Старые"],["rating","Рейтинг"],["pop","Популярные"]];
  const canGroup=()=>state.decade==="all"&&(state.sort==="new"||state.sort==="old");
  function filteredFilms(deps){
    const rate=f=>Number(f.vote_average||0);
    const cmp={
      new:(a,b)=>yearOf(b)-yearOf(a)||rate(b)-rate(a),
      old:(a,b)=>yearOf(a)-yearOf(b)||rate(b)-rate(a),
      rating:(a,b)=>rate(b)-rate(a)||yearOf(b)-yearOf(a),
      pop:(a,b)=>Number(b.popularity||0)-Number(a.popularity||0)||rate(b)-rate(a)
    }[state.sort];
    return poolFilms().filter(f=>(!state.onlyBest||oscarInfo(f).best)&&(!state.onlyUnseen||!deps.isWatched(f.id))).sort(cmp);
  }
  const chipOn="bg-primary-container text-on-primary-container shadow-md font-semibold",chipOff="bg-surface-container text-text-muted font-medium hover:text-on-surface";
  function renderToolbar(root){
    const box=root.querySelector("#oscar-toolbar");if(!box)return;
    const icon=n=>`<span class="material-symbols-outlined text-[15px]">${n}</span>`;
    const chip=(attrs,on,inner)=>`<button type="button" ${attrs} aria-pressed="${on}" class="shrink-0 px-3 py-1.5 rounded-full ${on?chipOn:chipOff} font-label-sm text-label-sm transition-all flex items-center gap-1">${inner}</button>`;
    const views=[["list","view_list","Списком"],["grid","grid_view","Сеткой"]].map(([id,ic,label])=>`<button type="button" data-oscar-view="${id}" aria-label="${label}" aria-pressed="${state.view===id}" class="w-8 h-8 rounded-full flex items-center justify-center ${state.view===id?"bg-primary-container text-on-primary-container":"text-text-muted"}"><span class="material-symbols-outlined text-[18px]">${ic}</span></button>`).join("");
    box.innerHTML=`<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">${SORTS.map(([id,label])=>chip(`data-oscar-sort="${id}"`,state.sort===id,label)).join("")}</div>
<div class="flex items-center gap-2 flex-wrap">${chip('data-oscar-filter="best"',state.onlyBest,icon("workspace_premium")+"Лучший фильм")}${chip('data-oscar-filter="unseen"',state.onlyUnseen,icon("visibility_off")+"Непросмотренные")}${canGroup()?chip('data-oscar-filter="group"',state.group,icon("view_timeline")+"По десятилетиям"):""}<div class="ml-auto flex items-center gap-1 rounded-full bg-surface-container p-0.5">${views}</div></div>
<p class="font-micro-caption text-micro-caption text-text-muted" id="oscar-list-count"></p>`;
  }
  // любое изменение сортировки/фильтров/вида: закрыть раскрытую карточку списка и перерисовать с первой страницы
  function relist(root,deps){
    if(root.querySelector("#oscar-list [data-oscar-detail-host]:not(:empty)"))deps.closeFilm("oscar");
    state.shown=pageSize();
    renderToolbar(root);renderList(root,deps);
  }
  function listItemHtml(f,deps){
      const d=f._details||{},title=esc(f.title||f.original_title||"Фильм"),y=yearOf(f);
      const countries=(f.origin_country||d.countries||[]).slice(0,2).map(cc=>deps.countryName(cc)).filter(Boolean).join(" / ");
      const directors=(d.dirs||[]).slice(0,1).join(", ");
      const info=oscarInfo(f);
      return `<article class="flex flex-col gap-2 p-3 rounded-xl bg-surface-panel shadow-md hover:bg-surface-container-low transition-colors">
<button type="button" class="flex gap-3 text-left w-full" data-oscar-open="${f.id}" aria-label="Трейлер и подробности: ${title}">
<span class="relative block w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container-high shadow-md">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер «${title}»" src="${image(f.poster_path,"w185")}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-text-muted">movie</span>'}<span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-canvas-obsidian/85 text-primary font-micro-caption text-micro-caption font-bold">★ ${Number(f.vote_average||0).toFixed(1)}</span></span>
<span class="flex flex-col justify-between min-w-0 flex-1 py-0.5"><span class="block"><span class="flex items-center justify-between gap-1"><span class="font-micro-caption text-micro-caption text-primary flex items-center gap-1 truncate"><span data-oscar-country="${f.id}">${esc(countries||"Кинематограф мира")}</span><span>• ${y}</span></span><span class="font-micro-caption text-micro-caption px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary font-semibold shrink-0">${info.best?"Лучший фильм":"Лауреат"}</span></span>
<span class="block font-headline-sm text-headline-sm text-on-surface font-semibold truncate mt-0.5">${title}</span>
${info.best?`<span class="block font-micro-caption text-micro-caption text-primary-container mt-0.5">Оскар ${info.year} · ${info.n}-я церемония</span>`:""}
<span class="block font-body-sm text-body-sm text-text-muted line-clamp-1 mt-0.5">${esc(f.overview||"Фильм из коллекции лауреатов премии Американской киноакадемии.")}</span></span>
<span class="block font-micro-caption text-micro-caption text-primary-container mt-1">Трейлер и подробности</span></span></button>
<div class="flex items-center justify-between"><span class="font-micro-caption text-micro-caption text-on-surface-variant font-medium truncate" data-oscar-director="${f.id}">${directors?`Реж. ${esc(directors)}`:"Лауреат «Оскара»"}</span><button type="button" data-oscar-watched="${f.id}" aria-label="${deps.isWatched(f.id)?"Уже просмотрено":"Отметить просмотренным"}" class="w-8 h-8 rounded-full ${deps.isWatched(f.id)?"bg-primary text-on-primary":"bg-surface-container-highest text-primary"} flex items-center justify-center transition-colors"><span class="material-symbols-outlined text-[18px]">${deps.isWatched(f.id)?"task_alt":"bookmark_add"}</span></button></div>
<div id="oscar-list-detail-${f.id}" data-oscar-detail-host></div></article>`;
  }
  function gridCellHtml(f,deps,hostId){
    const title=esc(f.title||f.original_title||"Фильм"),y=yearOf(f),info=oscarInfo(f),seen=deps.isWatched(f.id);
    return `<div class="relative flex flex-col"><button type="button" class="flex flex-col gap-1 text-left" data-oscar-open="${f.id}" data-oscar-host="${hostId}" aria-label="Трейлер и подробности: ${title}"><span class="relative block w-full aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high shadow-md">${f.poster_path?`<img class="w-full h-full object-cover" loading="lazy" alt="Постер «${title}»" src="${image(f.poster_path,"w342")}">`:'<span class="material-symbols-outlined w-full h-full flex items-center justify-center text-text-muted">movie</span>'}<span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-canvas-obsidian/85 text-primary font-micro-caption text-micro-caption font-bold">★ ${Number(f.vote_average||0).toFixed(1)}</span>${info.best?'<span class="absolute top-1 left-1 w-6 h-6 rounded-full bg-cinema-velvet-deep/90 text-secondary flex items-center justify-center" title="Лучший фильм"><span class="material-symbols-outlined text-[14px]" style="font-variation-settings:\'FILL\' 1;">workspace_premium</span></span>':""}</span><span class="block font-label-sm text-label-sm text-on-surface font-semibold leading-tight kg-clip2">${title}</span><span class="block font-micro-caption text-micro-caption text-text-muted">${y||""}</span></button><button type="button" data-oscar-watched="${f.id}" aria-label="${seen?"Уже просмотрено":"Отметить просмотренным"}" class="absolute top-1 right-1 w-7 h-7 rounded-full ${seen?"bg-primary text-on-primary":"bg-canvas-obsidian/80 text-primary"} flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">${seen?"task_alt":"bookmark_add"}</span></button></div>`;
  }
  function renderList(root,deps){
    const box=root.querySelector("#oscar-list");
    const all=filteredFilms(deps),shownList=all.slice(0,state.shown);
    const groups=[];
    if(state.group&&canGroup()){
      shownList.forEach(f=>{const k=decadeOf(yearOf(f)),g=groups[groups.length-1];if(g&&g.key===k)g.films.push(f);else groups.push({key:k,films:[f]});});
    }else groups.push({key:null,films:shownList});
    const stat=k=>{const items=all.filter(f=>decadeOf(yearOf(f))===k);return {n:items.length,seen:items.filter(f=>deps.isWatched(f.id)).length};};
    const body=groups.map(g=>{
      let head="";
      if(g.key){const st=stat(g.key);head=`<div class="flex items-center justify-between px-1 pt-3 pb-1"><span class="font-label-md text-label-md text-primary font-semibold">${g.key==="gold"?"Золотой Голливуд · до 1960":g.key.slice(0,3)+"0-е"}</span><span class="font-micro-caption text-micro-caption text-text-muted">${st.n} ${filmsWord(st.n)} · просмотрено ${st.seen}</span></div>`;}
      if(state.view==="grid"){
        const rows=[];for(let i=0;i<g.films.length;i+=3)rows.push(g.films.slice(i,i+3));
        return head+rows.map(row=>{const host=`oscar-grid-detail-${row[0].id}`;return `<div class="grid grid-cols-3 gap-2 mb-2">${row.map(f=>gridCellHtml(f,deps,host)).join("")}</div><div id="${host}" data-oscar-detail-host></div>`;}).join("");
      }
      return head+`<div class="flex flex-col gap-space-sm">${g.films.map(f=>listItemHtml(f,deps)).join("")}</div>`;
    }).join("");
    box.innerHTML=all.length?body:`<div class="p-3 rounded-xl bg-surface-panel text-center"><p class="font-body-sm text-body-sm text-text-muted">Нет фильмов по выбранным фильтрам.</p><button type="button" data-oscar-reset class="mt-2 px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm">Сбросить фильтры</button></div>`;
    const count=root.querySelector("#oscar-list-count");
    if(count)count.textContent=all.length?`Показано ${shownList.length} из ${all.length}`:"";
    const more=root.querySelector("#oscar-more");
    more.hidden=state.shown>=all.length;
    if(deps.refreshFilm)deps.refreshFilm();
    if(state.view==="list"){
    const detailsQueue=shownList.filter(f=>!f._details&&!f._detailsLoading);
    if(detailsQueue.length){
      const request=state.request;
      detailsQueue.forEach(f=>{f._detailsLoading=true;});
      mapLimit(detailsQueue,4,async f=>{
        try{f._details=await detailFor(deps,f.id);}catch(_){f._details={};}
        f._detailsLoading=false;
        if(request!==state.request||!root.isConnected)return;
        const countries=(f.origin_country||f._details.countries||[]).slice(0,2).map(cc=>deps.countryName(cc)).filter(Boolean).join(" / ");
        const directors=(f._details.dirs||[]).slice(0,1).join(", ");
        root.querySelectorAll(`[data-oscar-country="${f.id}"]`).forEach(el=>{el.textContent=countries||"Кинематограф мира";});
        root.querySelectorAll(`[data-oscar-director="${f.id}"]`).forEach(el=>{el.textContent=directors?`Реж. ${directors}`:"Лауреат «Оскара»";});
      });
    }
    }
  }
  function handleClick(e,root,deps){
    if(e.target.closest("[data-oscar-back]")){deps.back();return;}
    if(e.target.closest('[data-act="close-film"]')){deps.closeFilm("oscar");return;}
    const decade=e.target.closest("[data-decade]");
    if(decade){state.decade=decade.dataset.decade;renderDecades(root);relist(root,deps);updateEra(root);return;}
    if(e.target.closest("#oscar-more")){state.shown+=pageSize();renderList(root,deps);return;}
    if(e.target.closest("#oscar-retry")){load(root,deps);return;}
    if(e.target.closest("[data-oscar-skip]")){state.skipSpin=true;return;}
    const sortBtn=e.target.closest("[data-oscar-sort]");
    if(sortBtn){state.sort=sortBtn.dataset.oscarSort;relist(root,deps);return;}
    const filterBtn=e.target.closest("[data-oscar-filter]");
    if(filterBtn){const k=filterBtn.dataset.oscarFilter;if(k==="best")state.onlyBest=!state.onlyBest;else if(k==="unseen")state.onlyUnseen=!state.onlyUnseen;else state.group=!state.group;relist(root,deps);return;}
    const viewBtn=e.target.closest("[data-oscar-view]");
    if(viewBtn){if(state.view!==viewBtn.dataset.oscarView){state.view=viewBtn.dataset.oscarView;relist(root,deps);}return;}
    if(e.target.closest("[data-oscar-reset]")){state.onlyBest=false;state.onlyUnseen=false;relist(root,deps);return;}
    if(e.target.closest("[data-oscar-reel-close]")){closeReel(root,deps);return;}
    if(e.target.closest("#oscar-roulette")){spinReel(root,deps);return;}
    const open=e.target.closest("[data-oscar-open]");
    if(open){
      if(state.spinning)return;   // пока плёнка крутится, постеры не открываем
      const f=state.films.find(item=>String(item.id)===open.dataset.oscarOpen);
      if(f){
        const host=open.closest("article")?.querySelector("[data-oscar-detail-host]");
        const target=open.dataset.oscarHost||host?.id||(open.closest("#oscar-reel")?"oscar-reel-detail":"oscar-film-detail");
        deps.openFilm(f,"oscar",target);
      }
      return;
    }
    const watched=e.target.closest("[data-oscar-watched]");
    if(watched){
      const f=state.films.find(item=>String(item.id)===watched.dataset.oscarWatched);
      if(f)deps.markWatched(f).then(()=>{renderFeature(root,deps);renderList(root,deps);renderProgress(root,deps);});
    }
  }
  const reelStep=90,reelPadding=8,reelCellWidth=80;
  const reducedMotion=()=>!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const sound=(name,arg)=>{try{if(typeof window[name]==="function")window[name](arg);}catch(_){}};
  function shuffled(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function setLaunch(root,spinning){
    const button=root.querySelector("#oscar-roulette"),label=root.querySelector("#oscar-roulette-label"),icon=root.querySelector("#oscar-roulette-icon");
    if(button){button.disabled=spinning;button.style.opacity=spinning?".75":"";}
    if(label)label.textContent=spinning?"Плёнка крутится…":(state.spun?"Крутить ещё раз":"Случайный лауреат");
    if(icon)icon.classList.toggle("animate-spin",spinning);
  }
  function stopSpin(root){
    state.spinToken++;cancelAnimationFrame(state.spinFrame);
    if(state.spinning){sound("stopFilmReelSound");state.spinning=false;}
    if(root&&root.isConnected)setLaunch(root,false);
  }
  function closeReel(root,deps){
    const panel=root.querySelector("#oscar-reel");if(!panel)return;
    stopSpin(root);
    const detail=panel.querySelector("#oscar-reel-detail");
    if(detail&&detail.children.length)deps.closeFilm("oscar");
    panel.innerHTML="";panel.hidden=true;
  }
  function cellHtml(f){
    const title=esc(f.title||f.original_title||"Фильм"),y=yearOf(f);
    return `<div class="kgr-cell" data-oscar-open="${f.id}" role="button" tabindex="0" aria-label="Подробности: ${title}" style="cursor:pointer">${f.poster_path?`<img alt="${title}" draggable="false" src="${image(f.poster_path,"w185")}">`:`<div class="nop">${title}</div>`}${y?`<span class="yr">${y}</span>`:""}</div>`;
  }
  async function spinReel(root,deps){
    if(state.spinning)return;
    const pool=poolFilms();
    const panel=root.querySelector("#oscar-reel");
    if(!panel||!pool.length)return;
    const fresh=pool.filter(f=>!deps.isWatched(f.id)),source=fresh.length?fresh:pool;
    const film=source[Math.floor(Math.random()*source.length)];
    const others=shuffled(pool.filter(f=>f.id!==film.id&&f.poster_path));
    const animate=others.length>0&&!reducedMotion();
    const NEED=26,TAIL=6,sequence=[];
    if(animate){
      for(let i=0;i<NEED;i++)sequence.push(others[i%others.length]);
      sequence.push(film);
      for(let i=0;i<TAIL;i++)sequence.push(others[(i+2)%others.length]);
    }else sequence.push(film);
    const winnerIndex=animate?NEED:0;
    const token=++state.spinToken;
    deps.closeFilm("oscar");
    state.spinning=true;state.skipSpin=false;state.spun=true;
    setLaunch(root,true);
    // ждём постеры (не дольше 2,5 с), чтобы лента не «моргала» при прокрутке
    await Promise.race([
      Promise.all(sequence.filter(f=>f.poster_path).map(f=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=image(f.poster_path,"w185");}))),
      new Promise(r=>setTimeout(r,2500))
    ]);
    if(token!==state.spinToken||!panel.isConnected)return;
    panel.hidden=false;
    panel.innerHTML=`<section class="w-full rounded-2xl bg-surface-panel/95 p-3.5 shadow-2xl relative overflow-hidden border border-primary-container/25 backdrop-blur-xl">
<div class="flex items-center justify-between gap-2 mb-2.5 px-0.5"><div class="flex items-center gap-2 min-w-0"><div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center border border-primary-container/30 text-primary shadow-[0_0_8px_rgba(255,184,48,0.25)] flex-shrink-0"><span class="material-symbols-outlined text-[17px]">movie</span></div><div class="flex flex-col min-w-0"><div class="flex items-center gap-1.5"><span class="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">Кинолента 35-мм</span><span class="px-1.5 rounded-full bg-cinema-velvet-deep/70 text-secondary font-mono text-[10px] tracking-widest border border-secondary/25">24FPS</span></div><span class="font-micro-caption text-[11px] text-text-muted truncate" data-oscar-reel-sub>Оскар · ${esc(eraName())}</span></div></div>
<div class="flex items-center gap-1.5 flex-shrink-0"><div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/90 border border-primary-container/25 shadow-sm"><span class="material-symbols-outlined text-primary-container text-[14px]">confirmation_number</span><span data-oscar-frame-counter class="font-mono text-micro-caption text-primary-fixed font-semibold tracking-wide">Кадр -- / ${String(pool.length).padStart(2,"0")}</span></div><button type="button" data-oscar-reel-close aria-label="Закрыть плёнку" class="w-8 h-8 rounded-full bg-surface-container-high text-text-muted hover:text-primary flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">close</span></button></div></div>
<div class="kgo-reel relative w-full rounded-xl bg-canvas-obsidian border border-primary-container/30 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.95)] my-2 p-1"><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>Kodak 35mm</span></div><div class="kgr-win select-none"><div class="kgr-track"><div class="kgr-run">${sequence.map(cellHtml).join("")}</div></div><div data-oscar-reel-frame class="kgr-frame" aria-hidden="true"></div></div><div class="kgr-perf"><div>${"<i></i>".repeat(12)}</div><span>35mm nitrate</span></div></div>
<div class="flex items-center justify-end px-1"><button type="button" data-oscar-skip class="font-micro-caption text-micro-caption text-text-muted hover:text-primary underline"${animate?"":" hidden"}>Пропустить</button></div>
<div id="oscar-reel-detail" class="mt-2"></div></section>`;
    const run=panel.querySelector(".kgr-run"),cells=[...run.children],viewport=panel.querySelector(".kgr-win"),frame=panel.querySelector("[data-oscar-reel-frame]"),skip=panel.querySelector("[data-oscar-skip]"),counter=panel.querySelector("[data-oscar-frame-counter]");
    const offsetFor=index=>reelPadding+index*reelStep+reelCellWidth/2-viewport.clientWidth/2;
    const start=offsetFor(0),finish=offsetFor(winnerIndex);
    panel.scrollIntoView({behavior:"smooth",block:"center"});
    const complete=()=>{
      if(token!==state.spinToken||!panel.isConnected)return;
      state.spinning=false;state.skipSpin=false;
      cells.forEach((cell,index)=>{cell.classList.remove("spin");cell.classList.toggle("chosen",index===winnerIndex);});
      run.classList.remove("fast");
      run.style.transform=`translateX(${-finish}px)`;
      counter.textContent=`Кадр ${String(pool.indexOf(film)+1).padStart(2,"0")} / ${String(pool.length).padStart(2,"0")}`;
      const sub=panel.querySelector("[data-oscar-reel-sub]");if(sub)sub.textContent=`${film.title||film.original_title||"Фильм"} · ${yearOf(film)}`;
      setLaunch(root,false);
      if(skip)skip.hidden=true;
      frame.classList.remove("hit");void frame.offsetWidth;frame.classList.add("hit");
      try{if(navigator.vibrate)navigator.vibrate([25,50,60]);}catch(_){}
      deps.openFilm(film,"oscar","oscar-reel-detail");
      requestAnimationFrame(()=>{
        const d=document.getElementById("oscar-reel-detail");
        if(d&&token===state.spinToken)window.scrollTo({top:Math.max(0,window.scrollY+d.getBoundingClientRect().top-96),behavior:"smooth"});
      });
    };
    if(!animate){run.style.transform=`translateX(${-finish}px)`;complete();return;}
    cells.forEach(cell=>cell.classList.add("spin"));
    run.style.transform=`translateX(${-start}px)`;run.classList.add("fast");
    sound("startFilmReelSound");
    const startTime=performance.now(),duration=4600;
    const step=now=>{
      if(token!==state.spinToken||!panel.isConnected)return;
      if(!root.offsetParent){stopSpin(root);return;}   // ушли с экрана «Оскар»
      const progress=state.skipSpin?1:Math.min(1,(now-startTime)/duration);
      const position=start+(finish-start)*(1-Math.pow(1-progress,4)),remaining=finish-position;
      run.style.transform=`translateX(${-position}px)`;
      if(progress>.4)run.classList.remove("fast");
      if(progress<1&&remaining>=.75){
        if(remaining<200)sound("setFilmReelLevel",remaining/200);
        state.spinFrame=requestAnimationFrame(step);return;
      }
      sound("stopFilmReelSound");
      complete();
    };
    state.spinFrame=requestAnimationFrame(step);
  }
  function getCurrentDecade(){
    const name=state.decade==="all"?"Все эпохи":state.decade==="gold"?"Золотой Голливуд":`${state.decade.slice(0,3)}0-е`;
    return {id:state.decade,title:name};
  }
  window.KGOscarPage={render,stop:stopSpin,info:oscarInfo,awards:awardsFor,getCurrentDecade};
})();
