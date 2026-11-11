/* Shared visual markup for every film reel in Kinoglobus. */
(function(){
  const hole=()=>'<i aria-hidden="true"></i>'.repeat(12);
  const perf=()=>`<div class="kg-reel-perf" aria-hidden="true"><div>${hole()}</div></div>`;
  const attr=(name,value)=>value?` ${name}="${String(value).replace(/[&"<>]/g,c=>({"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"}[c]))}"`:"";
  const html=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const spool=side=>`<div class="kg-imax-spool kg-imax-${side}" aria-hidden="true"><div class="kg-imax-wheel"><i></i><i></i><i></i><i></i><i></i><i></i><b></b></div></div>`;
  function renderImax(options={}){
    const p=options.prefix||"kg-imax",windowId=options.windowId||`${p}-window`,trackId=options.trackId||`${p}-track`,frameId=options.frameId||`${p}-frame`;
    const runId=options.runId||`${p}-run`,runClass=options.runClass||"run";
    const title=html(options.title||"Ожидание фильма"),subtitle=html(options.subtitle||"TMDB · кинопоиск 70 мм"),description=html(options.description||"После запуска поиска постеры пройдут через оптическую рамку и остановятся на найденном фильме.");
    const country=html(options.country||"КИНОПОИСК"),rating=html(options.rating||"—"),runtime=html(options.runtime||"—");
    const content=options.includeRun===false?"":`<div${attr("id",runId)} class="kg-reel-run kgr-run ${runClass}">${options.content||""}</div>`;
    return `<section${attr("id",options.rootId||`${p}-stage`)} class="kg-imax-stage ${options.rootClass||""}">
      <div class="kg-imax-machine">${spool("supply")}
        <div class="kg-imax-gate"><div${attr("id",windowId)} class="kg-reel-window kgr-win kg-imax-window"><div${attr("id",trackId)} class="kg-reel-track kgr-track">${content}</div><div${attr("id",frameId)} ${options.frameAttr||""} class="kg-reel-frame kgr-frame kg-imax-frame" aria-hidden="true"></div></div></div>
        ${spool("takeup")}
      </div>
      <div class="kg-imax-controls"><span class="kg-imax-led"></span><span data-imax-status aria-live="polite"></span><button type="button" data-imax-skip hidden>К выбранному фильму</button></div>
    </section>`;
  }
  const reelMode=()=>{try{return JSON.parse(localStorage.getItem("reelStyle")||'"35mm"');}catch{return"35mm";}};
  const ticketEscape=html;
  function ticketMarkup(film={},meta={}){
    const title=film.title||film.original_title||"Фильм из КиноГлобуса",original=film.original_title&&film.original_title!==title?film.original_title:"ПРЕМЬЕРНЫЙ СЕАНС";
    const year=(film.release_date||"").slice(0,4)||"—",rating=Number(film.vote_average)>0?Number(film.vote_average).toFixed(1):"—";
    const poster=film.poster_path?`https://image.tmdb.org/t/p/w500${film.poster_path}`:"";
    const runtime=film.runtime?`${film.runtime} МИН`:(meta.runtime||"СЕАНС КИНОГЛОБУСА"),country=meta.country||film._cc||"МИРОВОЙ КИНЕМАТОГРАФ";
    const overview=film.overview||"Билет в следующий фильм уже найден. Откройте карточку фильма, чтобы посмотреть описание и трейлер.";
    const serial=`KG-${String(film.id||"000000").replace(/\D/g,"").slice(-6).padStart(6,"0")}-${year}`;
    const seat=String((Number(film.id)||1)%36+1).padStart(2,"0"),row=String((Number(film.id)||1)%12+1).padStart(2,"0");
    return `<section class="kg-ticket" data-kg-ticket-card><div class="kg-ticket-top"><span>КИНОГЛОБУС <i>·</i> ПРЕМЬЕРНЫЙ АРХИВ</span><span class="kg-ticket-edition">ЗОЛОТОЙ БИЛЕТ</span></div>
      <div class="kg-ticket-body"><div class="kg-ticket-poster">${poster?`<img src="${poster}" alt="Постер фильма «${ticketEscape(title)}»" loading="lazy">`:`<div class="kg-ticket-no-poster">КИНОГЛОБУС<br>PREMIÈRE</div>`}<span>${year} <b>·</b> TMDB</span></div>
      <div class="kg-ticket-info"><div class="kg-ticket-kicker">${ticketEscape(country)} <span>·</span> ${ticketEscape(year)}</div><h2>${ticketEscape(title)}</h2><div class="kg-ticket-original">${ticketEscape(original)}</div>${film.director?`<div class="kg-ticket-director">Режиссёр · ${ticketEscape(film.director)}</div>`:""}<p class="kg-ticket-synopsis">${ticketEscape(overview)}</p><div class="kg-ticket-stats"><span><small>TMDB</small><b>★ ${rating} / 10</b></span><span><small>СЕАНС</small><b>${ticketEscape(runtime)}</b></span><span><small>АРХИВ</small><b>№ ${ticketEscape(String(film.id||"—"))}</b></span></div>${film.award?`<div class="kg-ticket-award">✦ ${ticketEscape(film.award)}</div>`:""}</div></div>
      <div class="kg-ticket-seam"><span></span><span>ОТРЫВНОЙ КОРЕШОК</span><span></span></div><div class="kg-ticket-stub"><div class="kg-ticket-seat"><small>ЛОЖА</small><b>ROYALE</b><small>РЯД</small><b>${row}</b><small>МЕСТО</small><b>${seat}</b></div><div class="kg-ticket-code"><span>${serial}</span><div class="kg-ticket-bars" aria-hidden="true"></div><small>${serial} · PREMIÈRE ADMIT ONE</small></div><button type="button" class="kg-ticket-tear" data-kg-ticket-tear aria-pressed="false"><span>✂</span> ОТРЫВАТЬ КОРЕШОК</button></div>
      <div class="kg-ticket-foot"><span>ВХОД В ЗАЛ ПРИ ПРЕДЪЯВЛЕНИИ</span><span class="kg-ticket-valid">ДЕЙСТВИТЕЛЕН</span></div></section>`;
  }
  function renderTicket(film,meta){return ticketMarkup(film,meta);}
  function presentTicket(container,film,meta={}){
    if(typeof container==="string")container=document.querySelector(container);
    if(!container)return false;
    const outlet=container.matches?.("[data-kg-ticket-outlet]")?container:container.querySelector("[data-kg-ticket-outlet]");
    if(!outlet)return false;
    const animation=container.querySelector("[data-kg-ticket-animation]");
    outlet.innerHTML=ticketMarkup(film,meta);outlet.hidden=false;if(animation)animation.hidden=true;
    return true;
  }
  function prepareTicket(container){
    if(typeof container==="string")container=document.querySelector(container);
    if(!container)return;
    const outlet=container.matches?.("[data-kg-ticket-outlet]")?container:container.querySelector("[data-kg-ticket-outlet]");
    const animation=container.querySelector("[data-kg-ticket-animation]");
    if(outlet){outlet.hidden=true;outlet.replaceChildren();}if(animation)animation.hidden=false;
    const stage=container.querySelector("[data-kg-ticket-shuffle]");if(stage){stage.dataset.skip="";stage.classList.remove("is-shuffling","is-landed");}
  }
  function renderTicketDeck(options={}){
    const seed=options.ticketFilm||options.film||{};
    return `<div class="kg-ticket-mode"><div data-kg-ticket-animation><section class="kg-ticket-shuffle" data-kg-ticket-shuffle aria-live="polite"><div class="kg-ticket-stack" aria-label="Перемешивание билетов"><div class="kg-ticket-stack-layer layer-1" data-kg-ticket-layer="1">${ticketMarkup(seed,options.ticketMeta||{})}</div><div class="kg-ticket-stack-layer layer-2" data-kg-ticket-layer="2">${ticketMarkup(seed,options.ticketMeta||{})}</div><div class="kg-ticket-stack-layer layer-3" data-kg-ticket-layer="3">${ticketMarkup(seed,options.ticketMeta||{})}</div><div class="kg-ticket-face" data-kg-ticket-face>${ticketMarkup(seed,options.ticketMeta||{})}</div></div><div class="kg-ticket-shuffle-status" data-kg-ticket-shuffle-status>Билеты перемешиваются…</div><button type="button" class="kg-ticket-skip" data-kg-ticket-skip>Показать результат</button></section></div><div data-kg-ticket-outlet hidden></div></div>`;
  }
  function animateTicketDeck(container,sequence,winner,options={}){
    if(typeof container==="string")container=document.querySelector(container);
    const stage=container?.querySelector("[data-kg-ticket-shuffle]"),face=container?.querySelector("[data-kg-ticket-face]"),status=container?.querySelector("[data-kg-ticket-shuffle-status]");
    if(!stage||!face)return Promise.resolve(false);
    const items=(sequence||[]).filter(Boolean),frames=items.length?items:[winner].filter(Boolean),duration=Math.max(0,Number(options.duration)||4200);
    stage.classList.add("is-shuffling");stage.classList.remove("is-landed");
    const layers=[...stage.querySelectorAll("[data-kg-ticket-layer]")];
    const fillLayers=index=>layers.forEach((layer,depth)=>{const item=frames[Math.max(0,index-depth-1)]||frames[0];layer.innerHTML=ticketMarkup(item,options.meta||{});});
    const show=(film,index)=>{fillLayers(index);face.innerHTML=ticketMarkup(film,options.meta||{});face.classList.remove("ticket-flip");void face.offsetWidth;face.classList.add("ticket-flip");if(status)status.textContent=`Билет ${String(index+1).padStart(2,"0")} · ${String(frames.length).padStart(2,"0")}`;options.onFrame?.(film,index);};
    const land=()=>{fillLayers(Math.max(0,frames.length-1));if(winner)face.innerHTML=ticketMarkup(winner,options.meta||{});stage.classList.remove("is-shuffling");stage.classList.add("is-landed");if(status)status.textContent="Ваш фильм найден";return true;};
    if(options.reducedMotion||frames.length<2)return Promise.resolve(land());
    return new Promise(resolve=>{
      let index=0,last=performance.now(),started=last,done=false;
      const finish=ok=>{if(done)return;done=true;if(ok)land();else stage.classList.remove("is-shuffling");resolve(ok);};
      const step=now=>{
        if(options.cancelled?.()){finish(false);return;}
        if(stage.dataset.skip==="true"||options.shouldSkip?.()){finish(true);return;}
        const progress=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-progress,3);
        const base=Math.max(55,duration/Math.max(frames.length,1)),delay=base*(.22+.95*ease);
        if(now-last>=delay){index=Math.min(frames.length-1,index+1);show(frames[index],index);last=now;if(index>=frames.length-1||progress>=1){finish(true);return;}}
        requestAnimationFrame(step);
      };
      show(frames[0],0);requestAnimationFrame(step);
    });
  }
  document.addEventListener("click",event=>{
    const skip=event.target.closest("[data-kg-ticket-skip]");if(skip){const stage=skip.closest("[data-kg-ticket-shuffle]");if(stage)stage.dataset.skip="true";return;}
    const button=event.target.closest("[data-kg-ticket-tear]");if(!button)return;
    const card=button.closest("[data-kg-ticket-card]");if(!card||button.getAttribute("aria-pressed")==="true")return;
    button.setAttribute("aria-pressed","true");button.innerHTML="✓ БИЛЕТ ПОГАШЕН";card.classList.add("is-torn");
    try{navigator.vibrate?.([12,28,18]);}catch{}
  });
  const cassetteImage=path=>path?`https://image.tmdb.org/t/p/w500${path}`:"";
  function renderCassetteDeck(){
    return `<section class="kg-cassette-deck" data-kg-cassette-deck>
      <div class="kg-cassette-telemetry"><div><span class="kg-cassette-live">● КИНОГЛОБУС · HI-FI</span><small>КАССЕТНАЯ ДЕКА · COVER FLOW</small></div><div class="kg-cassette-vu"><small>L</small><span></span><span></span><span></span><span></span><span></span><small>R</small></div><div class="kg-cassette-counter" data-kg-cassette-counter>FILM 01 / 01</div></div>
      <div class="kg-cassette-mechanism"><div class="kg-cassette-hub" data-kg-cassette-hub="left"><i></i></div><div class="kg-cassette-tape"><span data-kg-cassette-progress></span></div><div class="kg-cassette-hub" data-kg-cassette-hub="right"><i></i></div></div>
      <div class="kg-cassette-stage"><div class="kg-cassette-coverflow" data-kg-cassette-track aria-label="Карусель фильмов"></div><div class="kg-cassette-swipe-hint">↔ СВАЙП ДЛЯ ПЕРЕМЕЩЕНИЯ ПО ФИЛЬМАМ</div></div>
      <article class="kg-cassette-info"><div class="kg-cassette-info-head"><span data-kg-cassette-director></span><span data-kg-cassette-year></span></div><h2 data-kg-cassette-title>Выберите фильм</h2><div class="kg-cassette-tags"><span data-kg-cassette-rating>★ —</span><span data-kg-cassette-country>КИНОГЛОБУС</span><span data-kg-cassette-runtime></span><span data-kg-cassette-genre>ФИЛЬМ</span></div><p data-kg-cassette-overview>Листайте карточки или запустите случайный выбор.</p><div class="kg-cassette-actions"><button type="button" data-kg-cassette-watch>▶ Смотреть фильм</button><button type="button" class="kg-cassette-icon" data-kg-cassette-settings aria-label="Настройки">☷</button></div></article>
      <div class="kg-cassette-transport"><button type="button" data-kg-cassette-prev aria-label="Предыдущий фильм">◀◀<small>REW</small></button><button type="button" data-kg-cassette-random>🎲 СЛУЧАЙНЫЙ ФИЛЬМ<small>ROLL / RANDOM</small></button><button type="button" data-kg-cassette-next aria-label="Следующий фильм">▶▶<small>FFWD</small></button></div>
      <div class="kg-cassette-footer"><span data-kg-cassette-status>КАССЕТА ГОТОВА</span><button type="button" data-kg-cassette-sound>♫ ЗВУК ДЕКИ: ВЫКЛ</button></div>
    </section>`;
  }
  const cassetteStates=new WeakMap();
  function mountCassetteDeck(container,films=[],activeFilm=null,options={}){
    if(typeof container==="string")container=document.querySelector(container);
    const root=container?.matches?.("[data-kg-cassette-deck]")?container:container?.querySelector?.("[data-kg-cassette-deck]");
    if(!root)return null;
    const list=[...new Map((films||[]).filter(Boolean).map(f=>[String(f.id??f.title),f])).values()];
    if(!list.length&&activeFilm)list.push(activeFilm);
    const indexById=new Map(list.map((f,i)=>[String(f.id??f.title),i]));
    const state={films:list,index:Math.max(0,indexById.get(String(activeFilm?.id??activeFilm?.title))||0),options,sound:false,audio:null,rolling:false};
    cassetteStates.set(root,state);
    const track=root.querySelector("[data-kg-cassette-track]");if(!track)return null;
    const filmTitle=f=>f?.title||f?.original_title||"Фильм";
    const card=(f,i)=>`<button type="button" class="kg-cassette-card" data-cassette-index="${i}" aria-label="Выбрать: ${html(filmTitle(f))}"><span class="kg-cassette-card-top">TYPE II · CrO2 <i>#KG-${String(f.id||i+1).slice(-5)}</i></span><span class="kg-cassette-card-poster">${f.poster_path?`<img loading="lazy" alt="${html(filmTitle(f))}" src="${cassetteImage(f.poster_path)}">`:`<b>${html(filmTitle(f))}</b>`}<span class="kg-cassette-card-caption"><b>${html(filmTitle(f))}</b><i>${html((f.release_date||"").slice(0,4))}</i></span></span><span class="kg-cassette-card-bottom"><i></i><b></b><i></i></span></button>`;
    const playSound=type=>{if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;state.audio||=new C();if(state.audio.state==="suspended")state.audio.resume();const now=state.audio.currentTime,o=state.audio.createOscillator(),g=state.audio.createGain();o.type=type==="roll"?"sawtooth":"triangle";o.frequency.setValueAtTime(type==="roll"?280:145,now);o.frequency.exponentialRampToValueAtTime(type==="roll"?590:38,now+.08);g.gain.setValueAtTime(.045,now);g.gain.exponentialRampToValueAtTime(.001,now+.11);o.connect(g);g.connect(state.audio.destination);o.start(now);o.stop(now+.12);}catch{}};
    const update=(index,dir=0)=>{
      if(!list.length)return null;
      state.index=(index+list.length)%list.length;
      const active=list[state.index];track.innerHTML="";
      for(let delta=-2;delta<=2;delta++){
        const i=(state.index+delta+list.length)%list.length,film=list[i];if(Math.abs(delta)>list.length/2)continue;
        track.insertAdjacentHTML("beforeend",card(film,i));const el=track.lastElementChild;
        el.style.transform=`translateX(calc(-50% + ${delta*91+(delta<0?-36:delta>0?36:0)}px)) translateZ(${delta===0?72:-92-Math.abs(delta)*24}px) rotateY(${delta===0?0:delta<0?47:-47}deg) scale(${delta===0?1.04:.84})`;
        el.style.zIndex=String(10-Math.abs(delta));el.style.opacity=delta===0?"1":Math.abs(delta)>1?".28":".72";el.classList.toggle("active",delta===0);
      }
      const text=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value||"";};
      text("[data-kg-cassette-title]",filmTitle(active));text("[data-kg-cassette-director]",active.director||active._director||"КИНОГЛОБУС · ПРЕМЬЕРНЫЙ АРХИВ");text("[data-kg-cassette-year]",(active.release_date||"").slice(0,4));text("[data-kg-cassette-rating]",Number(active.vote_average)>0?`★ ${Number(active.vote_average).toFixed(1)} TMDB`:"★ — TMDB");text("[data-kg-cassette-country]",active._cc||active.origin_country?.[0]||"КИНОГЛОБУС");text("[data-kg-cassette-runtime]",active.runtime?`${active.runtime} МИН`:"");text("[data-kg-cassette-genre]",(active.genres||[]).map(g=>typeof g==="string"?g:g.name).filter(Boolean).slice(0,2).join(" · ")||"ФИЛЬМ");text("[data-kg-cassette-overview]",active.overview||"Описание фильма появится в карточке.");text("[data-kg-cassette-counter]",`FILM ${String(state.index+1).padStart(2,"0")} / ${String(list.length).padStart(2,"0")}`);text("[data-kg-cassette-status]",dir?"КАССЕТА ПЕРЕМЕЩЕНА":"КАССЕТА ГОТОВА");
      const progress=root.querySelector("[data-kg-cassette-progress]");if(progress)progress.style.width=`${list.length<2?50:Math.round(state.index/(list.length-1)*100)}%`;
      root.querySelectorAll("[data-kg-cassette-hub]").forEach((hub,i)=>hub.style.transform=`rotate(${state.index*45*(i?1:-1)}deg)`);
      if(dir)playSound("click");options.onChange?.(active,state.index);return active;
    };
    const choose=index=>{const film=update(index,index>state.index?1:-1);return film;};
    root.onclick=event=>{
      const target=event.target.closest("[data-cassette-index],[data-kg-cassette-prev],[data-kg-cassette-next],[data-kg-cassette-random],[data-kg-cassette-watch],[data-kg-cassette-settings],[data-kg-cassette-sound]");if(!target)return;
      if(target.hasAttribute("data-cassette-index")){const before=state.index,f=choose(Number(target.dataset.cassetteIndex));if(before!==state.index)options.onSelect?.(f);return;}
      if(target.hasAttribute("data-kg-cassette-prev")){choose(state.index-1);return;}if(target.hasAttribute("data-kg-cassette-next")){choose(state.index+1);return;}
      if(target.hasAttribute("data-kg-cassette-watch")){options.onOpen?.(list[state.index]);return;}if(target.hasAttribute("data-kg-cassette-settings")){(options.onSettings||(()=>document.getElementById("gear")?.click()))();return;}
      if(target.hasAttribute("data-kg-cassette-sound")){state.sound=!state.sound;target.textContent=`♫ ЗВУК ДЕКИ: ${state.sound?"ВКЛ":"ВЫКЛ"}`;if(state.sound)playSound("click");return;}
      if(target.hasAttribute("data-kg-cassette-random")){const f=list[Math.floor(Math.random()*list.length)];spinCassetteDeck(root,list,[...Array(9)].map(()=>list[Math.floor(Math.random()*list.length)]).concat(f),f,{duration:1900,onFinish:options.onRandom||options.onOpen});}
    };
    let x0=0,y0=0;track.ontouchstart=e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;};track.ontouchend=e=>{const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.2)choose(state.index+(dx<0?1:-1));};
    root.onkeydown=event=>{if(event.key==="ArrowLeft")choose(state.index-1);if(event.key==="ArrowRight")choose(state.index+1);};
    update(state.index);return {root,state,update,choose};
  }
  function spinCassetteDeck(container,films,sequence,winner,options={}){
    const root=typeof container==="string"?document.querySelector(container):container;
    const existing=root?.matches?.("[data-kg-cassette-deck]")?root:root?.querySelector?.("[data-kg-cassette-deck]");
    const inherited=existing?cassetteStates.get(existing)?.options||{}:{};
    const merged={...inherited,...options};
    const mounted=mountCassetteDeck(container,films,winner,merged);if(!mounted)return Promise.resolve(false);
    const state=mounted.state,items=(sequence||[]).filter(Boolean),duration=Math.max(350,Number(options.duration)||2600);
    const status=mounted.root.querySelector("[data-kg-cassette-status]");
    const land=()=>{const idx=state.films.findIndex(f=>String(f.id)===String(winner?.id));if(idx>=0)mounted.update(idx,0);state.rolling=false;mounted.root.classList.remove("is-rolling");if(status)status.textContent="ФИЛЬМ НАЙДЕН · ГОТОВ К ПРОСМОТРУ";options.onFrame?.(winner,steps);options.onFinish?.(winner);return true;};
    const steps=Math.max(8,Math.min(24,items.length||12));
    if(options.reducedMotion)return Promise.resolve(land());
    state.rolling=true;mounted.root.classList.add("is-rolling");if(status)status.textContent="КАССЕТА ПЕРЕМАТЫВАЕТСЯ…";
    let last=-1;
    return new Promise(resolve=>{
      const start=performance.now();const frame=now=>{
        if(options.cancelled?.()){state.rolling=false;mounted.root.classList.remove("is-rolling");resolve(false);return;}
        if(options.shouldSkip?.()){land();resolve(true);return;}
        const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3),n=Math.min(steps-1,Math.floor(ease*steps));
        if(n!==last){last=n;const film=items[Math.min(items.length-1,Math.floor(n/Math.max(1,steps-1)*(items.length-1)))]||winner;const idx=state.films.findIndex(f=>String(f.id)===String(film.id));if(idx>=0)mounted.update(idx,1);if(status)status.textContent="ПЕРЕМАТКА · "+String(n+1).padStart(2,"0");options.onFrame?.(film,n);}
        if(p>=1){land();resolve(true);return;}
        requestAnimationFrame(frame);
      };requestAnimationFrame(frame);
    });
  }
  function isCassetteMode(){return reelMode()==="cassette";}
  const cassetteImage=path=>path?`https://image.tmdb.org/t/p/w500${path}`:"";
  function renderCassetteDeck(){
    return `<section class="kg-cassette-deck" data-kg-cassette-deck>
      <div class="kg-cassette-telemetry"><div><span class="kg-cassette-live">● КИНОГЛОБУС · HI-FI</span><small>КАССЕТНАЯ ДЕКА · COVER FLOW</small></div><div class="kg-cassette-vu"><small>L</small><span></span><span></span><span></span><span></span><span></span><small>R</small></div><div class="kg-cassette-counter" data-kg-cassette-counter>FILM 01 / 01</div></div>
      <div class="kg-cassette-mechanism"><div class="kg-cassette-hub" data-kg-cassette-hub="left"><i></i></div><div class="kg-cassette-tape"><span data-kg-cassette-progress></span></div><div class="kg-cassette-hub" data-kg-cassette-hub="right"><i></i></div></div>
      <div class="kg-cassette-stage"><div class="kg-cassette-coverflow" data-kg-cassette-track aria-label="Карусель фильмов"></div><div class="kg-cassette-swipe-hint">↔ СВАЙП ДЛЯ ПЕРЕМЕЩЕНИЯ ПО ФИЛЬМАМ</div></div>
      <article class="kg-cassette-info"><div class="kg-cassette-info-head"><span data-kg-cassette-director></span><span data-kg-cassette-year></span></div><h2 data-kg-cassette-title>Выберите фильм</h2><div class="kg-cassette-tags"><span data-kg-cassette-rating>★ —</span><span data-kg-cassette-country>КИНОГЛОБУС</span><span data-kg-cassette-runtime></span><span data-kg-cassette-genre>ФИЛЬМ</span></div><p data-kg-cassette-overview>Листайте карточки или запустите случайный выбор.</p><div class="kg-cassette-actions"><button type="button" data-kg-cassette-watch>▶ Смотреть фильм</button><button type="button" class="kg-cassette-icon" data-kg-cassette-settings aria-label="Настройки">☷</button></div></article>
      <div class="kg-cassette-transport"><button type="button" data-kg-cassette-prev aria-label="Предыдущий фильм">◀◀<small>REW</small></button><button type="button" data-kg-cassette-random>🎲 СЛУЧАЙНЫЙ ФИЛЬМ<small>ROLL / RANDOM</small></button><button type="button" data-kg-cassette-next aria-label="Следующий фильм">▶▶<small>FFWD</small></button></div>
      <div class="kg-cassette-footer"><span data-kg-cassette-status>КАССЕТА ГОТОВА</span><button type="button" data-kg-cassette-sound>♫ ЗВУК ДЕКИ: ВЫКЛ</button></div>
    </section>`;
  }
  const cassetteStates=new WeakMap();
  function mountCassetteDeck(container,films=[],activeFilm=null,options={}){
    if(typeof container==="string")container=document.querySelector(container);
    const root=container?.matches?.("[data-kg-cassette-deck]")?container:container?.querySelector?.("[data-kg-cassette-deck]");
    if(!root)return null;
    const list=[...new Map((films||[]).filter(Boolean).map(f=>[String(f.id??f.title),f])).values()];
    if(!list.length&&activeFilm)list.push(activeFilm);
    const indexById=new Map(list.map((f,i)=>[String(f.id??f.title),i]));
    const state={films:list,index:Math.max(0,indexById.get(String(activeFilm?.id??activeFilm?.title))||0),options,sound:false,audio:null,rolling:false};
    cassetteStates.set(root,state);
    const track=root.querySelector("[data-kg-cassette-track]");if(!track)return null;
    const filmTitle=f=>f?.title||f?.original_title||"Фильм";
    const card=(f,i)=>`<button type="button" class="kg-cassette-card" data-cassette-index="${i}" aria-label="Выбрать: ${html(filmTitle(f))}"><span class="kg-cassette-card-top">TYPE II · CrO2 <i>#KG-${String(f.id||i+1).slice(-5)}</i></span><span class="kg-cassette-card-poster">${f.poster_path?`<img loading="lazy" alt="${html(filmTitle(f))}" src="${cassetteImage(f.poster_path)}">`:`<b>${html(filmTitle(f))}</b>`}<span class="kg-cassette-card-caption"><b>${html(filmTitle(f))}</b><i>${html((f.release_date||"").slice(0,4))}</i></span></span><span class="kg-cassette-card-bottom"><i></i><b></b><i></i></span></button>`;
    const playSound=type=>{if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;state.audio||=new C();if(state.audio.state==="suspended")state.audio.resume();const now=state.audio.currentTime,o=state.audio.createOscillator(),g=state.audio.createGain();o.type=type==="roll"?"sawtooth":"triangle";o.frequency.setValueAtTime(type==="roll"?280:145,now);o.frequency.exponentialRampToValueAtTime(type==="roll"?590:38,now+.08);g.gain.setValueAtTime(.045,now);g.gain.exponentialRampToValueAtTime(.001,now+.11);o.connect(g);g.connect(state.audio.destination);o.start(now);o.stop(now+.12);}catch{}};
    const update=(index,dir=0)=>{
      if(!list.length)return null;
      state.index=(index+list.length)%list.length;
      const active=list[state.index];track.innerHTML="";
      for(let delta=-2;delta<=2;delta++){
        const i=(state.index+delta+list.length)%list.length,film=list[i];if(Math.abs(delta)>list.length/2)continue;
        track.insertAdjacentHTML("beforeend",card(film,i));const el=track.lastElementChild;
        el.style.transform=`translateX(calc(-50% + ${delta*91+(delta<0?-36:delta>0?36:0)}px)) translateZ(${delta===0?72:-92-Math.abs(delta)*24}px) rotateY(${delta===0?0:delta<0?47:-47}deg) scale(${delta===0?1.04:.84})`;
        el.style.zIndex=String(10-Math.abs(delta));el.style.opacity=delta===0?"1":Math.abs(delta)>1?".28":".72";el.classList.toggle("active",delta===0);
      }
      const text=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value||"";};
      text("[data-kg-cassette-title]",filmTitle(active));text("[data-kg-cassette-director]",active.director||active._director||"КИНОГЛОБУС · ПРЕМЬЕРНЫЙ АРХИВ");text("[data-kg-cassette-year]",(active.release_date||"").slice(0,4));text("[data-kg-cassette-rating]",Number(active.vote_average)>0?`★ ${Number(active.vote_average).toFixed(1)} TMDB`:"★ — TMDB");text("[data-kg-cassette-country]",active._cc||active.origin_country?.[0]||"КИНОГЛОБУС");text("[data-kg-cassette-runtime]",active.runtime?`${active.runtime} МИН`:"");text("[data-kg-cassette-genre]",(active.genres||[]).map(g=>typeof g==="string"?g:g.name).filter(Boolean).slice(0,2).join(" · ")||"ФИЛЬМ");text("[data-kg-cassette-overview]",active.overview||"Описание фильма появится в карточке.");text("[data-kg-cassette-counter]",`FILM ${String(state.index+1).padStart(2,"0")} / ${String(list.length).padStart(2,"0")}`);text("[data-kg-cassette-status]",dir?"КАССЕТА ПЕРЕМЕЩЕНА":"КАССЕТА ГОТОВА");
      const progress=root.querySelector("[data-kg-cassette-progress]");if(progress)progress.style.width=`${list.length<2?50:Math.round(state.index/(list.length-1)*100)}%`;
      root.querySelectorAll("[data-kg-cassette-hub]").forEach((hub,i)=>hub.style.transform=`rotate(${state.index*45*(i?1:-1)}deg)`);
      if(dir)playSound("click");options.onChange?.(active,state.index);return active;
    };
    const choose=index=>{const film=update(index,index>state.index?1:-1);return film;};
    root.onclick=event=>{
      const target=event.target.closest("[data-cassette-index],[data-kg-cassette-prev],[data-kg-cassette-next],[data-kg-cassette-random],[data-kg-cassette-watch],[data-kg-cassette-settings],[data-kg-cassette-sound]");if(!target)return;
      if(target.hasAttribute("data-cassette-index")){const before=state.index,f=choose(Number(target.dataset.cassetteIndex));if(before!==state.index)options.onSelect?.(f);return;}
      if(target.hasAttribute("data-kg-cassette-prev")){choose(state.index-1);return;}if(target.hasAttribute("data-kg-cassette-next")){choose(state.index+1);return;}
      if(target.hasAttribute("data-kg-cassette-watch")){options.onOpen?.(list[state.index]);return;}if(target.hasAttribute("data-kg-cassette-settings")){(options.onSettings||(()=>document.getElementById("gear")?.click()))();return;}
      if(target.hasAttribute("data-kg-cassette-sound")){state.sound=!state.sound;target.textContent=`♫ ЗВУК ДЕКИ: ${state.sound?"ВКЛ":"ВЫКЛ"}`;if(state.sound)playSound("click");return;}
      if(target.hasAttribute("data-kg-cassette-random")){const f=list[Math.floor(Math.random()*list.length)];spinCassetteDeck(root,list,[...Array(9)].map(()=>list[Math.floor(Math.random()*list.length)]).concat(f),f,{duration:1900,onFinish:options.onRandom||options.onOpen});}
    };
    let x0=0,y0=0;track.ontouchstart=e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;};track.ontouchend=e=>{const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.2)choose(state.index+(dx<0?1:-1));};
    root.onkeydown=event=>{if(event.key==="ArrowLeft")choose(state.index-1);if(event.key==="ArrowRight")choose(state.index+1);};
    update(state.index);return {root,state,update,choose};
  }
  function spinCassetteDeck(container,films,sequence,winner,options={}){
    const root=typeof container==="string"?document.querySelector(container):container;
    const existing=root?.matches?.("[data-kg-cassette-deck]")?root:root?.querySelector?.("[data-kg-cassette-deck]");
    const inherited=existing?cassetteStates.get(existing)?.options||{}:{};
    const merged={...inherited,...options};
    const mounted=mountCassetteDeck(container,films,winner,merged);if(!mounted)return Promise.resolve(false);
    const state=mounted.state,items=(sequence||[]).filter(Boolean),duration=Math.max(350,Number(options.duration)||2600);
    const status=mounted.root.querySelector("[data-kg-cassette-status]");
    const land=()=>{const idx=state.films.findIndex(f=>String(f.id)===String(winner?.id));if(idx>=0)mounted.update(idx,0);state.rolling=false;mounted.root.classList.remove("is-rolling");if(status)status.textContent="ФИЛЬМ НАЙДЕН · ГОТОВ К ПРОСМОТРУ";options.onFrame?.(winner,steps);options.onFinish?.(winner);return true;};
    const steps=Math.max(8,Math.min(24,items.length||12));
    if(options.reducedMotion)return Promise.resolve(land());
    state.rolling=true;mounted.root.classList.add("is-rolling");if(status)status.textContent="КАССЕТА ПЕРЕМАТЫВАЕТСЯ…";
    let last=-1;
    return new Promise(resolve=>{
      const start=performance.now();const frame=now=>{
        if(options.cancelled?.()){state.rolling=false;mounted.root.classList.remove("is-rolling");resolve(false);return;}
        if(options.shouldSkip?.()){land();resolve(true);return;}
        const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3),n=Math.min(steps-1,Math.floor(ease*steps));
        if(n!==last){last=n;const film=items[Math.min(items.length-1,Math.floor(n/Math.max(1,steps-1)*(items.length-1)))]||winner;const idx=state.films.findIndex(f=>String(f.id)===String(film.id));if(idx>=0)mounted.update(idx,1);if(status)status.textContent="ПЕРЕМАТКА · "+String(n+1).padStart(2,"0");options.onFrame?.(film,n);}
        if(p>=1){land();resolve(true);return;}
        requestAnimationFrame(frame);
      };requestAnimationFrame(frame);
    });
  }
  const projectionStates=new WeakMap();
  const projectionPoster=path=>path?`https://image.tmdb.org/t/p/w500${path}`:"";
  function renderProjectionTrack(){
    return `<section class="kg-projection" data-kg-projection>
      <div class="kg-projection-top"><span><i></i> ПРОЕКЦИОННЫЙ ТРАКТ · 35 ММ</span><b data-kg-projection-counter>КАДР 00 / 00</b><span>24 FPS</span></div>
      <div class="kg-projection-telemetry"><span>35 MM · KODAK</span><span data-kg-projection-state>ОЖИДАНИЕ ПОИСКА</span><span>КИНОГЛОБУС</span></div>
      <div class="kg-projection-machine"><div class="kg-projection-perfs" aria-hidden="true">${"<i></i>".repeat(11)}</div><div class="kg-projection-window"><div class="kg-projection-beam"></div><div class="kg-projection-image" data-kg-projection-image><div class="kg-projection-empty">ЗАПУСТИТЕ ПОИСК ФИЛЬМА</div></div><div class="kg-projection-frame-meta"><span data-kg-projection-year>35 MM · 24 FPS</span><b data-kg-projection-rating>● TMDB</b></div></div><div class="kg-projection-perfs" aria-hidden="true">${"<i></i>".repeat(11)}</div></div>
      <div class="kg-projection-caption"><small data-kg-projection-country>КИНОГЛОБУС · ПОИСК</small><strong data-kg-projection-title>Фильм появится после запуска</strong><span data-kg-projection-subtitle>Оптическая рамка 35 мм</span></div>
    </section>`;
  }
  function projectionRoot(container){if(typeof container==="string")container=document.querySelector(container);return container?.matches?.("[data-kg-projection]")?container:container?.querySelector?.("[data-kg-projection]");}
  function mountProjectionTrack(container,film=null,meta={}){
    const root=projectionRoot(container);if(!root)return null;
    const state=projectionStates.get(root)||{rolling:false};projectionStates.set(root,state);state.film=film;state.meta=meta;
    const title=film?.title||film?.original_title||"Фильм появится после запуска";
    const image=root.querySelector("[data-kg-projection-image]"),poster=projectionPoster(film?.poster_path);
    if(image)image.innerHTML=poster?`<img src="${poster}" alt="Постер фильма «${html(title)}»" loading="lazy"><span class="kg-projection-image-shade"></span>`:`<div class="kg-projection-empty">${html(title)}</div>`;
    const set=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value||"";};
    set("[data-kg-projection-title]",title);set("[data-kg-projection-year]",`${(film?.release_date||"").slice(0,4)||"35 MM"} · KODAK`);set("[data-kg-projection-rating]",Number(film?.vote_average)>0?`★ ${Number(film.vote_average).toFixed(1)}`:"● TMDB");set("[data-kg-projection-country]",meta.country||film?._cc||film?.origin_country?.[0]||"КИНОГЛОБУС · ПОИСК");set("[data-kg-projection-subtitle]",[film?.original_title&&film.original_title!==title?film.original_title:"",film?.runtime?`${film.runtime} мин`:"Оптическая рамка 35 мм"].filter(Boolean).join(" · "));return {root,state};
  }
  function spinProjectionTrack(container,sequence,winner,options={}){
    const mounted=mountProjectionTrack(container,sequence?.[0]||winner,options.meta||{});if(!mounted)return Promise.resolve(false);
    const {root,state}=mounted,frames=(sequence||[]).filter(Boolean),winnerIndex=frames.findIndex(f=>String(f?.id)===String(winner?.id)),items=(winnerIndex>=0?frames.slice(0,winnerIndex+1):frames).filter(Boolean),duration=Math.max(350,Number(options.duration)||3000),counter=root.querySelector("[data-kg-projection-counter]"),status=root.querySelector("[data-kg-projection-state]"),img=root.querySelector("[data-kg-projection-image]");
    const land=()=>{mountProjectionTrack(root,winner,options.meta||{});root.classList.remove("is-running");state.rolling=false;if(status)status.textContent="ФИЛЬМ НАЙДЕН · КАДР ЗАФИКСИРОВАН";options.onFrame?.(winner,items.length);return true;};
    if(options.reducedMotion||items.length<2)return Promise.resolve(land());
    state.rolling=true;root.classList.add("is-running");if(status)status.textContent="ПРОЕКЦИЯ ИДЁТ…";
    const steps=Math.max(12,Math.min(40,items.length*2));let last=-1;
    return new Promise(resolve=>{const start=performance.now(),step=now=>{if(options.cancelled?.()){root.classList.remove("is-running");state.rolling=false;resolve(false);return;}if(options.shouldSkip?.()){resolve(land());return;}const progress=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-progress,3),n=Math.min(steps-1,Math.floor(ease*steps));if(n!==last){last=n;const idx=Math.min(items.length-1,Math.floor(n/Math.max(1,steps-1)*(items.length-1))),film=items[idx];mountProjectionTrack(root,film,options.meta||{});if(counter)counter.textContent=`КАДР ${String(n+1).padStart(2,"0")} / ${String(steps).padStart(2,"0")}`;if(img){img.classList.remove("kg-projection-flash");void img.offsetWidth;img.classList.add("kg-projection-flash");}options.onFrame?.(film,n);}if(progress>=1){resolve(land());return;}requestAnimationFrame(step);};requestAnimationFrame(step);});
  }
  function isProjectionMode(){return reelMode()==="projection";}
  function isCassetteMode(){return reelMode()==="cassette";}
  function render(options={}){
    const mode=options.mode||reelMode();
    if(mode==="70mm")return renderImax({...options,mode:"70mm"});
    if(mode==="ticket")return renderTicketDeck(options);
    if(mode==="cassette")return renderCassetteDeck(options);
    if(mode==="projection")return renderProjectionTrack(options);
    // The main screen stores one visual choice for all roulette routes.
    if(options.mode!=="35mm"){
      try{if(JSON.parse(localStorage.getItem("reelStyle")||'"35mm"')==="70mm")return renderImax({...options,mode:"70mm"});}catch{}
    }
    const shellClass=options.shellClass||"relative w-full rounded-xl bg-canvas-obsidian border border-primary-container/30 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.95)] p-1";
    const windowClass=["kg-reel-window","kgr-win","select-none",options.windowClass||""].filter(Boolean).join(" ");
    const trackClass=["kg-reel-track","kgr-track",options.trackClass||""].filter(Boolean).join(" ");
    const runClass=["kg-reel-run","kgr-run",options.runClass||""].filter(Boolean).join(" ");
    const frameClass=["kg-reel-frame","kgr-frame",options.frameClass||""].filter(Boolean).join(" ");
    const run=options.includeRun===false?"":`<div${attr("id",options.runId)} class="${runClass}">${options.content||""}</div>`;
    const frameAttributes=(options.frameAttr||"").trim();
    return `<div${attr("class",shellClass)}>${perf()}<div${attr("id",options.windowId)} class="${windowClass}"><div${attr("id",options.trackId)} class="${trackClass}">${run}</div><div${attr("id",options.frameId)} ${frameAttributes} class="${frameClass}" aria-hidden="true"></div></div>${perf()}</div>`;
  }
  const style=document.createElement("style");style.id="kg-cinema-reel-style";
  style.textContent=`.kg-reel-perf{display:flex;align-items:center;justify-content:center;padding:4px 8px;background:rgba(0,0,0,.6);overflow:hidden;user-select:none}.kg-reel-perf>div{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:360px}.kg-reel-perf i{display:inline-block;width:10px;height:6px;border-radius:2px;background:#262626;border:1px solid #525252;flex:none}
  .kg-reel-window{position:relative;height:150px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}.kg-reel-track{position:absolute;inset:0;overflow:hidden}.kg-reel-run{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:10px;padding-left:8px;will-change:transform}.kg-reel-frame{position:absolute;left:50%;top:50%;width:94px;height:128px;transform:translate(-50%,-50%);z-index:5;pointer-events:none;border:2px solid #ffb830;border-radius:10px;box-shadow:0 0 18px rgba(255,184,48,.5),inset 0 0 14px rgba(255,184,48,.22)}.kg-reel-frame.hit{animation:kgImxFrameHit .85s ease-out}.kg-reel-frame:before,.kg-reel-frame:after{content:"";position:absolute;left:50%;transform:translateX(-50%);border:6px solid transparent}.kg-reel-frame:before{top:-9px;border-top:7px solid #ffb830;border-bottom:0}.kg-reel-frame:after{bottom:-9px;border-bottom:7px solid #ffb830;border-top:0}@keyframes kgImxFrameHit{45%{box-shadow:0 0 38px 8px rgba(255,184,48,.75),inset 0 0 22px rgba(255,184,48,.4)}}
  .kg-imax-stage{--imax-amber:#f8b52b;--imax-green:#35d59a;position:relative;width:100%;overflow:hidden;border:1px solid #493817;border-radius:16px;background:radial-gradient(ellipse at 50% 45%,#332410 0,#11131a 48%,#08090d 100%);box-shadow:inset 0 0 30px #000c,0 12px 30px #0007;color:#eee5d9;font:500 9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}.kg-imax-stage:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(255,184,48,.14),transparent 72%)}.kg-imax-head,.kg-imax-gate-label,.kg-imax-gate-foot{position:relative;z-index:2;display:flex;justify-content:space-between;gap:5px;padding:7px 9px;color:#b9b1a5;font-size:8px;letter-spacing:.06em}.kg-imax-head{border-bottom:1px solid #ffffff12}.kg-imax-head>span:first-child{color:#ffd178;font-weight:800}.kg-imax-head i{color:#777}.kg-imax-head-state{color:#66dca8}.kg-imax-machine{position:relative;z-index:1;display:grid;grid-template-columns:clamp(48px,17vw,78px) minmax(0,1fr) clamp(48px,17vw,78px);align-items:center;gap:5px;padding:8px 7px 6px}.kg-imax-spool{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;color:#bdb09a;font-size:7px;text-align:center}.kg-imax-wheel{position:relative;width:100%;aspect-ratio:1;border-radius:50%;border:2px solid #707986;background:radial-gradient(circle,#08090d 0 13%,transparent 14%),repeating-radial-gradient(circle,#090b10 0 5px,#1a2028 6px 8px,#0a0c11 9px 12px);box-shadow:0 0 0 3px #090a0d,0 0 0 4px #9a6d22,0 4px 16px #000,inset 0 0 15px #000d;overflow:hidden}.kg-imax-supply .kg-imax-wheel{border-color:#d1952a;filter:drop-shadow(0 0 6px #d1902360)}.kg-imax-takeup .kg-imax-wheel{border-color:#41bd91;filter:drop-shadow(0 0 6px #26a77c50)}.kg-imax-wheel>i{position:absolute;left:50%;top:4%;width:8%;height:42%;transform-origin:50% 110%;background:linear-gradient(90deg,#28303b,#d2d9df 45%,#56616d 70%,#161b22);clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);border-radius:4px}.kg-imax-wheel>i:nth-child(1){transform:translateX(-50%) rotate(0deg)}.kg-imax-wheel>i:nth-child(2){transform:translateX(-50%) rotate(60deg)}.kg-imax-wheel>i:nth-child(3){transform:translateX(-50%) rotate(120deg)}.kg-imax-wheel>i:nth-child(4){transform:translateX(-50%) rotate(180deg)}.kg-imax-wheel>i:nth-child(5){transform:translateX(-50%) rotate(240deg)}.kg-imax-wheel>i:nth-child(6){transform:translateX(-50%) rotate(300deg)}.kg-imax-wheel>b{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:28%;aspect-ratio:1;transform:translate(-50%,-50%);border:2px solid #6d7783;border-radius:50%;background:radial-gradient(circle at 35% 30%,#596575,#10151d 65%);box-shadow:0 0 10px #000;color:#ffd477;font-size:6px;font-weight:900}.kg-imax-takeup .kg-imax-wheel>b{color:#6af0bd}.kg-imax-spool-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c4b69b}.kg-imax-supply .kg-imax-spool-label{color:#f5c260}.kg-imax-takeup .kg-imax-spool-label{color:#6be0b2}.kg-imax-gate{position:relative;min-width:0;overflow:hidden;border:1px solid #55401c;border-radius:9px;background:#050608;box-shadow:0 0 16px #ffb8301c}.kg-imax-gate-label,.kg-imax-gate-foot{padding:4px 6px;font-size:6px}.kg-imax-gate-label{color:#f5c260;background:#111}.kg-imax-gate-foot{color:#aa9c80;background:#090a0d}.kg-imax-window{height:132px!important;-webkit-mask-image:none!important;mask-image:none!important;background:linear-gradient(#000,#101217 50%,#000)}.kg-imax-window .kg-reel-run{gap:10px;padding-left:8px}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{box-sizing:border-box;flex:0 0 80px;width:80px!important;min-width:80px;max-width:80px;height:112px!important;min-height:112px;max-height:112px;border-radius:4px}.kg-imax-window .kg-reel-frame{width:94px;height:128px;border-radius:5px;box-shadow:0 0 18px #ffb83055,inset 0 0 12px #ffb83022}.kg-imax-slate{position:relative;z-index:2;padding:8px 10px 9px;border-top:1px solid #ffffff12;background:linear-gradient(#14151a,#090a0d)}.kg-imax-titleline{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#d6ab5c;font-size:8px}.kg-imax-rating{flex:none;padding:2px 6px;border-radius:5px;background:#1c1710;color:#ffcb5b}.kg-imax-slate h3{margin:3px 0;color:#fff;font:700 17px/1.2 Georgia,serif;letter-spacing:.01em}.kg-imax-subtitle{color:#d6b66c;font-size:8px}.kg-imax-slate p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:4px 0 0;color:#c6c2bc;font:10px/1.4 system-ui,sans-serif}.kg-imax-controls{position:relative;z-index:2;display:flex;align-items:center;gap:6px;padding:6px 10px;border-top:1px solid #ffffff10;color:#9c9589;font-size:7px}.kg-imax-led{flex:none;width:6px;height:6px;border-radius:50%;background:#616161}.kg-imax-stage.is-spinning .kg-imax-led{background:#ffc351;box-shadow:0 0 8px #ffc351;animation:kgImxPulse .8s infinite alternate}.kg-imax-stage:has(.kg-reel-run.fast) .kg-imax-supply .kg-imax-wheel,.kg-imax-stage:has(.kg-reel-run .kgr-cell.spin) .kg-imax-supply .kg-imax-wheel{animation:kgImxSpinCCW 1.1s linear infinite}.kg-imax-stage:has(.kg-reel-run.fast) .kg-imax-takeup .kg-imax-wheel,.kg-imax-stage:has(.kg-reel-run .kgr-cell.spin) .kg-imax-takeup .kg-imax-wheel{animation:kgImxSpinCW 1.1s linear infinite}.kg-imax-stage.is-spinning .kg-imax-supply .kg-imax-wheel{animation:kgImxSpinCCW 1.1s linear infinite}.kg-imax-stage.is-spinning .kg-imax-takeup .kg-imax-wheel{animation:kgImxSpinCW 1.1s linear infinite}.kg-imax-stage.is-spinning [data-imax-status]{color:#ffd16e}.kg-imax-controls button{margin-left:auto;padding:4px 7px;border:1px solid #9b722a;border-radius:5px;background:#2a2113;color:#ffd477;font-family:inherit;font-size:7px;font-weight:700;cursor:pointer}.kg-imax-stage.is-spinning .kg-imax-window .film-cell{opacity:.95;filter:brightness(1.08)}@keyframes kgImxSpinCW{to{transform:rotate(360deg)}}@keyframes kgImxSpinCCW{from{transform:rotate(360deg)}to{transform:rotate(0)}}@keyframes kgImxPulse{to{opacity:.5}}@media(prefers-reduced-motion:reduce){.kg-imax-stage.is-spinning .kg-imax-wheel,.kg-imax-stage.is-spinning .kg-imax-led{animation:none!important}}`;
  document.head.appendChild(style);
  const ticketStyle=document.createElement("style");ticketStyle.id="kg-gold-ticket-style";
  ticketStyle.textContent=`.kg-ticket-mode{width:100%}.kg-ticket{--gold:#f2ca50;position:relative;isolation:isolate;overflow:hidden;margin:8px 0;border:1px solid #806a2a;border-radius:12px;background:radial-gradient(ellipse at 82% 94%,#6e351b66,transparent 40%),linear-gradient(135deg,#171923 0%,#24232a 52%,#291d1b 100%);box-shadow:inset 0 0 0 3px #d4af371c,inset 0 1px 18px #f2ca5013,0 18px 38px #0009;color:#eee8d8;font:500 11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.kg-ticket:before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(115deg,transparent 15%,#f2ca5008 40%,#fff2 50%,#f2ca500a 57%,transparent 82%);background-size:220% 100%;animation:kgTicketFoil 8s ease-in-out infinite}.kg-ticket-top{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #d4af3733;color:#e4c85b;font-size:9px;font-weight:800;letter-spacing:.13em}.kg-ticket-top i{color:#fff3}.kg-ticket-edition{padding:5px 8px;border:1px solid #d4af3790;background:linear-gradient(120deg,#b98e24,#f2d76a,#9a731a);color:#211b0d;text-align:center}.kg-ticket-body{display:grid;grid-template-columns:minmax(100px,31%) minmax(0,1fr);gap:14px;padding:14px}.kg-ticket-poster{position:relative;overflow:hidden;min-height:200px;max-height:310px;border:1px solid #d4af3777;border-radius:5px;background:#11131b;box-shadow:0 8px 20px #0008}.kg-ticket-poster img{display:block;width:100%;height:100%;min-height:200px;max-height:310px;object-fit:cover}.kg-ticket-poster>span{position:absolute;bottom:0;left:0;right:0;padding:5px;background:linear-gradient(transparent,#090a0ddd);color:#efd26b;font-size:8px;letter-spacing:.1em}.kg-ticket-poster>span b{color:#fff7}.kg-ticket-no-poster{display:grid;place-items:center;height:100%;min-height:200px;color:#d4af37;font-size:12px;font-weight:bold;text-align:center;letter-spacing:.12em}.kg-ticket-info{min-width:0;display:flex;flex-direction:column;justify-content:center}.kg-ticket-kicker{color:#e2c65e;font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.kg-ticket-kicker span{color:#938665}.kg-ticket-info h2{margin:9px 0 2px;color:#f4d253;font:700 clamp(21px,5vw,36px)/1.07 Georgia,'Times New Roman',serif;letter-spacing:.035em;text-transform:uppercase;text-shadow:0 2px 0 #4d3710,0 0 15px #f2ca5022}.kg-ticket-original{color:#d5c9a5;font:italic 12px/1.5 Georgia,serif}.kg-ticket-director{margin-top:8px;color:#f0d677;font-size:9px;letter-spacing:.04em}.kg-ticket-synopsis{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin:10px 0;color:#c4c0b8;font:11px/1.55 system-ui,sans-serif}.kg-ticket-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:4px;padding:9px;border:1px solid #d4af3725;background:#10131c99}.kg-ticket-stats span{display:flex;flex-direction:column;gap:3px;min-width:0}.kg-ticket-stats small,.kg-ticket-seat small{color:#a99b75;font-size:7px;letter-spacing:.12em}.kg-ticket-stats b{overflow:hidden;color:#f0d36a;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.kg-ticket-award{margin-top:8px;color:#f0d36a;font-size:8px;font-weight:bold;letter-spacing:.1em}.kg-ticket-seam{display:flex;align-items:center;gap:8px;padding:7px 14px;border-top:1px dashed #d4af3766;color:#a99967;font-size:7px;letter-spacing:.17em}.kg-ticket-seam span:first-child,.kg-ticket-seam span:last-child{height:1px;flex:1;background:linear-gradient(90deg,transparent,#d4af3766)}.kg-ticket-stub{display:grid;grid-template-columns:1fr minmax(105px,38%) auto;align-items:center;gap:10px;padding:9px 14px 13px}.kg-ticket-seat{display:flex;align-items:center;gap:7px}.kg-ticket-seat b{color:#f3d254;font-size:11px}.kg-ticket-code{min-width:0;text-align:center}.kg-ticket-code>span,.kg-ticket-code>small{display:block;overflow:hidden;color:#d8c77f;font-size:7px;letter-spacing:.13em;text-overflow:ellipsis;white-space:nowrap}.kg-ticket-bars{height:30px;margin:3px 0;background:repeating-linear-gradient(90deg,#f4d65b 0 2px,transparent 2px 4px,#f4d65b 4px 5px,transparent 5px 8px,#f4d65b 8px 11px,transparent 11px 13px);opacity:.88}.kg-ticket-tear{padding:9px 10px;border:1px solid #e5c44b;border-radius:3px;background:linear-gradient(110deg,#c99c2d,#f4d65b,#d0a633);color:#201a0a;font:700 8px/1.3 ui-monospace,monospace;letter-spacing:.08em;cursor:pointer}.kg-ticket-tear span{font-size:13px}.kg-ticket-tear[aria-pressed=true]{background:#29291c;color:#d5c26e}.kg-ticket-foot{display:flex;justify-content:space-between;gap:10px;padding:8px 14px;border-top:1px solid #d4af3725;color:#928767;font-size:7px;letter-spacing:.13em}.kg-ticket-valid{color:#d5ce58}.kg-ticket.is-torn .kg-ticket-stub{opacity:.55;filter:grayscale(.5)}.kg-ticket.is-torn .kg-ticket-valid{color:#f28b82}.kg-ticket.is-torn .kg-ticket-valid:after{content:" · ПОГАШЕН"}@keyframes kgTicketFoil{0%,72%,100%{background-position:180% 0}84%{background-position:-60% 0}}@media(max-width:480px){.kg-ticket-body{grid-template-columns:94px minmax(0,1fr);gap:10px;padding:10px}.kg-ticket-poster,.kg-ticket-poster img{min-height:140px;max-height:220px}.kg-ticket-info h2{margin-top:5px;font-size:21px}.kg-ticket-original{font-size:10px}.kg-ticket-synopsis{-webkit-line-clamp:2;margin:6px 0;font-size:10px}.kg-ticket-stats{gap:3px;padding:6px}.kg-ticket-stats small{font-size:6px}.kg-ticket-stats b{font-size:8px}.kg-ticket-stub{grid-template-columns:1fr minmax(90px,35%);gap:6px;padding:8px 10px 10px}.kg-ticket-seat{gap:4px}.kg-ticket-seat small{font-size:6px}.kg-ticket-seat b{font-size:9px}.kg-ticket-tear{grid-column:1/-1;padding:7px}.kg-ticket-top,.kg-ticket-foot{padding-left:10px;padding-right:10px;font-size:7px}}`;
  document.head.appendChild(ticketStyle);
  const deckStyle=document.createElement("style");deckStyle.id="kg-ticket-deck-style";deckStyle.textContent=`.kg-ticket-shuffle{position:relative;display:flex;min-height:300px;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px 12px 14px;overflow:hidden;border-radius:12px;background:radial-gradient(ellipse at 50% 45%,#3a2a17 0,#15141a 65%,#0b0b10 100%)}.kg-ticket-stack{position:relative;width:min(100%,640px);isolation:isolate}.kg-ticket-stack-layer{position:absolute;inset:0;border:1px solid #bb963d;border-radius:12px;background:linear-gradient(135deg,#30251a,#1d1e27 55%,#39251b);box-shadow:0 12px 30px #0009;pointer-events:none}.kg-ticket-stack-layer .kg-ticket{height:100%;margin:0;opacity:.72;filter:brightness(.72) saturate(.82)}.kg-ticket-stack-layer.layer-1{transform:translate(9px,8px) rotate(2.2deg)}.kg-ticket-stack-layer.layer-2{transform:translate(-7px,5px) rotate(-1.7deg)}.kg-ticket-stack-layer.layer-3{transform:translate(3px,-3px) rotate(.8deg)}.kg-ticket-face{position:relative;z-index:2;transform-origin:center;will-change:transform,opacity}.kg-ticket-face .kg-ticket{margin:0}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-1{animation:kgTicketLayerA .55s ease-in-out infinite alternate}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-2{animation:kgTicketLayerB .62s ease-in-out infinite alternate}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-3{animation:kgTicketLayerC .48s ease-in-out infinite alternate}.kg-ticket-face.ticket-flip{animation:kgTicketFlip .32s cubic-bezier(.2,.75,.25,1)}.kg-ticket-shuffle.is-landed .kg-ticket-face{animation:kgTicketLand .5s ease-out}.kg-ticket-shuffle-status{color:#f2d66b;font:700 10px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;text-align:center}.kg-ticket-skip{padding:7px 12px;border:1px solid #b98e38;border-radius:6px;background:#251d12;color:#f4d76a;font:700 9px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}.kg-ticket-shuffle.is-landed .kg-ticket-skip{display:none}@keyframes kgTicketLayerA{to{transform:translate(17px,13px) rotate(7deg)}}@keyframes kgTicketLayerB{to{transform:translate(-15px,12px) rotate(-6deg)}}@keyframes kgTicketLayerC{to{transform:translate(8px,-8px) rotate(4deg)}}@keyframes kgTicketFlip{50%{transform:translateY(-8px) rotate(1.5deg);opacity:.7}}@keyframes kgTicketLand{50%{transform:scale(1.025)}100%{transform:scale(1)}}@media(max-width:480px){.kg-ticket-shuffle{min-height:230px;padding:12px 8px}.kg-ticket-stack-layer.layer-1{transform:translate(5px,5px) rotate(2deg)}.kg-ticket-stack-layer.layer-2{transform:translate(-4px,4px) rotate(-1.5deg)}}@media(prefers-reduced-motion:reduce){.kg-ticket-shuffle *{animation-duration:.01ms!important;animation-iteration-count:1!important}}`;
  document.head.appendChild(deckStyle);
  const imaxCleanStyle=document.createElement("style");imaxCleanStyle.id="kg-imax-clean-style";
  imaxCleanStyle.textContent=`.kg-imax-stage{--kg-imax-wheel-size:112px}.kg-imax-machine{grid-template-columns:var(--kg-imax-wheel-size) minmax(0,1fr) var(--kg-imax-wheel-size);gap:7px;padding:8px 6px}.kg-imax-spool{display:block;width:var(--kg-imax-wheel-size);height:var(--kg-imax-wheel-size);min-width:0}.kg-imax-wheel{box-sizing:border-box;width:100%;height:100%;aspect-ratio:1}.kg-imax-wheel>b{font-size:0}.kg-imax-gate{align-self:center;overflow:hidden;border:0;border-radius:0;background:transparent;box-shadow:none}.kg-imax-window{height:var(--kg-imax-wheel-size)!important;min-height:0;display:block;border:0;background:transparent;-webkit-mask-image:none!important;mask-image:none!important}.kg-imax-window .kg-reel-run{gap:10px;padding-left:8px}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{position:relative!important;box-sizing:border-box!important;display:block!important;flex:0 0 80px!important;width:80px!important;min-width:80px!important;max-width:80px!important;height:var(--kg-imax-wheel-size)!important;min-height:var(--kg-imax-wheel-size)!important;max-height:var(--kg-imax-wheel-size)!important;overflow:hidden!important;object-fit:cover;border-radius:3px}.kg-imax-window .film-cell>img,.kg-imax-window .kgr-cell>img{position:absolute!important;inset:0!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;min-height:0!important;max-height:none!important;object-fit:cover!important;border-radius:0!important}.kg-imax-window .film-cell>.nop,.kg-imax-window .kgr-cell>.nop{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;width:100%!important;height:100%!important;padding:4px!important;text-align:center!important}.kg-imax-window .film-cell .yr,.kg-imax-window .kgr-cell .yr{display:none!important}.kg-imax-window .film-cell.chosen,.kg-imax-window .kgr-cell.chosen{transform:none!important;box-shadow:none!important}.kg-imax-window .kg-reel-frame{box-sizing:border-box;width:94px;height:var(--kg-imax-wheel-size);border-radius:4px}.kg-imax-controls{min-height:7px;padding:2px 6px;border-top:0;background:transparent}.kg-imax-controls>[data-imax-status]{font-size:0}.kg-imax-controls button{font-size:7px}.kg-imax-stage .kg-imax-head,.kg-imax-stage .kg-imax-gate-label,.kg-imax-stage .kg-imax-gate-foot,.kg-imax-stage .kg-imax-spool-label,.kg-imax-stage .kg-imax-slate{display:none!important}@media(max-width:600px){.kg-imax-stage{--kg-imax-wheel-size:clamp(92px,25vw,104px);border-radius:12px}.kg-imax-machine{grid-template-columns:var(--kg-imax-wheel-size) minmax(0,1fr) var(--kg-imax-wheel-size);gap:3px;padding:6px 2px}.kg-imax-spool{width:var(--kg-imax-wheel-size);height:var(--kg-imax-wheel-size)}.kg-imax-window{height:var(--kg-imax-wheel-size)!important}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{height:var(--kg-imax-wheel-size)!important;min-height:var(--kg-imax-wheel-size)!important;max-height:var(--kg-imax-wheel-size)!important;background:transparent!important;border:0!important}.kg-imax-window .film-cell>img,.kg-imax-window .kgr-cell>img{inset:auto!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:calc(var(--kg-imax-wheel-size)*.69)!important;height:var(--kg-imax-wheel-size)!important;min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;object-fit:cover!important;border-radius:3px!important}.kg-imax-window .film-cell>.nop,.kg-imax-window .kgr-cell>.nop{inset:auto!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:calc(var(--kg-imax-wheel-size)*.69)!important;height:var(--kg-imax-wheel-size)!important;background:#221e26;border:1px solid #493817}.kg-imax-window .kg-reel-frame{box-sizing:border-box;width:calc(var(--kg-imax-wheel-size)*.79);height:var(--kg-imax-wheel-size)}.kg-imax-machine .kg-imax-gate{min-width:0}.kg-imax-controls{padding:2px 5px}}@media(max-width:370px){.kg-imax-stage{--kg-imax-wheel-size:84px}}`;
  document.head.appendChild(imaxCleanStyle);
  const syncSpoolMotion=stage=>{
    if(!stage?.isConnected)return;
    const moving=!!stage.querySelector(".kgr-run.fast,.kg-reel-run.fast,.kgr-cell.spin,.kgr-cell.spinning,.film-cell.spinning");
    stage.classList.toggle("is-spinning",moving);
  };
  const reelMotionObserver=new MutationObserver(records=>{
    const stages=new Set();
    for(const record of records){
      const node=record.target;
      if(node instanceof Element){if(!node.matches(".kg-imax-stage")){const stage=node.closest(".kg-imax-stage");if(stage)stages.add(stage);}}
      for(const added of record.addedNodes||[]){if(!(added instanceof Element))continue;if(added.matches(".kg-imax-stage"))stages.add(added);added.querySelectorAll?.(".kg-imax-stage").forEach(stage=>stages.add(stage));const parentStage=added.closest(".kg-imax-stage");if(parentStage)stages.add(parentStage);}
    }
    stages.forEach(syncSpoolMotion);
  });
  reelMotionObserver.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:["class"],childList:true});
  const activeSpins=new WeakMap();
  function spin(options={}){
    const run=options.run;
    if(!run)return ()=>{};
    activeSpins.get(run)?.();
    const cells=[...run.children],frame=options.frame;
    const startX=Number(options.startX)||0,endX=Number(options.endX)||0;
    const duration=Math.max(1,Number(options.duration)||1800),stepWidth=Math.max(1,Number(options.stepWidth)||90);
    const chosenIndex=Number(options.chosenIndex)||0;
    const fastClass=options.fastClass||"fast",spinningClass=options.spinningClass||"spinning",root=options.root;
    let raf=0,done=false,lastStep=-1;
    const finish=cancelled=>{
      if(done)return;
      done=true;
      if(raf)cancelAnimationFrame(raf);
      run.classList.remove(fastClass);
      root?.classList.remove(options.rootSpinningClass||"is-spinning");
      cells.forEach((cell,index)=>{
        cell.classList.remove(spinningClass);
        cell.classList.toggle("chosen",!cancelled&&index===chosenIndex);
      });
      if(!cancelled&&frame){frame.classList.remove("hit");void frame.offsetWidth;frame.classList.add("hit");}
      activeSpins.delete(run);
      if(cancelled)options.onCancel?.();else options.onFinish?.();
    };
    const cancel=()=>finish(true);
    activeSpins.set(run,cancel);
    if(options.reducedMotion){run.style.transform=`translateX(${-endX}px)`;finish(false);return cancel;}
    root?.classList.add(options.rootSpinningClass||"is-spinning");
    cells.forEach(cell=>cell.classList.add(spinningClass));
    run.style.transform=`translateX(${-startX}px)`;
    run.classList.add(fastClass);
    const started=performance.now();
    const step=now=>{
      if(done)return;
      const rawProgress=Math.min(1,(now-started)/duration);
      const progress=Math.max(0,Math.min(1,options.mapProgress?options.mapProgress(rawProgress):rawProgress));
      const eased=1-Math.pow(1-progress,4);
      const x=startX+(endX-startX)*eased;
      const remaining=endX-x;
      run.style.transform=`translateX(${-x}px)`;
      if(progress>.4)run.classList.remove(fastClass);
      const currentStep=Math.round((x-startX)/stepWidth);
      if(currentStep!==lastStep){lastStep=currentStep;options.onStep?.(currentStep,progress,x,remaining);}
      options.onProgress?.(progress,x,remaining);
      if(progress<1&&remaining>=.75){raf=requestAnimationFrame(step);return;}
      run.style.transform=`translateX(${-endX}px)`;
      finish(false);
    };
    raf=requestAnimationFrame(step);
    return cancel;
  }
  function updateIMAX(root,film,meta={}){
    if(!root||!film)return;
    const title=film.title||film.original_title||"Фильм";
    const year=(film.release_date||"").slice(0,4);
    const set=(key,value)=>{const el=root.querySelector(`[data-imax-${key}]`);if(el&&value!==undefined)el.textContent=String(value);};
    set("title",title);
    set("country",meta.country||meta.subtitle||"КИНОПОИСК");
    set("rating",Number(film.vote_average)?Number(film.vote_average).toFixed(1):"—");
    set("description",film.overview||"Описание фильма пока недоступно.");
    set("subtitle",[film.original_title&&film.original_title!==title?film.original_title:"",year,meta.runtime||""].filter(Boolean).join(" · ")||"TMDB · фильмография страны");
    set("state",meta.state||"ПРОЕКЦИЯ ИДЁТ");
  }

  const projectionStyle=document.createElement("style");projectionStyle.id="kg-projection-track-style";projectionStyle.textContent=`.kg-projection{--kgp-gold:#f2ca50;position:relative;overflow:hidden;padding:10px;border:1px solid #8c7138;border-radius:14px;background:radial-gradient(ellipse at 50% 48%,#553b1d66,transparent 55%),linear-gradient(145deg,#10131c,#191923 60%,#251a15);color:#eee6ce;box-shadow:inset 0 0 24px #f2ca5010,0 12px 32px #0008;font:10px/1.4 ui-monospace,SFMono-Regular,monospace}.kg-projection-top,.kg-projection-telemetry{display:flex;align-items:center;justify-content:space-between;gap:5px}.kg-projection-top{padding:3px 2px 8px;color:#efd163;font-size:8px;letter-spacing:.08em}.kg-projection-top>span:first-child{display:flex;align-items:center;gap:5px}.kg-projection-top i{width:6px;height:6px;border-radius:50%;background:#efc84f;box-shadow:0 0 8px #f2ca50}.kg-projection-top b{color:#f6df98}.kg-projection-telemetry{padding:6px 7px;border:1px solid #f2ca5022;border-radius:5px;background:#0b0d13;color:#ae9d6d;font-size:7px;letter-spacing:.08em}.kg-projection-machine{display:grid;grid-template-columns:11px minmax(0,1fr) 11px;gap:5px;align-items:stretch;margin:9px auto 7px;width:min(100%,355px);height:clamp(280px,88vw,370px);padding:8px;border:1px solid #b89650;border-radius:9px;background:linear-gradient(90deg,#17191f,#34302a 8%,#15161c 18%,#101116 50%,#17191f 82%,#342d22 92%,#17191f);box-shadow:0 10px 24px #000a,inset 0 0 0 3px #0008}.kg-projection-perfs{display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:4px 0}.kg-projection-perfs i{display:block;width:8px;height:13px;border-radius:2px;background:linear-gradient(135deg,#8a8067,#27272b);box-shadow:inset 0 1px 2px #000}.kg-projection-window{position:relative;overflow:hidden;border:2px solid #a98948;border-radius:5px;background:#080a0f;box-shadow:0 0 22px #f2ca5019}.kg-projection-image{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;background:#11131b}.kg-projection-image img{width:100%;height:100%;object-fit:cover;filter:saturate(.86) contrast(1.04)}.kg-projection-image-shade{position:absolute;inset:0;background:linear-gradient(0deg,#090b10dd,transparent 44%,#090b1040)}.kg-projection-beam{position:absolute;z-index:2;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 10%,#ffe8a00d 47%,#fff2 50%,#f2ca5010 54%,transparent 90%);mix-blend-mode:screen;animation:kgpBeam 3.2s ease-in-out infinite}.kg-projection-frame-meta{position:absolute;z-index:3;right:7px;bottom:7px;left:7px;display:flex;justify-content:space-between;gap:4px;color:#f2d771;font-size:8px;text-shadow:0 1px 4px #000}.kg-projection-frame-meta b{padding:2px 5px;border-radius:3px;background:#0b0d13cc}.kg-projection-empty{display:grid;place-items:center;height:100%;padding:15px;color:#ddbf66;text-align:center;font-weight:bold;letter-spacing:.12em}.kg-projection-caption{display:grid;gap:2px;padding:7px 3px 2px;border-top:1px solid #f2ca5024}.kg-projection-caption small{overflow:hidden;color:#d8b94e;font-size:7px;letter-spacing:.1em;text-overflow:ellipsis;white-space:nowrap}.kg-projection-caption strong{overflow:hidden;color:#f5e5b4;font:600 17px/1.2 Georgia,serif;text-overflow:ellipsis;white-space:nowrap}.kg-projection-caption span{overflow:hidden;color:#a9a298;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.kg-projection.is-running .kg-projection-window{animation:kgpFlicker .12s steps(2,end) infinite}.kg-projection.is-running .kg-projection-perfs i{animation:kgpPerf .18s linear infinite}.kg-projection-flash{animation:kgpFrame .18s ease-out}@keyframes kgpBeam{0%,100%{transform:translateX(-40%);opacity:.4}50%{transform:translateX(40%);opacity:.9}}@keyframes kgpFlicker{50%{filter:brightness(1.2)}}@keyframes kgpPerf{to{filter:brightness(1.6)}}@keyframes kgpFrame{50%{transform:scale(1.025);filter:brightness(1.3)}}@media(prefers-reduced-motion:reduce){.kg-projection *{animation-duration:.01ms!important;animation-iteration-count:1!important}}`;
  document.head.appendChild(projectionStyle);
  window.KGCinemaReel=Object.freeze({render,spin,updateIMAX,renderTicket,presentTicket,prepareTicket,animateTicketDeck,isTicketMode:()=>reelMode()==="ticket",isCassetteMode,isProjectionMode,mountCassetteDeck,spinCassetteDeck,mountProjectionTrack,spinProjectionTrack});
})();
