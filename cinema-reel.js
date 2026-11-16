/* Shared visual markup for every film reel in Moven: Explore. */
(function(){
  // The ticket, projection and cassette searches share one slower pacing across
  // the globe, collections, mood and Oscar screens.
  const searchPaceFactor=1.35;
  function emitReelMotion(level, position, frame, continuous = true, phase) {
    document.dispatchEvent(new CustomEvent("kg:reel-motion", {
      detail: {level, position, frame, continuous, phase}
    }));
  }
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
  const reelMode=()=>{try{const mode=JSON.parse(localStorage.getItem("reelStyle")||'"35mm"');return ["cassette","projection"].includes(mode)?mode:"35mm";}catch{return"35mm";}};
  const ticketEscape=html;
  function ticketMarkup(film={},meta={}){
    const title=film.title||film.original_title||"Фильм из Moven: Explore",original=film.original_title&&film.original_title!==title?film.original_title:"ПРЕМЬЕРНЫЙ СЕАНС";
    const year=(film.release_date||"").slice(0,4)||"—",rating=Number(film.vote_average)>0?Number(film.vote_average).toFixed(1):"—";
    const poster=film.poster_path?`https://image.tmdb.org/t/p/w500${film.poster_path}`:"";
    const runtime=film.runtime?`${film.runtime} МИН`:(meta.runtime||"СЕАНС Moven: Explore"),country=meta.country||film._cc||"МИРОВОЙ КИНЕМАТОГРАФ";
    const overview=film.overview||"Билет в следующий фильм уже найден. Откройте карточку фильма, чтобы посмотреть описание и трейлер.";
    const serial=`KG-${String(film.id||"000000").replace(/\D/g,"").slice(-6).padStart(6,"0")}-${year}`;
    return `<section class="kg-ticket" data-kg-ticket-card><div class="kg-ticket-top"><span>Moven: Explore <i>·</i> ПРЕМЬЕРНЫЙ АРХИВ</span><span class="kg-ticket-edition">ЗОЛОТОЙ БИЛЕТ</span></div>
      <div class="kg-ticket-body"><div class="kg-ticket-poster">${poster?`<img src="${poster}" alt="Постер фильма «${ticketEscape(title)}»" loading="lazy">`:`<div class="kg-ticket-no-poster">Moven: Explore<br>PREMIÈRE</div>`}<span>${year} <b>·</b> TMDB</span></div>
      <div class="kg-ticket-info"><div class="kg-ticket-kicker">${ticketEscape(country)} <span>·</span> ${ticketEscape(year)}</div><h2>${ticketEscape(title)}</h2><div class="kg-ticket-original">${ticketEscape(original)}</div>${film.director?`<div class="kg-ticket-director">Режиссёр · ${ticketEscape(film.director)}</div>`:""}<p class="kg-ticket-synopsis">${ticketEscape(overview)}</p><div class="kg-ticket-stats"><span><small>TMDB</small><b>★ ${rating} / 10</b></span><span><small>СЕАНС</small><b>${ticketEscape(runtime)}</b></span><span><small>АРХИВ</small><b>№ ${ticketEscape(String(film.id||"—"))}</b></span></div>${film.award?`<div class="kg-ticket-award">✦ ${ticketEscape(film.award)}</div>`:""}</div></div>
      <div class="kg-ticket-foot"><span class="kg-ticket-code-inline"><i class="kg-ticket-bars" aria-hidden="true"></i><small>${serial}</small></span><span class="kg-ticket-valid">АРХИВ Moven: Explore</span></div></section>`;
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
  function animateTicketDeck(container,sequence,winner,options={}){
    if(typeof container==="string")container=document.querySelector(container);
    const stage=container?.querySelector("[data-kg-ticket-shuffle]"),face=container?.querySelector("[data-kg-ticket-face]"),status=container?.querySelector("[data-kg-ticket-shuffle-status]");
    if(!stage||!face)return Promise.resolve(false);
    const items=(sequence||[]).filter(Boolean),ordered=winner?[...items.filter(f=>String(f?.id)!==String(winner.id)),winner]:(items.length?items:[]),ticketLimit=15,frames=ordered.length>ticketLimit?(()=>{const reel=ordered.slice(0,-1),slots=ticketLimit-1,sampled=Array.from({length:slots},(_,i)=>reel[Math.round(i*(reel.length-1)/Math.max(1,slots-1))]);return [...sampled,ordered[ordered.length-1]];})():ordered,baseDuration=Math.max(6800,Number(options.duration)||6800)*searchPaceFactor,duration=baseDuration*Math.max(1,frames.length-1)/Math.max(1,ordered.length-1)*2;
    stage.classList.add("is-shuffling");stage.classList.remove("is-landed");
    const layers=[...stage.querySelectorAll("[data-kg-ticket-layer]")];
    const fillLayers=index=>layers.forEach((layer,depth)=>{const item=frames[Math.max(0,index-depth-1)]||frames[0];layer.innerHTML=ticketMarkup(item,options.meta||{});});
    const show=(film,index)=>{fillLayers(index);face.innerHTML=ticketMarkup(film,options.meta||{});if(status)status.textContent=`Билет ${String(index+1).padStart(2,"0")} · ${String(frames.length).padStart(2,"0")}`;options.onFrame?.(film,index,frames.length);};
    const land=()=>{emitReelMotion(0);fillLayers(Math.max(0,frames.length-1));if(winner)face.innerHTML=ticketMarkup(winner,options.meta||{});stage.classList.remove("is-shuffling");stage.classList.add("is-landed");if(status)status.textContent="Ваш фильм найден";return true;};
    if(options.reducedMotion||frames.length<2)return Promise.resolve(land());
    return new Promise(resolve=>{
      let done=false,raf=0;
      const finish = ok => {
        if (done) return;
        done = true;
        if (raf) cancelAnimationFrame(raf);
        face.classList.remove("ticket-fly-out", "ticket-land-in");
        if (ok) {
          land();
        } else {
          emitReelMotion(0);
          stage.classList.remove("is-shuffling");
        }
        resolve(ok);
      };
      const interrupt=()=>!stage.isConnected||options.cancelled?.()?"cancel":(stage.dataset.skip==="true"||options.shouldSkip?.())?"skip":null;
      const wait=ms=>new Promise(doneWait=>{const start=performance.now(),tick=now=>{const reason=interrupt();if(reason){doneWait(reason);return;}if(now-start>=ms){doneWait("elapsed");return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);});
      const weights=frames.slice(1).map((_,i)=>.68+1.15*Math.pow((i+1)/Math.max(1,frames.length-1),2)),weightTotal=weights.reduce((sum,value)=>sum+value,0);
      const run=async()=>{
        show(frames[0],0);
        for(let next=1;next<frames.length;next++){
          const reason=interrupt();if(reason){finish(reason==="skip");return;}
          const stepMs=duration*(weights[next-1]/weightTotal),outMs=stepMs*.43,inMs=stepMs*.51;
          stage.style.setProperty("--kg-ticket-out-ms",`${outMs}ms`);stage.style.setProperty("--kg-ticket-in-ms",`${inMs}ms`);
          face.classList.remove("ticket-land-in","ticket-fly-out");void face.offsetWidth;face.classList.add("ticket-fly-out");
          const level = 1 - (next - 1) / frames.length;
          emitReelMotion(level, next, next * 2 - 1, false, "fly");
          const outResult=await wait(outMs);if(outResult!=="elapsed"){finish(outResult==="skip");return;}
          show(frames[next], next);
          face.classList.remove("ticket-fly-out");
          face.classList.add("ticket-land-in");
          emitReelMotion(level * .55, next, next * 2, false, "land");
          const landResult=await wait(inMs);if(landResult!=="elapsed"){finish(landResult==="skip");return;}
          face.classList.remove("ticket-land-in");
          if (next === frames.length - 1) break;
          const holdResult=await wait(Math.max(0,stepMs-outMs-inMs));if(holdResult!=="elapsed"){finish(holdResult==="skip");return;}
        }
        finish(true);
      };
      run().catch(()=>finish(false));
    });
  }
  document.addEventListener("click",event=>{
    const skip=event.target.closest("[data-kg-ticket-skip]");if(skip){const stage=skip.closest("[data-kg-ticket-shuffle]");if(stage)stage.dataset.skip="true";}
  });
  function reelHeading(mode, counter = "") {
    return `<div class="kg-reel-heading"><span class="kg-reel-mode">${html(uiText(mode))}</span>${counter}</div>`;
  }
  const cassetteImage=path=>path?`https://image.tmdb.org/t/p/w500${path}`:"";
  function renderCassetteDeck(){
    return `<section class="kg-cassette-deck" data-kg-cassette-deck>
      ${reelHeading("Кассетная дека · 3D Cover Flow", '<b class="kg-reel-count" data-kg-cassette-counter>00 / 00</b>')}
      <div class="kg-cassette-stage"><div class="kg-cassette-coverflow" data-kg-cassette-track aria-label="Анимация поиска фильмов"><div class="kg-cassette-ambient"></div></div><div class="kg-cassette-focus" aria-hidden="true"></div></div>
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
    const state={films:list,index:Math.max(0,indexById.get(String(activeFilm?.id??activeFilm?.title))||0),options,rolling:false};
    cassetteStates.set(root,state);
    const track=root.querySelector("[data-kg-cassette-track]");if(!track)return null;
    const ambient=track.querySelector(".kg-cassette-ambient");track.replaceChildren(...(ambient?[ambient]:[]));
    const filmTitle=f=>f?.title||f?.original_title||"Фильм";
    const card=(f,i)=>`<div class="kg-cassette-card" data-cassette-index="${i}" aria-hidden="true"><span class="kg-cassette-card-poster">${f.poster_path?`<img loading="eager" alt="" src="${cassetteImage(f.poster_path)}">`:`<b>${html(filmTitle(f))}</b>`}<span class="kg-cassette-card-caption"><b>${html(filmTitle(f))}</b><i>${html((f.release_date||"").slice(0,4))}</i></span></span></div>`;
    // Short pools repeat offscreen so a visible poster never jumps across the deck.
    const slotCount=list.length>1 ? Math.ceil(8/list.length)*list.length : list.length;
    track.insertAdjacentHTML("beforeend",Array.from({length:slotCount},(_,i)=>card(list[i%list.length],i)).join(""));
    for(const image of track.querySelectorAll("img")){
      // Keep a stable poster surface if an image is slow or unavailable.
      image.decode().then(()=>image.classList.add("is-ready"),()=>{});
    }
    const cards=[...track.querySelectorAll("[data-cassette-index]")];
    const counter=root.querySelector("[data-kg-cassette-counter]");
    if(counter&&!list.length)counter.textContent="00 / 00";
    const layout=position=>{
      if(!list.length)return;
      const total=slotCount;
      cards.forEach((el,itemIndex)=>{
        const offset=total===1?0:((itemIndex-position+total/2)%total+total)%total-total/2;
        const distance=Math.abs(offset),side=offset<0?-1:1;
        const spread=distance<=1?115*distance:distance<=2?115+(distance-1)*55:170+(distance-2)*28;
        const x=side*spread,z=60-distance*82,rotate=-side*Math.min(52,distance*44);
        const scale=Math.max(.66,1.08-distance*.18);
        const opacity=distance<=1?1-.22*distance:distance<=2?.78-(distance-1)*.4:Math.max(0,.38-(distance-2)*.25);
        if(opacity<=0){
          if(!el.hidden)el.hidden=true;
          return;
        }
        if(el.hidden)el.hidden=false;
        el.style.transform=`translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
        el.style.zIndex=String(4000-Math.round(distance*1000));
        el.style.opacity=String(opacity);
      });
    };
    const update=(index,position=index)=>{
      if(!list.length)return null;
      state.index=(index+list.length)%list.length;
      layout(position);
      const center=((position%slotCount)+slotCount)%slotCount;
      cards.forEach((el,i)=>{
        const active=i===center;
        el.classList.toggle("active",active);
        el.setAttribute("aria-current",String(active));
        el.setAttribute("aria-hidden",String(!active));
      });
      if(counter)counter.textContent=`${String(state.index+1).padStart(2,"0")} / ${String(list.length).padStart(2,"0")}`;
      return list[state.index];
    };
    update(state.index);return {root,state,update,layout,counter};
  }
  function spinCassetteDeck(container,films,sequence,winner,options={}){
    const root=typeof container==="string"?document.querySelector(container):container;
    const existing=root?.matches?.("[data-kg-cassette-deck]")?root:root?.querySelector?.("[data-kg-cassette-deck]");
    const inherited=existing?cassetteStates.get(existing)?.options||{}:{};
    const merged={...inherited,...options};
    const list=[...new Map((films||[]).filter(Boolean).map(f=>[String(f.id??f.title),f])).values()];
    const winnerIndex=list.findIndex(f=>String(f.id??f.title)===String(winner?.id??winner?.title));
    const endIndex=winnerIndex>=0?winnerIndex:0,steps=32;
    const startIndex=list.length>1?(endIndex+steps)%list.length:endIndex;
    const startFilm=list[startIndex]||winner;
    const mounted=mountCassetteDeck(container,films,startFilm,merged);if(!mounted)return Promise.resolve(false);
    // All screens use one shared cassette cadence; callers choose the film pool,
    // while the Cover Flow animation keeps the same cinematic duration.
    const state=mounted.state,duration=4600*searchPaceFactor;
    let lastPosition=startIndex;
    const isCurrent=()=>cassetteStates.get(mounted.root)===state && mounted.root.isConnected;
    const finish=landed=>{
      if(!isCurrent())return false;
      emitReelMotion(0);
      state.rolling=false;
      mounted.update(landed?endIndex:state.index,landed?startIndex-steps:Math.round(lastPosition));
      mounted.root.classList.remove("is-rolling");
      window.stopFilmReelSound?.();
      if(landed){options.onFrame?.(winner,steps);options.onFinish?.(winner);}
      return landed;
    };
    if(options.reducedMotion||state.films.length<2){return Promise.resolve(finish(true));}
    state.rolling=true;mounted.root.classList.add("is-rolling");
    window.startFilmReelSound?.();
    let last=0;
    return new Promise(resolve=>{
      const start=performance.now();const frame=now=>{
        try{
          if(!isCurrent()||options.cancelled?.()){resolve(finish(false));return;}
          if(options.shouldSkip?.()){resolve(finish(true));return;}
          const p = Math.min(1, (now - start) / duration);
          const distance = steps * (1 - (1 - p) ** 4);
          // At this point the remaining movement is below one pixel.
          if (steps - distance < .006) {
            resolve(finish(true));
            return;
          }
          const position = lastPosition = startIndex - distance;
          const n = startIndex - Math.round(position);
          mounted.layout(position);
          emitReelMotion((1 - p) ** 3, distance, n);
          if(n!==last){last=n;const index=((Math.round(position)%state.films.length)+state.films.length)%state.films.length,film=state.films[index]||winner;state.index=index;const counter=mounted.counter;if(counter)counter.textContent=`${String(index+1).padStart(2,"0")} / ${String(state.films.length).padStart(2,"0")}`;options.onFrame?.(film,n);}
          requestAnimationFrame(frame);
        }catch(error){console.error("[Moven: Explore] Cassette animation failed",error);resolve(finish(false));}
      };requestAnimationFrame(frame);
    });
  }
  const projectionStates=new WeakMap();
  const projectionPoster=path=>path?`https://image.tmdb.org/t/p/w500${path}`:"";
  function renderProjectionTrack(){
    return `<section class="kg-projection" data-kg-projection>
      ${reelHeading("Проекционный тракт · 35 мм", '<b class="kg-reel-count" data-kg-projection-counter>00 / 00</b>')}
      <div class="kg-projection-machine">
        <div class="kg-projection-window">
          <div class="kg-projection-beam"></div>
          <div class="kg-projection-image" data-kg-projection-image></div>
          <div class="kg-projection-frame-meta"><span data-kg-projection-year></span><b data-kg-projection-rating></b></div>
        </div>
        <div class="kg-projection-focus" aria-hidden="true"></div>
      </div>
      <div class="kg-projection-caption"><strong data-kg-projection-title></strong></div>
    </section>`;
  }
  function projectionRoot(container){if(typeof container==="string")container=document.querySelector(container);return container?.matches?.("[data-kg-projection]")?container:container?.querySelector?.("[data-kg-projection]");}
  function mountProjectionTrack(container,film=null,meta={}){
    const root=projectionRoot(container);if(!root)return null;
    const state=projectionStates.get(root)||{rolling:false};projectionStates.set(root,state);state.film=film;state.meta=meta;
    const title=film?.title||film?.original_title||uiText("Поиск фильма");
    const image=root.querySelector("[data-kg-projection-image]"),poster=projectionPoster(film?.poster_path);
    if(image)image.innerHTML=poster?`<img src="${poster}" alt="Постер фильма «${html(title)}»" loading="lazy"><span class="kg-projection-image-shade"></span>`:`<div class="kg-projection-empty">${html(title)}</div>`;
    const set=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value||"";};
    set("[data-kg-projection-title]",film ? title : "");
    set("[data-kg-projection-year]",(film?.release_date||"").slice(0,4));
    set("[data-kg-projection-rating]",Number(film?.vote_average)>0 ? `★ ${Number(film.vote_average).toFixed(1)}` : "");
    return {root,state};
  }
  function spinProjectionTrack(container,sequence,winner,options={}){
    const mounted=mountProjectionTrack(container,sequence?.[0]||winner,options.meta||{});if(!mounted)return Promise.resolve(false);
    const {root,state}=mounted,frames=(sequence||[]).filter(Boolean),winnerIndex=frames.findIndex(f=>String(f?.id)===String(winner?.id)),items=(winnerIndex>=0?frames.slice(0,winnerIndex+1):[...frames,...(winner?[winner]:[])]).filter(Boolean),targetItemIndex=winnerIndex>=0?winnerIndex:items.length-1,duration=Math.max(350,Number(options.duration)||3000)*searchPaceFactor,counter=root.querySelector("[data-kg-projection-counter]"),img=root.querySelector("[data-kg-projection-image]");
    const land=()=>{emitReelMotion(0);mountProjectionTrack(root,winner,options.meta||{});root.classList.remove("is-running");state.rolling=false;options.onFrame?.(winner,items.length);return true;};
    if(options.reducedMotion||items.length<2)return Promise.resolve(land());
    state.rolling=true;root.classList.add("is-running");
    // Reverse repeated segments so the strip physically travels down while
    // presenting the selection sequence in its original order.
    const loops=4,total=items.length*(loops+1),stripItems=Array.from({length:loops+1},()=>items.slice().reverse()).flat();
    const startIndex=loops*items.length+items.length-1,targetIndex=items.length-1-targetItemIndex;
    if(img){img.innerHTML=`<div class="kg-projection-strip" data-kg-projection-strip style="height:${total*100}%">${stripItems.map(film=>{const title=film?.title||film?.original_title||"Фильм";return `<div class="kg-projection-strip-frame" style="height:${100/total}%"><img src="${projectionPoster(film?.poster_path)}" alt="Постер фильма «${html(title)}»"><span class="kg-projection-image-shade"></span></div>`;}).join("")}</div>`;}
    const strip=img?.querySelector("[data-kg-projection-strip]");if(strip)strip.style.transform=`translate3d(0,${-(startIndex/total)*100}%,0)`;let lastFrame=-1;
    return new Promise(resolve=>{const start=performance.now(),step=now=>{if(options.cancelled?.()){emitReelMotion(0);root.classList.remove("is-running");state.rolling=false;resolve(false);return;}if(options.shouldSkip?.()){resolve(land());return;}const progress=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-progress,4),offset=startIndex+(targetIndex-startIndex)*ease;
        if(strip){strip.style.transform=`translate3d(0,${-(offset/total)*100}%,0)`;const speed=(startIndex-targetIndex)*4*Math.pow(1-progress,.9)*1000/duration;strip.style.filter=`blur(${Math.min(1.15,Math.max(.08,speed*.055))}px)`;}
        if (offset - targetIndex < .002) {
          resolve(land());
          return;
        }
        const distance = startIndex - offset;
        const traveled = Math.max(0, Math.floor(distance));
        const frameIndex = traveled % items.length;
        emitReelMotion((1 - progress) ** 3, distance, traveled);
        if(frameIndex!==lastFrame){lastFrame=frameIndex;const film=items[frameIndex];if(counter)counter.textContent=`${String(frameIndex+1).padStart(2,"0")} / ${String(items.length).padStart(2,"0")}`;const title=root.querySelector("[data-kg-projection-title]"),year=root.querySelector("[data-kg-projection-year]"),rating=root.querySelector("[data-kg-projection-rating]");if(title)title.textContent=film.title||film.original_title||"Фильм";if(year)year.textContent=(film.release_date||"").slice(0,4);if(rating)rating.textContent=Number(film.vote_average)>0?`★ ${Number(film.vote_average).toFixed(1)}`:"";options.onFrame?.(film,frameIndex);}
        requestAnimationFrame(step);};requestAnimationFrame(step);});
  }
  function isProjectionMode(){return reelMode()==="projection";}
  function isCassetteMode(){return reelMode()==="cassette";}
  function render(options={}){
    const mode=options.mode||reelMode();
    if(mode==="cassette")return renderCassetteDeck(options);
    if(mode==="projection")return renderProjectionTrack(options);
    const shellClass=options.shellClass||"relative w-full overflow-hidden";
    const windowClass=["kg-reel-window","kgr-win","select-none",options.windowClass||""].filter(Boolean).join(" ");
    const trackClass=["kg-reel-track","kgr-track",options.trackClass||""].filter(Boolean).join(" ");
    const runClass=["kg-reel-run","kgr-run",options.runClass||""].filter(Boolean).join(" ");
    const frameClass=["kg-reel-frame","kgr-frame",options.frameClass||""].filter(Boolean).join(" ");
    const run=options.includeRun===false?"":`<div${attr("id",options.runId)} class="${runClass}">${options.content||""}</div>`;
    const frameAttributes=(options.frameAttr||"").trim();
    return `<div${attr("class",shellClass)}>${reelHeading("Кинолента 35-мм")}${perf()}<div${attr("id",options.windowId)} class="${windowClass}"><div${attr("id",options.trackId)} class="${trackClass}">${run}</div><div${attr("id",options.frameId)} ${frameAttributes} class="${frameClass}" aria-hidden="true"></div></div>${perf()}</div>`;
  }
  const style=document.createElement("style");style.id="kg-cinema-reel-style";
  style.textContent=`.kg-reel-perf{display:flex;align-items:center;justify-content:center;padding:4px 8px;background:rgb(var(--kg-black)/.6);overflow:hidden;user-select:none}.kg-reel-perf>div{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:360px}.kg-reel-perf i{display:inline-block;width:10px;height:6px;border-radius:2px;background:rgb(var(--kg-neutral-75));border:1px solid rgb(var(--kg-neutral-100));flex:none}
  .kg-reel-window{position:relative;height:150px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,rgb(var(--kg-black)) 10%,rgb(var(--kg-black)) 90%,transparent);mask-image:linear-gradient(90deg,transparent,rgb(var(--kg-black)) 10%,rgb(var(--kg-black)) 90%,transparent)}.kg-reel-track{position:absolute;inset:0;overflow:hidden}.kg-reel-run{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;gap:10px;padding-left:8px;will-change:transform}.kg-reel-frame{position:absolute;left:50%;top:50%;width:94px;height:128px;transform:translate(-50%,-50%);z-index:5;pointer-events:none;border:2px solid rgb(var(--kg-primary-container));border-radius:10px;box-shadow:0 0 18px rgb(var(--kg-primary-container)/.5),inset 0 0 14px rgb(var(--kg-primary-container)/.22)}.kg-reel-frame.hit{animation:kgImxFrameHit .85s ease-out}.kg-reel-frame:before,.kg-reel-frame:after{content:"";position:absolute;left:50%;transform:translateX(-50%);border:6px solid transparent}.kg-reel-frame:before{top:-9px;border-top:7px solid rgb(var(--kg-primary-container));border-bottom:0}.kg-reel-frame:after{bottom:-9px;border-bottom:7px solid rgb(var(--kg-primary-container));border-top:0}@keyframes kgImxFrameHit{45%{box-shadow:0 0 38px 8px rgb(var(--kg-primary-container)/.75),inset 0 0 22px rgb(var(--kg-primary-container)/.4)}}
  .kg-imax-stage{--imax-amber:rgb(var(--kg-primary-container));--imax-green:rgb(var(--kg-green-10));position:relative;width:100%;overflow:hidden;border:1px solid rgb(var(--kg-warm-surface-17));border-radius:16px;background:radial-gradient(ellipse at 50% 45%,rgb(var(--kg-warm-surface-10)) 0,rgb(var(--kg-neutral-30)) 48%,rgb(var(--kg-neutral-05)) 100%);box-shadow:inset 0 0 30px rgb(var(--kg-black)/0.8),0 12px 30px rgb(var(--kg-black)/0.46667);color:rgb(var(--kg-warm-text-25));font:500 9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}.kg-imax-stage:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgb(var(--kg-primary-container)/.14),transparent 72%)}.kg-imax-head,.kg-imax-gate-label,.kg-imax-gate-foot{position:relative;z-index:2;display:flex;justify-content:space-between;gap:5px;padding:7px 9px;color:rgb(var(--kg-neutral-120));font-size:8px;letter-spacing:.06em}.kg-imax-head{border-bottom:1px solid rgb(var(--kg-white)/0.07059)}.kg-imax-head>span:first-child{color:rgb(var(--kg-accent-warm));font-weight:800}.kg-imax-head i{color:rgb(var(--kg-neutral-106))}.kg-imax-head-state{color:rgb(var(--kg-green-15))}.kg-imax-machine{position:relative;z-index:1;display:grid;grid-template-columns:clamp(48px,17vw,78px) minmax(0,1fr) clamp(48px,17vw,78px);align-items:center;gap:5px;padding:8px 7px 6px}.kg-imax-spool{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;color:rgb(var(--kg-warm-text-15));font-size:7px;text-align:center}.kg-imax-wheel{position:relative;width:100%;aspect-ratio:1;border-radius:50%;border:2px solid rgb(var(--kg-neutral-109));background:radial-gradient(circle,rgb(var(--kg-neutral-05)) 0 13%,transparent 14%),repeating-radial-gradient(circle,rgb(var(--kg-neutral-10)) 0 5px,rgb(var(--kg-neutral-67)) 6px 8px,rgb(var(--kg-neutral-11)) 9px 12px);box-shadow:0 0 0 3px rgb(var(--kg-neutral-06)),0 0 0 4px rgb(var(--kg-accent-deep)),0 4px 16px rgb(var(--kg-black)),inset 0 0 15px rgb(var(--kg-black)/0.86667);overflow:hidden}.kg-imax-supply .kg-imax-wheel{border-color:rgb(var(--kg-accent-muted));filter:drop-shadow(0 0 6px rgb(var(--kg-accent-muted)/0.37647))}.kg-imax-takeup .kg-imax-wheel{border-color:rgb(var(--kg-green-09));filter:drop-shadow(0 0 6px rgb(var(--kg-green-05)/0.31373))}.kg-imax-wheel>i{position:absolute;left:50%;top:4%;width:8%;height:42%;transform-origin:50% 110%;background:linear-gradient(90deg,rgb(var(--kg-cool-surface-01)),rgb(var(--kg-neutral-125)) 45%,rgb(var(--kg-neutral-103)) 70%,rgb(var(--kg-neutral-55)));clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);border-radius:4px}.kg-imax-wheel>i:nth-child(1){transform:translateX(-50%) rotate(0deg)}.kg-imax-wheel>i:nth-child(2){transform:translateX(-50%) rotate(60deg)}.kg-imax-wheel>i:nth-child(3){transform:translateX(-50%) rotate(120deg)}.kg-imax-wheel>i:nth-child(4){transform:translateX(-50%) rotate(180deg)}.kg-imax-wheel>i:nth-child(5){transform:translateX(-50%) rotate(240deg)}.kg-imax-wheel>i:nth-child(6){transform:translateX(-50%) rotate(300deg)}.kg-imax-wheel>b{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:28%;aspect-ratio:1;transform:translate(-50%,-50%);border:2px solid rgb(var(--kg-neutral-107));border-radius:50%;background:radial-gradient(circle at 35% 30%,rgb(var(--kg-neutral-104)),rgb(var(--kg-neutral-34)) 65%);box-shadow:0 0 10px rgb(var(--kg-black));color:rgb(var(--kg-primary-fixed-dim));font-size:6px;font-weight:900}.kg-imax-takeup .kg-imax-wheel>b{color:rgb(var(--kg-green-17))}.kg-imax-spool-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgb(var(--kg-warm-text-16))}.kg-imax-supply .kg-imax-spool-label{color:rgb(var(--kg-primary-fixed-dim))}.kg-imax-takeup .kg-imax-spool-label{color:rgb(var(--kg-green-16))}.kg-imax-gate{position:relative;min-width:0;overflow:hidden;border:1px solid rgb(var(--kg-warm-surface-20));border-radius:9px;background:rgb(var(--kg-neutral-02));box-shadow:0 0 16px rgb(var(--kg-primary-container)/0.1098)}.kg-imax-gate-label,.kg-imax-gate-foot{padding:4px 6px;font-size:6px}.kg-imax-gate-label{color:rgb(var(--kg-primary-fixed-dim));background:rgb(var(--kg-neutral-18))}.kg-imax-gate-foot{color:rgb(var(--kg-warm-text-08));background:rgb(var(--kg-neutral-06))}.kg-imax-window{height:132px!important;-webkit-mask-image:none!important;mask-image:none!important;background:linear-gradient(rgb(var(--kg-black)),rgb(var(--kg-neutral-25)) 50%,rgb(var(--kg-black)))}.kg-imax-window .kg-reel-run{gap:10px;padding-left:8px}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{box-sizing:border-box;flex:0 0 80px;width:80px!important;min-width:80px;max-width:80px;height:112px!important;min-height:112px;max-height:112px;border-radius:4px}.kg-imax-window .kg-reel-frame{width:94px;height:128px;border-radius:5px;box-shadow:0 0 18px rgb(var(--kg-primary-container)/0.33333),inset 0 0 12px rgb(var(--kg-primary-container)/0.13333)}.kg-imax-slate{position:relative;z-index:2;padding:8px 10px 9px;border-top:1px solid rgb(var(--kg-white)/0.07059);background:linear-gradient(rgb(var(--kg-neutral-36)),rgb(var(--kg-neutral-06)))}.kg-imax-titleline{display:flex;align-items:center;justify-content:space-between;gap:8px;color:rgb(var(--kg-accent-muted));font-size:8px}.kg-imax-rating{flex:none;padding:2px 6px;border-radius:5px;background:rgb(var(--kg-neutral-33));color:rgb(var(--kg-accent-text))}.kg-imax-slate h3{margin:3px 0;color:rgb(var(--kg-white));font:700 17px/1.2 Georgia,serif;letter-spacing:.01em}.kg-imax-subtitle{color:rgb(var(--kg-accent-muted));font-size:8px}.kg-imax-slate p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:4px 0 0;color:rgb(var(--kg-neutral-124));font:10px/1.4 system-ui,sans-serif}.kg-imax-controls{position:relative;z-index:2;display:flex;align-items:center;gap:6px;padding:6px 10px;border-top:1px solid rgb(var(--kg-white)/0.06275);color:rgb(var(--kg-neutral-114));font-size:7px}.kg-imax-led{flex:none;width:6px;height:6px;border-radius:50%;background:rgb(var(--kg-neutral-102))}.kg-imax-stage.is-spinning .kg-imax-led{background:rgb(var(--kg-primary-container));box-shadow:0 0 8px rgb(var(--kg-primary-container));animation:kgImxPulse .8s infinite alternate}.kg-imax-stage:has(.kg-reel-run.fast) .kg-imax-supply .kg-imax-wheel,.kg-imax-stage:has(.kg-reel-run .kgr-cell.spin) .kg-imax-supply .kg-imax-wheel{animation:kgImxSpinCCW 1.1s linear infinite}.kg-imax-stage:has(.kg-reel-run.fast) .kg-imax-takeup .kg-imax-wheel,.kg-imax-stage:has(.kg-reel-run .kgr-cell.spin) .kg-imax-takeup .kg-imax-wheel{animation:kgImxSpinCW 1.1s linear infinite}.kg-imax-stage.is-spinning .kg-imax-supply .kg-imax-wheel{animation:kgImxSpinCCW 1.1s linear infinite}.kg-imax-stage.is-spinning .kg-imax-takeup .kg-imax-wheel{animation:kgImxSpinCW 1.1s linear infinite}.kg-imax-stage.is-spinning [data-imax-status]{color:rgb(var(--kg-primary-fixed-dim))}.kg-imax-controls button{margin-left:auto;padding:4px 7px;border:1px solid rgb(var(--kg-accent-deep));border-radius:5px;background:rgb(var(--kg-warm-surface-08));color:rgb(var(--kg-primary-fixed-dim));font-family:inherit;font-size:7px;font-weight:700;cursor:pointer}.kg-imax-stage.is-spinning .kg-imax-window .film-cell{opacity:.95;filter:brightness(1.08)}@keyframes kgImxSpinCW{to{transform:rotate(360deg)}}@keyframes kgImxSpinCCW{from{transform:rotate(360deg)}to{transform:rotate(0)}}@keyframes kgImxPulse{to{opacity:.5}}@media(prefers-reduced-motion:reduce){.kg-imax-stage.is-spinning .kg-imax-wheel,.kg-imax-stage.is-spinning .kg-imax-led{animation:none!important}}`;
  document.head.appendChild(style);
  const cassetteStyle=document.createElement("style");cassetteStyle.id="kg-cassette-deck-style";
  cassetteStyle.textContent=`
    .kg-cassette-deck{--kg-cassette-width:clamp(174px,54vw,214px);--kgc-gold:rgb(var(--kg-primary-container));--kgc-ink:rgb(var(--kg-neutral-16));--kgc-panel:rgb(var(--kg-neutral-53));box-sizing:border-box;position:relative;isolation:isolate;display:grid;gap:10px;width:100%;max-width:100%;padding:clamp(10px,2vw,16px);overflow:hidden;border:1px solid rgb(var(--kg-accent-deep));border-radius:18px;background:radial-gradient(ellipse at 50% 34%,rgb(var(--kg-warm-surface-11)) 0,rgb(var(--kg-neutral-53)) 54%,rgb(var(--kg-neutral-23)) 100%);box-shadow:inset 0 0 0 3px rgb(var(--kg-primary-container)/0.07059),inset 0 0 28px rgb(var(--kg-black)/0.53333),0 14px 30px rgb(var(--kg-black)/0.46667);color:rgb(var(--kg-warm-text-23));font:500 11px/1.4 system-ui,-apple-system,sans-serif}
    .kg-cassette-deck:before{content:"";position:absolute;z-index:-1;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 18%,rgb(var(--kg-white)/0.06667) 48%,transparent 65%);opacity:.5}
    .kg-cassette-telemetry{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px;min-width:0;padding:0 2px 8px;border-bottom:1px solid rgb(var(--kg-white)/0.07843)}
    .kg-cassette-telemetry>div:first-child{display:grid;gap:3px;min-width:0}.kg-cassette-live{color:rgb(var(--kg-accent-warm));font-size:9px;font-weight:800;letter-spacing:.12em}.kg-cassette-telemetry small{color:rgb(var(--kg-neutral-112));font-size:8px;letter-spacing:.1em}
    .kg-cassette-counter{padding:5px 8px;border:1px solid rgb(var(--kg-primary-container)/0.26667);border-radius:999px;background:rgb(var(--kg-neutral-12));color:rgb(var(--kg-accent-warm));font:700 9px/1 ui-monospace,monospace;white-space:nowrap}
    .kg-cassette-vu{display:flex;align-items:center;gap:3px;height:19px;padding:0 5px}.kg-cassette-vu small{font:700 7px ui-monospace,monospace}.kg-cassette-vu span{width:3px;height:7px;border-radius:2px;background:rgb(var(--kg-green-13));opacity:.75}.kg-cassette-vu span:nth-of-type(2),.kg-cassette-vu span:nth-of-type(4){height:12px}.kg-cassette-vu span:nth-of-type(3){height:16px;background:rgb(var(--kg-primary-container))}.kg-cassette-deck.is-rolling .kg-cassette-vu span{animation:kgCassetteVu .42s ease-in-out infinite alternate}.kg-cassette-deck.is-rolling .kg-cassette-vu span:nth-of-type(2n){animation-delay:.18s}
    .kg-cassette-mechanism{display:grid;grid-template-columns:minmax(42px,76px) minmax(0,1fr) minmax(42px,76px);align-items:center;gap:10px;padding:2px 7px}
    .kg-cassette-hub{position:relative;aspect-ratio:1;width:100%;border:2px solid rgb(var(--kg-neutral-105));border-radius:50%;background:radial-gradient(circle,rgb(var(--kg-neutral-24)) 0 13%,transparent 14%),repeating-radial-gradient(circle,rgb(var(--kg-neutral-48)) 0 4px,rgb(var(--kg-neutral-93)) 5px 7px,rgb(var(--kg-neutral-49)) 8px 10px);box-shadow:0 0 0 3px rgb(var(--kg-neutral-08)),0 0 0 4px rgb(var(--kg-accent-deep)),0 5px 12px rgb(var(--kg-black)/0.73333),inset 0 0 15px rgb(var(--kg-black)/0.93333);overflow:hidden}
    .kg-cassette-hub:before,.kg-cassette-hub:after,.kg-cassette-hub i{content:"";position:absolute;left:50%;top:50%;width:7%;height:43%;border-radius:3px;background:linear-gradient(90deg,rgb(var(--kg-neutral-99)),rgb(var(--kg-neutral-126)) 48%,rgb(var(--kg-neutral-101)));transform-origin:50% 0}.kg-cassette-hub:before{transform:rotate(0deg)}.kg-cassette-hub:after{transform:rotate(120deg)}.kg-cassette-hub i{transform:rotate(240deg)}
    .kg-cassette-hub[data-kg-cassette-hub="right"]{border-color:rgb(var(--kg-green-07));box-shadow:0 0 0 3px rgb(var(--kg-neutral-08)),0 0 0 4px rgb(var(--kg-green-04)),0 5px 12px rgb(var(--kg-black)/0.73333),inset 0 0 15px rgb(var(--kg-black)/0.93333)}.kg-cassette-hub[data-kg-cassette-hub="right"]:before,.kg-cassette-hub[data-kg-cassette-hub="right"]:after,.kg-cassette-hub[data-kg-cassette-hub="right"] i{background:linear-gradient(90deg,rgb(var(--kg-green-03)),rgb(var(--kg-green-18)) 48%,rgb(var(--kg-green-03)))}
    .kg-cassette-deck.is-rolling .kg-cassette-hub{animation:kgCassetteSpin .72s linear infinite}.kg-cassette-deck.is-rolling .kg-cassette-hub[data-kg-cassette-hub="right"]{animation-duration:.48s}
    .kg-cassette-tape{height:8px;overflow:hidden;border:1px solid rgb(var(--kg-warm-surface-28));border-radius:99px;background:rgb(var(--kg-neutral-08));box-shadow:inset 0 1px 4px rgb(var(--kg-black))}.kg-cassette-tape span{display:block;width:0;height:100%;border-radius:inherit;background:linear-gradient(90deg,rgb(var(--kg-accent-muted)),rgb(var(--kg-accent-warm)),rgb(var(--kg-green-14)));box-shadow:0 0 10px rgb(var(--kg-primary-container)/0.50196);transition:width .35s ease}
    .kg-cassette-stage{position:relative;min-width:0;padding:7px 0 15px;border:1px solid rgb(var(--kg-white)/0.07059);border-radius:14px;background:radial-gradient(ellipse at 50% 50%,rgb(var(--kg-neutral-83)) 0,rgb(var(--kg-neutral-46)) 62%,rgb(var(--kg-neutral-22)) 100%);box-shadow:inset 0 0 24px rgb(var(--kg-black)/0.6)}
    .kg-cassette-coverflow{position:relative;box-sizing:border-box;width:100%;height:clamp(180px,28vw,250px);min-height:180px;overflow:hidden;perspective:950px;touch-action:pan-y;user-select:none;-webkit-user-select:none}
    .kg-cassette-card{position:absolute;left:50%;top:50%;box-sizing:border-box;display:block;width:clamp(112px,19vw,174px);height:88%;max-height:218px;margin:0;padding:0;overflow:hidden;border:1px solid rgb(var(--kg-warm-surface-30));border-radius:9px;background:rgb(var(--kg-neutral-27));color:rgb(var(--kg-warm-text-29));text-align:left;box-shadow:0 14px 25px rgb(var(--kg-black)/0.66667);backface-visibility:hidden;cursor:default} .kg-cassette-deck:not(.is-rolling) .kg-cassette-card.active{border-color:rgb(var(--kg-primary-container))}.kg-cassette-card-top,.kg-cassette-card-bottom{position:absolute;z-index:2;left:0;right:0;display:flex;align-items:center;justify-content:space-between;height:17px;padding:0 6px;background:rgb(var(--kg-neutral-24)/0.9098);color:rgb(var(--kg-warm-text-12));font:700 7px/1 ui-monospace,monospace;letter-spacing:.04em}.kg-cassette-card-top{top:0}.kg-cassette-card-bottom{bottom:0}.kg-cassette-card-bottom i{width:8px;height:5px;border:1px solid rgb(var(--kg-warm-surface-31));border-radius:2px}.kg-cassette-card-bottom b{width:24px;height:7px;border:1px solid rgb(var(--kg-warm-surface-29));border-radius:2px}
    .kg-cassette-card-poster{position:absolute;inset:0;display:block;overflow:hidden;background:rgb(var(--kg-neutral-77))}.kg-cassette-card-poster>img{display:block;width:100%;height:100%;object-fit:cover}.kg-cassette-card-poster> b{display:grid;place-items:center;width:100%;height:100%;padding:10px;color:rgb(var(--kg-primary));text-align:center;font:700 14px/1.3 Georgia,serif}.kg-cassette-card-caption{position:absolute;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:space-between;gap:4px;padding:18px 6px 5px;background:linear-gradient(transparent,rgb(var(--kg-neutral-03)/0.93725));color:rgb(var(--kg-white));font-size:8px}.kg-cassette-card-caption b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kg-cassette-card-caption i{flex:none;color:rgb(var(--kg-accent-warm));font-style:normal}
    .kg-cassette-swipe-hint{position:absolute;right:0;bottom:2px;left:0;color:rgb(var(--kg-warm-text-10));text-align:center;font:700 7px/1.2 ui-monospace,monospace;letter-spacing:.1em;opacity:.75}
    .kg-cassette-info{display:grid;gap:6px;min-width:0;padding:10px 11px;border:1px solid rgb(var(--kg-white)/0.07059);border-radius:12px;background:linear-gradient(135deg,rgb(var(--kg-neutral-69)),rgb(var(--kg-neutral-42)))}.kg-cassette-info-head{display:flex;justify-content:space-between;gap:8px;color:rgb(var(--kg-warm-text-17));font-size:9px}.kg-cassette-info-head span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kg-cassette-info-head span:last-child{flex:none;color:rgb(var(--kg-primary-fixed-dim))}.kg-cassette-info h2{margin:0;color:rgb(var(--kg-primary));font:700 clamp(17px,4vw,23px)/1.15 Georgia,serif}.kg-cassette-tags{display:flex;flex-wrap:wrap;gap:5px}.kg-cassette-tags span{padding:3px 6px;border:1px solid rgb(var(--kg-white)/0.07059);border-radius:999px;background:rgb(var(--kg-neutral-20));color:rgb(var(--kg-warm-text-20));font-size:8px}.kg-cassette-tags span:first-child{color:rgb(var(--kg-primary-fixed-dim))}.kg-cassette-info>p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0;color:rgb(var(--kg-neutral-122));font-size:10px;line-height:1.45}.kg-cassette-actions{display:flex;gap:6px}.kg-cassette-actions button,.kg-cassette-transport button,.kg-cassette-footer button{min-height:32px;border:1px solid rgb(var(--kg-accent-deep));border-radius:8px;background:rgb(var(--kg-neutral-47));color:rgb(var(--kg-accent-warm));font:700 9px/1.2 system-ui,sans-serif;cursor:pointer}.kg-cassette-actions [data-kg-cassette-watch]{flex:1;background:linear-gradient(100deg,rgb(var(--kg-accent-muted)),rgb(var(--kg-primary-container)));color:rgb(var(--kg-warm-surface-03))}.kg-cassette-actions .kg-cassette-icon{width:36px;font-size:15px}
    .kg-cassette-transport{display:grid;grid-template-columns:minmax(58px,.7fr) minmax(0,1.5fr) minmax(58px,.7fr);gap:6px}.kg-cassette-transport button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;padding:5px}.kg-cassette-transport button[data-kg-cassette-random]{border-color:rgb(var(--kg-accent-muted));background:linear-gradient(100deg,rgb(var(--kg-accent-strong)),rgb(var(--kg-primary-container)));color:rgb(var(--kg-warm-surface-02))}.kg-cassette-transport button small{font:700 7px ui-monospace,monospace;opacity:.72}
    .kg-cassette-footer{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-top:6px;border-top:1px solid rgb(var(--kg-white)/0.07059);color:rgb(var(--kg-neutral-115));font:700 7px/1.2 ui-monospace,monospace;letter-spacing:.06em}.kg-cassette-footer button{min-height:25px;padding:4px 7px;font:700 7px/1 system-ui,sans-serif}
    .kg-cassette-card{pointer-events:none}.kg-cassette-card[hidden]{display:none}
    .kg-cassette-card-poster>img{opacity:0;transition:opacity .18s ease-out}.kg-cassette-card-poster>img.is-ready{opacity:1}
    @keyframes kgCassetteSpin{to{transform:rotate(360deg)}}@keyframes kgCassetteVu{to{height:16px;opacity:1}}
    /* Responsive adaptation of the Stitch Hi-Fi Cover Flow deck */
    .kg-cassette-telemetry{grid-template-columns:minmax(0,1fr) auto;padding:2px 2px 9px}.kg-cassette-live{display:flex;align-items:center;gap:6px}.kg-cassette-live i{width:7px;height:7px;border-radius:50%;background:rgb(var(--kg-green-12));box-shadow:0 0 9px rgb(var(--kg-green-12));animation:kgCassetteVu .9s ease-in-out infinite alternate}.kg-cassette-telemetry small{font-size:7px;letter-spacing:.08em}
    .kg-cassette-counter{display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:4px}.kg-cassette-counter small{color:rgb(var(--kg-neutral-116));font-size:7px;letter-spacing:.08em}.kg-cassette-counter b{font-size:12px;letter-spacing:.12em}
    .kg-cassette-vumeters{display:grid;grid-template-columns:1fr 1fr;gap:7px}.kg-cassette-vumeters>div{min-width:0;padding:5px 6px;border-radius:6px;background:rgb(var(--kg-neutral-12));box-shadow:inset 0 1px 5px rgb(var(--kg-black))}.kg-cassette-vumeters>div>span{display:flex;justify-content:space-between;margin-bottom:4px;color:rgb(var(--kg-neutral-116));font:700 7px ui-monospace,monospace}.kg-cassette-vumeters>div>span b{color:rgb(var(--kg-accent-strong));font-weight:700}.kg-cassette-vumeters>div>i{display:flex;gap:2px;height:7px}.kg-cassette-vumeters>div>i b{flex:1;border-radius:2px;background:rgb(var(--kg-green-08));opacity:.24;transition:opacity .12s}.kg-cassette-vumeters>div>i b:nth-child(-n+6){opacity:.78}.kg-cassette-vumeters>div>i b:nth-child(n+7){background:rgb(var(--kg-primary-container));opacity:.58}.kg-cassette-vumeters>div>i b:nth-child(n+10){background:rgb(var(--kg-rose-03));opacity:.22}.kg-cassette-deck.is-rolling .kg-cassette-vumeters>div>i b{animation:kgCassetteVu .3s ease-in-out infinite alternate;opacity:.9}.kg-cassette-deck.is-rolling .kg-cassette-vumeters>div>i b:nth-child(2n){animation-delay:.12s}
    .kg-cassette-mechanism{grid-template-columns:clamp(54px,17vw,72px) minmax(0,1fr) clamp(54px,17vw,72px);gap:8px;padding:5px 5px 7px}.kg-cassette-hub-wrap{display:grid;place-items:center;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgb(var(--kg-surface-container-high)) 45%,rgb(var(--kg-surface-container-lowest)) 74%,rgb(var(--kg-on-primary)));box-shadow:inset 0 0 11px rgb(var(--kg-black));overflow:hidden}.kg-cassette-hub{width:88%;border-color:rgb(var(--kg-accent-muted));background:radial-gradient(circle,rgb(var(--kg-neutral-19)) 0 13%,transparent 14%),repeating-radial-gradient(circle,rgb(var(--kg-neutral-41)) 0 4px,rgb(var(--kg-neutral-95)) 5px 7px,rgb(var(--kg-neutral-49)) 8px 10px)}.kg-cassette-head{display:grid;gap:5px;min-width:0;padding:8px 9px;border-radius:10px;background:rgb(var(--kg-neutral-13)/0.85098);box-shadow:inset 0 1px 6px rgb(var(--kg-black))}.kg-cassette-head>div:first-child{display:flex;justify-content:space-between;gap:6px;color:rgb(var(--kg-warm-text-21));font:700 7px ui-monospace,monospace}.kg-cassette-head>div:first-child b{color:rgb(var(--kg-accent-strong))}.kg-cassette-head>div:first-child span{color:rgb(var(--kg-accent-warm))}.kg-cassette-head>i{height:8px;padding:2px;border-radius:99px;background:rgb(var(--kg-neutral-97))}.kg-cassette-head>i b{display:block;height:100%;width:54%;border-radius:inherit;background:linear-gradient(90deg,rgb(var(--kg-primary-container)),rgb(var(--kg-rose-04)));transition:width .25s ease}.kg-cassette-head-state{display:flex;align-items:center;gap:5px;color:rgb(var(--kg-warm-text-17));font:700 6px ui-monospace,monospace;letter-spacing:.08em}.kg-cassette-head-state i{width:5px;height:5px;border-radius:50%;background:rgb(var(--kg-accent-strong));box-shadow:0 0 6px rgb(var(--kg-accent-strong))}.kg-cassette-deck.is-rolling .kg-cassette-head-state i{animation:kgCassetteVu .38s ease-in-out infinite alternate}
    .kg-cassette-stage{padding:7px 0 14px}.kg-cassette-collection-label{display:flex;justify-content:space-between;gap:6px;padding:0 8px 5px;color:rgb(var(--kg-accent-muted));font:700 7px ui-monospace,monospace;letter-spacing:.08em}.kg-cassette-collection-label small{color:rgb(var(--kg-warm-text-09));font-size:6px}.kg-cassette-coverflow{height:clamp(220px,68vw,275px);min-height:220px;perspective:950px;perspective-origin:50% 48%;touch-action:pan-y}.kg-cassette-ambient{position:absolute;top:22%;left:50%;width:48%;height:56%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgb(var(--kg-accent-muted)/0.26667),transparent 70%);pointer-events:none}
    .kg-cassette-card{width:var(--kg-cassette-width);height:86%;max-height:245px;transition:border-color .2s ease-out}.kg-cassette-card-top,.kg-cassette-card-bottom{height:19px;padding:0 8px;font-size:7px}.kg-cassette-card-top b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kg-cassette-card-top i{flex:none;color:rgb(var(--kg-rose-10));font-style:normal}.kg-cassette-card-poster{inset:0}.kg-cassette-card-caption{padding:22px 8px 7px;font-size:10px}.kg-cassette-stage [data-kg-cassette-prev],.kg-cassette-stage [data-kg-cassette-next]{position:absolute;z-index:35;top:55%;display:grid;place-items:center;width:32px;height:32px;border:1px solid rgb(var(--kg-white)/0.14118);border-radius:50%;background:rgb(var(--kg-surface-container-lowest) / 0.788);color:rgb(var(--kg-primary-fixed-dim));font-size:24px;line-height:1;box-shadow:0 4px 14px rgb(var(--kg-black)/0.6)}.kg-cassette-stage [data-kg-cassette-prev]{left:6px}.kg-cassette-stage [data-kg-cassette-next]{right:6px}
    .kg-cassette-swipe-hint{display:none}.kg-cassette-info{gap:7px;padding:11px 12px;background:linear-gradient(145deg,rgb(var(--kg-neutral-69)),rgb(var(--kg-neutral-45)));transition:opacity .22s,transform .22s}.kg-cassette-info.is-changing{animation:kgCassetteMeta .24s ease-out}.kg-cassette-info-head{align-items:center;font-size:8px;letter-spacing:.08em;text-transform:uppercase}.kg-cassette-info-head span:last-child{padding:3px 7px;border-radius:999px;background:rgb(var(--kg-secondary-container)/0.33333);color:rgb(var(--kg-secondary))}.kg-cassette-info h2{font:600 clamp(18px,5vw,23px)/1.18 Georgia,'Times New Roman',serif;color:rgb(var(--kg-primary))}.kg-cassette-info-original{margin-top:-5px;color:rgb(var(--kg-warm-text-13));font:italic 10px/1.35 Georgia,serif}.kg-cassette-tags span{font:700 7px ui-monospace,monospace;letter-spacing:.03em}.kg-cassette-info>p{-webkit-line-clamp:3;font:11px/1.5 system-ui,sans-serif}.kg-cassette-actions button,.kg-cassette-transport button{min-height:38px}.kg-cassette-transport{grid-template-columns:minmax(68px,.8fr) minmax(0,1.5fr) minmax(68px,.8fr);gap:7px}.kg-cassette-transport button{font-size:11px}.kg-cassette-transport button small{font-size:6px;letter-spacing:.04em}.kg-cassette-footer{font-size:7px}.kg-cassette-footer>span{display:flex;align-items:center;gap:6px;min-width:0}.kg-cassette-footer>span b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.kg-cassette-footer>span i{flex:none;width:6px;height:6px;border-radius:50%;background:rgb(var(--kg-green-11));box-shadow:0 0 7px rgb(var(--kg-green-11))}.kg-cassette-deck.is-rolling .kg-cassette-footer>span i{background:rgb(var(--kg-primary-container));box-shadow:0 0 8px rgb(var(--kg-primary-container));animation:kgCassetteVu .4s infinite alternate}.kg-cassette-footer button{font-size:6px;white-space:nowrap}
    .kg-cassette-hub{transition:transform .65s cubic-bezier(.18,.7,.2,1)}.kg-cassette-deck.is-rolling .kg-cassette-hub{animation:none!important}.kg-cassette-deck.is-rolling [data-kg-cassette-roll-icon]{display:inline-block;animation:kgCassetteSpin .9s linear infinite}
    .kg-cassette-vumeters>div>i b:nth-child(-n+6){opacity:.78}.kg-cassette-vumeters>div>i b:nth-child(n+7){opacity:.62}.kg-cassette-vumeters>div>i b:nth-child(n+10){opacity:.24}
    @keyframes kgCassetteMeta{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}
    @media(max-width:480px){.kg-cassette-deck{--kg-cassette-width:clamp(174px,54vw,210px);gap:8px;padding:10px;border-radius:14px}.kg-cassette-telemetry{grid-template-columns:minmax(0,1fr) auto;gap:6px}.kg-cassette-mechanism{grid-template-columns:clamp(52px,16vw,64px) minmax(0,1fr) clamp(52px,16vw,64px);gap:6px;padding:3px 1px 5px}.kg-cassette-coverflow{height:clamp(220px,68vw,258px);min-height:220px}.kg-cassette-info{padding:9px}.kg-cassette-info>p{-webkit-line-clamp:3}.kg-cassette-stage [data-kg-cassette-prev]{left:3px}.kg-cassette-stage [data-kg-cassette-next]{right:3px}}
    @media(prefers-reduced-motion:reduce){.kg-cassette-deck *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(cassetteStyle);
  const ticketStyle=document.createElement("style");ticketStyle.id="kg-gold-ticket-style";
  ticketStyle.textContent=`.kg-ticket-mode{width:100%}.kg-ticket{--gold:rgb(var(--kg-primary-container));position:relative;isolation:isolate;overflow:hidden;margin:8px 0;border:1px solid rgb(var(--kg-accent-deep));border-radius:12px;background:radial-gradient(ellipse at 82% 94%,rgb(var(--kg-warm-surface-25)/0.4),transparent 40%),linear-gradient(135deg,rgb(var(--kg-neutral-58)) 0%,rgb(var(--kg-neutral-76)) 52%,rgb(var(--kg-neutral-73)) 100%);box-shadow:inset 0 0 0 3px rgb(var(--kg-accent-muted)/0.1098),inset 0 1px 18px rgb(var(--kg-primary-container)/0.07451),0 18px 38px rgb(var(--kg-black)/0.6);color:rgb(var(--kg-warm-text-24));font:500 11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.kg-ticket:before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(115deg,transparent 15%,rgb(var(--kg-primary-container)/0.03137) 40%,rgb(var(--kg-white)/0.13333) 50%,rgb(var(--kg-primary-container)/0.03922) 57%,transparent 82%);background-size:220% 100%;animation:kgTicketFoil 8s ease-in-out infinite}.kg-ticket-top{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgb(var(--kg-accent-muted)/0.2);color:rgb(var(--kg-accent-text));font-size:9px;font-weight:800;letter-spacing:.13em}.kg-ticket-top i{color:rgb(var(--kg-white)/0.2)}.kg-ticket-edition{padding:5px 8px;border:1px solid rgb(var(--kg-accent-muted)/0.56471);background:linear-gradient(120deg,rgb(var(--kg-accent-muted)),rgb(var(--kg-primary-fixed-dim)),rgb(var(--kg-accent-deep)));color:rgb(var(--kg-warm-surface-04));text-align:center}.kg-ticket-body{display:grid;grid-template-columns:minmax(100px,31%) minmax(0,1fr);gap:14px;padding:14px}.kg-ticket-poster{position:relative;overflow:hidden;min-height:200px;max-height:310px;border:1px solid rgb(var(--kg-accent-muted)/0.46667);border-radius:5px;background:rgb(var(--kg-neutral-32));box-shadow:0 8px 20px rgb(var(--kg-black)/0.53333)}.kg-ticket-poster img{display:block;width:100%;height:100%;min-height:200px;max-height:310px;object-fit:cover}.kg-ticket-poster>span{position:absolute;bottom:0;left:0;right:0;padding:5px;background:linear-gradient(transparent,rgb(var(--kg-neutral-06)/0.86667));color:rgb(var(--kg-primary-fixed-dim));font-size:8px;letter-spacing:.1em}.kg-ticket-poster>span b{color:rgb(var(--kg-white)/0.46667)}.kg-ticket-no-poster{display:grid;place-items:center;height:100%;min-height:200px;color:rgb(var(--kg-accent-muted));font-size:12px;font-weight:bold;text-align:center;letter-spacing:.12em}.kg-ticket-info{min-width:0;display:flex;flex-direction:column;justify-content:center}.kg-ticket-kicker{color:rgb(var(--kg-primary-fixed-dim));font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.kg-ticket-kicker span{color:rgb(var(--kg-warm-text-02))}.kg-ticket-info h2{margin:9px 0 2px;color:rgb(var(--kg-accent-text));font:700 clamp(21px,5vw,36px)/1.07 Georgia,'Times New Roman',serif;letter-spacing:.035em;text-transform:uppercase;text-shadow:0 2px 0 rgb(var(--kg-warm-surface-16)),0 0 15px rgb(var(--kg-primary-container)/0.13333)}.kg-ticket-original{color:rgb(var(--kg-warm-text-18));font:italic 12px/1.5 Georgia,serif}.kg-ticket-director{margin-top:8px;color:rgb(var(--kg-primary-fixed-dim));font-size:9px;letter-spacing:.04em}.kg-ticket-synopsis{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin:10px 0;color:rgb(var(--kg-neutral-123));font:11px/1.55 system-ui,sans-serif}.kg-ticket-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:4px;padding:9px;border:1px solid rgb(var(--kg-accent-muted)/0.1451);background:rgb(var(--kg-neutral-31)/0.6)}.kg-ticket-stats span{display:flex;flex-direction:column;gap:3px;min-width:0}.kg-ticket-stats small,.kg-ticket-seat small{color:rgb(var(--kg-warm-text-06));font-size:7px;letter-spacing:.12em}.kg-ticket-stats b{overflow:hidden;color:rgb(var(--kg-primary-fixed-dim));font-size:9px;text-overflow:ellipsis;white-space:nowrap}.kg-ticket-award{margin-top:8px;color:rgb(var(--kg-primary-fixed-dim));font-size:8px;font-weight:bold;letter-spacing:.1em}.kg-ticket-seam{display:flex;align-items:center;gap:8px;padding:7px 14px;border-top:1px dashed rgb(var(--kg-accent-muted)/0.4);color:rgb(var(--kg-warm-text-04));font-size:7px;letter-spacing:.17em}.kg-ticket-seam span:first-child,.kg-ticket-seam span:last-child{height:1px;flex:1;background:linear-gradient(90deg,transparent,rgb(var(--kg-accent-muted)/0.4))}.kg-ticket-stub{display:grid;grid-template-columns:1fr minmax(105px,38%) auto;align-items:center;gap:10px;padding:9px 14px 13px}.kg-ticket-seat{display:flex;align-items:center;gap:7px}.kg-ticket-seat b{color:rgb(var(--kg-accent-text));font-size:11px}.kg-ticket-code{min-width:0;text-align:center}.kg-ticket-code>span,.kg-ticket-code>small{display:block;overflow:hidden;color:rgb(var(--kg-accent-warm));font-size:7px;letter-spacing:.13em;text-overflow:ellipsis;white-space:nowrap}.kg-ticket-bars{height:30px;margin:3px 0;background:repeating-linear-gradient(90deg,rgb(var(--kg-primary-container)) 0 2px,transparent 2px 4px,rgb(var(--kg-primary-container)) 4px 5px,transparent 5px 8px,rgb(var(--kg-primary-container)) 8px 11px,transparent 11px 13px);opacity:.88}.kg-ticket-tear{padding:9px 10px;border:1px solid rgb(var(--kg-primary-container));border-radius:3px;background:linear-gradient(110deg,rgb(var(--kg-accent-muted)),rgb(var(--kg-primary-container)),rgb(var(--kg-accent-muted)));color:rgb(var(--kg-warm-surface-01));font:700 8px/1.3 ui-monospace,monospace;letter-spacing:.08em;cursor:pointer}.kg-ticket-tear span{font-size:13px}.kg-ticket-tear[aria-pressed=true]{background:rgb(var(--kg-neutral-74));color:rgb(var(--kg-accent-muted))}.kg-ticket-foot{display:flex;justify-content:space-between;gap:10px;padding:8px 14px;border-top:1px solid rgb(var(--kg-accent-muted)/0.1451);color:rgb(var(--kg-warm-text-03));font-size:7px;letter-spacing:.13em}.kg-ticket-valid{color:rgb(var(--kg-accent-muted))}.kg-ticket.is-torn .kg-ticket-stub{opacity:.55;filter:grayscale(.5)}.kg-ticket.is-torn .kg-ticket-valid{color:rgb(var(--kg-rose-08))}.kg-ticket.is-torn .kg-ticket-valid:after{content:" · ПОГАШЕН"}@keyframes kgTicketFoil{0%,72%,100%{background-position:180% 0}84%{background-position:-60% 0}}@media(max-width:480px){.kg-ticket-body{grid-template-columns:94px minmax(0,1fr);gap:10px;padding:10px}.kg-ticket-poster,.kg-ticket-poster img{min-height:140px;max-height:220px}.kg-ticket-info h2{margin-top:5px;font-size:21px}.kg-ticket-original{font-size:10px}.kg-ticket-synopsis{-webkit-line-clamp:2;margin:6px 0;font-size:10px}.kg-ticket-stats{gap:3px;padding:6px}.kg-ticket-stats small{font-size:6px}.kg-ticket-stats b{font-size:8px}.kg-ticket-stub{grid-template-columns:1fr minmax(90px,35%);gap:6px;padding:8px 10px 10px}.kg-ticket-seat{gap:4px}.kg-ticket-seat small{font-size:6px}.kg-ticket-seat b{font-size:9px}.kg-ticket-tear{grid-column:1/-1;padding:7px}.kg-ticket-top,.kg-ticket-foot{padding-left:10px;padding-right:10px;font-size:7px}}`;
  ticketStyle.textContent += ".kg-ticket-shuffle:not(.is-shuffling) .kg-ticket-skip{visibility:hidden}";
  document.head.appendChild(ticketStyle);
  const ticketMotionStyle=document.createElement("style");ticketMotionStyle.id="kg-gold-ticket-motion-style";
  ticketMotionStyle.textContent=`
    .kg-ticket-foot{align-items:center;min-height:28px;padding:7px 12px;border-top:1px solid rgb(var(--kg-accent-muted)/0.1451)}
    .kg-ticket-code-inline{display:flex;align-items:center;gap:8px;min-width:0;color:rgb(var(--kg-accent-warm));font-size:8px;letter-spacing:.12em}
    .kg-ticket-code-inline .kg-ticket-bars{flex:0 0 92px;height:18px;margin:0}
    .kg-ticket-code-inline small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .kg-ticket-shuffle{gap:14px}
    .kg-ticket-mode .kg-ticket-stack-layer{transform-origin:center;will-change:transform}
    .kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-1{animation:kgTicketStackA 1.35s cubic-bezier(.45,0,.25,1) infinite alternate}
    .kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-2{animation:kgTicketStackB 1.55s cubic-bezier(.45,0,.25,1) infinite alternate}
    .kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-3{animation:kgTicketStackC 1.25s cubic-bezier(.45,0,.25,1) infinite alternate}
    .kg-ticket-mode .kg-ticket-face{perspective:1100px;transform-origin:center center}
    .kg-ticket-mode .kg-ticket-shuffle .kg-ticket-face.ticket-flip{animation:kgTicketOverlay .78s cubic-bezier(.2,.72,.22,1) both}
    .kg-ticket-mode .kg-ticket-shuffle.is-landed .kg-ticket-face{animation:kgTicketFinalSettle .72s cubic-bezier(.16,1,.3,1) both}
    @keyframes kgTicketOverlay{0%{transform:translate3d(18px,-23px,0) rotate(1.8deg) scale(.965);opacity:.48;filter:brightness(1.16)}42%{transform:translate3d(-3px,5px,0) rotate(-.45deg) scale(1.008);opacity:1;filter:brightness(1.04)}72%{transform:translate3d(1px,-2px,0) rotate(.15deg) scale(.998);filter:brightness(1)}100%{transform:translate3d(0,0,0) rotate(0) scale(1);opacity:1;filter:none}}
    @keyframes kgTicketStackA{to{transform:translate(13px,11px) rotate(4deg)}}
    @keyframes kgTicketStackB{to{transform:translate(-11px,8px) rotate(-3.5deg)}}
    @keyframes kgTicketStackC{to{transform:translate(5px,-6px) rotate(2deg)}}
    @keyframes kgTicketFinalSettle{50%{transform:scale(1.018)}100%{transform:scale(1)}}
    @media(max-width:480px){.kg-ticket-code-inline{gap:6px}.kg-ticket-code-inline .kg-ticket-bars{flex-basis:64px;height:16px}.kg-ticket-foot{padding-left:9px;padding-right:9px}}
    @media(prefers-reduced-motion:reduce){.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer,.kg-ticket-face.ticket-flip,.kg-ticket-shuffle.is-landed .kg-ticket-face{animation-duration:.01ms!important}}
  `;
  document.head.appendChild(ticketMotionStyle);
  const deckStyle=document.createElement("style");deckStyle.id="kg-ticket-deck-style";deckStyle.textContent=`.kg-ticket-shuffle{position:relative;display:flex;min-height:300px;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px 12px 14px;overflow:hidden;border-radius:12px;background:radial-gradient(ellipse at 50% 45%,rgb(var(--kg-warm-surface-14)) 0,rgb(var(--kg-neutral-37)) 65%,rgb(var(--kg-neutral-12)) 100%)}.kg-ticket-stack{position:relative;width:min(100%,640px);isolation:isolate}.kg-ticket-stack-layer{position:absolute;inset:0;border:1px solid rgb(var(--kg-accent-muted));border-radius:12px;background:linear-gradient(135deg,rgb(var(--kg-warm-surface-12)),rgb(var(--kg-neutral-72)) 55%,rgb(var(--kg-warm-surface-15)));box-shadow:0 12px 30px rgb(var(--kg-black)/0.6);pointer-events:none}.kg-ticket-stack-layer .kg-ticket{height:100%;margin:0;opacity:.72;filter:brightness(.72) saturate(.82)}.kg-ticket-stack-layer.layer-1{transform:translate(9px,8px) rotate(2.2deg)}.kg-ticket-stack-layer.layer-2{transform:translate(-7px,5px) rotate(-1.7deg)}.kg-ticket-stack-layer.layer-3{transform:translate(3px,-3px) rotate(.8deg)}.kg-ticket-face{position:relative;z-index:2;transform-origin:center;will-change:transform,opacity}.kg-ticket-face .kg-ticket{margin:0}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-1{animation:kgTicketLayerA .55s ease-in-out infinite alternate}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-2{animation:kgTicketLayerB .62s ease-in-out infinite alternate}.kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-3{animation:kgTicketLayerC .48s ease-in-out infinite alternate}.kg-ticket-face.ticket-flip{animation:kgTicketFlip .32s cubic-bezier(.2,.75,.25,1)}.kg-ticket-shuffle.is-landed .kg-ticket-face{animation:kgTicketLand .5s ease-out}.kg-ticket-shuffle-status{color:rgb(var(--kg-primary-fixed-dim));font:700 10px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;text-align:center}.kg-ticket-skip{padding:7px 12px;border:1px solid rgb(var(--kg-accent-muted));border-radius:6px;background:rgb(var(--kg-warm-surface-07));color:rgb(var(--kg-primary-fixed-dim));font:700 9px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}.kg-ticket-shuffle.is-landed .kg-ticket-skip{display:none}@keyframes kgTicketLayerA{to{transform:translate(17px,13px) rotate(7deg)}}@keyframes kgTicketLayerB{to{transform:translate(-15px,12px) rotate(-6deg)}}@keyframes kgTicketLayerC{to{transform:translate(8px,-8px) rotate(4deg)}}@keyframes kgTicketFlip{50%{transform:translateY(-8px) rotate(1.5deg);opacity:.7}}@keyframes kgTicketLand{50%{transform:scale(1.025)}100%{transform:scale(1)}}@media(max-width:480px){.kg-ticket-shuffle{min-height:230px;padding:12px 8px}.kg-ticket-stack-layer.layer-1{transform:translate(5px,5px) rotate(2deg)}.kg-ticket-stack-layer.layer-2{transform:translate(-4px,4px) rotate(-1.5deg)}}@media(prefers-reduced-motion:reduce){.kg-ticket-shuffle *{animation-duration:.01ms!important;animation-iteration-count:1!important}}`;
  document.head.appendChild(deckStyle);
  const ticketCinematicStyle=document.createElement("style");ticketCinematicStyle.id="kg-ticket-cinematic-style";ticketCinematicStyle.textContent=`.kg-ticket-mode .kg-ticket-stack-layer{transform-origin:center;will-change:transform,opacity;backface-visibility:hidden}.kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-1{animation:kgTicketCineLayer1 1.8s cubic-bezier(.45,0,.25,1) infinite alternate}.kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-2{animation:kgTicketCineLayer2 2.1s cubic-bezier(.45,0,.25,1) infinite alternate}.kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer.layer-3{animation:kgTicketCineLayer3 2.4s cubic-bezier(.45,0,.25,1) infinite alternate}.kg-ticket-mode .kg-ticket-face.ticket-fly-out{animation:kgTicketCineOut var(--kg-ticket-out-ms,260ms) cubic-bezier(.55,.04,.72,.28) forwards;pointer-events:none}.kg-ticket-mode .kg-ticket-face.ticket-land-in{animation:kgTicketCineIn var(--kg-ticket-in-ms,320ms) cubic-bezier(.18,.78,.22,1) both}.kg-ticket-mode .kg-ticket-shuffle.is-landed .kg-ticket-face{animation:kgTicketCineSettle .9s cubic-bezier(.16,1,.3,1) both}@keyframes kgTicketCineLayer1{to{transform:translate(12px,10px) rotate(3.2deg) scale(.985);filter:brightness(.82)}}@keyframes kgTicketCineLayer2{to{transform:translate(-10px,7px) rotate(-2.8deg) scale(.972);filter:brightness(.75)}}@keyframes kgTicketCineLayer3{to{transform:translate(4px,-5px) rotate(1.8deg) scale(.96);filter:brightness(.68)}}@keyframes kgTicketCineOut{0%{transform:translate3d(0,0,0) rotate(0) rotateX(0) scale(1);opacity:1;filter:brightness(1)}40%{transform:translate3d(0,-22px,18px) rotate(-2deg) rotateX(3deg) scale(1.015);opacity:.96;filter:brightness(1.08)}100%{transform:translate3d(7px,-82px,-24px) rotate(5deg) rotateX(-8deg) scale(.94);opacity:0;filter:brightness(1.2)}}@keyframes kgTicketCineIn{0%{transform:translate3d(-4px,-54px,-20px) rotate(-3deg) rotateX(7deg) scale(.955);opacity:.22;filter:brightness(1.25)}65%{transform:translate3d(1px,3px,5px) rotate(.5deg) rotateX(-1deg) scale(1.008);opacity:1;filter:brightness(1.05)}84%{transform:translate3d(-1px,-2px,0) rotate(-.2deg) scale(.998);filter:brightness(1)}100%{transform:translate3d(0,0,0) rotate(0) rotateX(0) scale(1);opacity:1;filter:none}}@keyframes kgTicketCineSettle{0%{transform:translateY(-5px) scale(.99)}45%{transform:translateY(0) scale(1.018);filter:brightness(1.12);box-shadow:0 0 42px 5px rgb(var(--kg-primary)/0.4),0 20px 50px rgb(var(--kg-black)/0.86667)}100%{transform:translateY(0) scale(1);filter:none}}@media(prefers-reduced-motion:reduce){.kg-ticket-mode .kg-ticket-shuffle.is-shuffling .kg-ticket-stack-layer,.kg-ticket-mode .kg-ticket-face.ticket-fly-out,.kg-ticket-mode .kg-ticket-face.ticket-land-in,.kg-ticket-mode .kg-ticket-shuffle.is-landed .kg-ticket-face{animation-duration:.01ms!important}}`;
  document.head.appendChild(ticketCinematicStyle);
  const imaxCleanStyle=document.createElement("style");imaxCleanStyle.id="kg-imax-clean-style";
  imaxCleanStyle.textContent=`.kg-imax-stage{--kg-imax-wheel-size:112px}.kg-imax-machine{grid-template-columns:var(--kg-imax-wheel-size) minmax(0,1fr) var(--kg-imax-wheel-size);gap:7px;padding:8px 6px}.kg-imax-spool{display:block;width:var(--kg-imax-wheel-size);height:var(--kg-imax-wheel-size);min-width:0}.kg-imax-wheel{box-sizing:border-box;width:100%;height:100%;aspect-ratio:1}.kg-imax-wheel>b{font-size:0}.kg-imax-gate{align-self:center;overflow:hidden;border:0;border-radius:0;background:transparent;box-shadow:none}.kg-imax-window{height:var(--kg-imax-wheel-size)!important;min-height:0;display:block;border:0;background:transparent;-webkit-mask-image:none!important;mask-image:none!important}.kg-imax-window .kg-reel-run{gap:10px;padding-left:8px}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{position:relative!important;box-sizing:border-box!important;display:block!important;flex:0 0 80px!important;width:80px!important;min-width:80px!important;max-width:80px!important;height:var(--kg-imax-wheel-size)!important;min-height:var(--kg-imax-wheel-size)!important;max-height:var(--kg-imax-wheel-size)!important;overflow:hidden!important;object-fit:cover;border-radius:3px}.kg-imax-window .film-cell>img,.kg-imax-window .kgr-cell>img{position:absolute!important;inset:0!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;min-height:0!important;max-height:none!important;object-fit:cover!important;border-radius:0!important}.kg-imax-window .film-cell>.nop,.kg-imax-window .kgr-cell>.nop{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;width:100%!important;height:100%!important;padding:4px!important;text-align:center!important}.kg-imax-window .film-cell .yr,.kg-imax-window .kgr-cell .yr{display:none!important}.kg-imax-window .film-cell.chosen,.kg-imax-window .kgr-cell.chosen{transform:none!important;box-shadow:none!important}.kg-imax-window .kg-reel-frame{box-sizing:border-box;width:94px;height:var(--kg-imax-wheel-size);border-radius:4px}.kg-imax-controls{min-height:7px;padding:2px 6px;border-top:0;background:transparent}.kg-imax-controls>[data-imax-status]{font-size:0}.kg-imax-controls button{font-size:7px}.kg-imax-stage .kg-imax-head,.kg-imax-stage .kg-imax-gate-label,.kg-imax-stage .kg-imax-gate-foot,.kg-imax-stage .kg-imax-spool-label,.kg-imax-stage .kg-imax-slate{display:none!important}@media(max-width:600px){.kg-imax-stage{--kg-imax-wheel-size:clamp(92px,25vw,104px);border-radius:12px}.kg-imax-machine{grid-template-columns:var(--kg-imax-wheel-size) minmax(0,1fr) var(--kg-imax-wheel-size);gap:3px;padding:6px 2px}.kg-imax-spool{width:var(--kg-imax-wheel-size);height:var(--kg-imax-wheel-size)}.kg-imax-window{height:var(--kg-imax-wheel-size)!important}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{height:var(--kg-imax-wheel-size)!important;min-height:var(--kg-imax-wheel-size)!important;max-height:var(--kg-imax-wheel-size)!important;background:transparent!important;border:0!important}.kg-imax-window .film-cell>img,.kg-imax-window .kgr-cell>img{inset:auto!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:calc(var(--kg-imax-wheel-size)*.69)!important;height:var(--kg-imax-wheel-size)!important;min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;object-fit:cover!important;border-radius:3px!important}.kg-imax-window .film-cell>.nop,.kg-imax-window .kgr-cell>.nop{inset:auto!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:calc(var(--kg-imax-wheel-size)*.69)!important;height:var(--kg-imax-wheel-size)!important;background:rgb(var(--kg-surface-container));border:1px solid rgb(var(--kg-warm-surface-17))}.kg-imax-window .kg-reel-frame{box-sizing:border-box;width:calc(var(--kg-imax-wheel-size)*.79);height:var(--kg-imax-wheel-size)}.kg-imax-machine .kg-imax-gate{min-width:0}.kg-imax-controls{padding:2px 5px}}@media(max-width:370px){.kg-imax-stage{--kg-imax-wheel-size:84px}}`;
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
      emitReelMotion(0);
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
      if(progress<1&&remaining>=.75){
        emitReelMotion((1 - progress) ** 3, Math.abs(x - startX) / stepWidth, Math.abs(currentStep));
        raf=requestAnimationFrame(step);return;
      }
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
    set("state",uiText(meta.state||"ПРОЕКЦИЯ ИДЁТ"));
  }

  const projectionStyle=document.createElement("style");projectionStyle.id="kg-projection-track-style";projectionStyle.textContent=`.kg-projection{--kgp-gold:rgb(var(--kg-primary-container));position:relative;overflow:hidden;padding:10px;border:1px solid rgb(var(--kg-accent-deep));border-radius:14px;background:radial-gradient(ellipse at 50% 48%,rgb(var(--kg-warm-surface-21)/0.4),transparent 55%),linear-gradient(145deg,rgb(var(--kg-neutral-31)),rgb(var(--kg-neutral-61)) 60%,rgb(var(--kg-neutral-59)));color:rgb(var(--kg-warm-text-22));box-shadow:inset 0 0 24px rgb(var(--kg-primary-container)/0.06275),0 12px 32px rgb(var(--kg-black)/0.53333);font:10px/1.4 ui-monospace,SFMono-Regular,monospace}.kg-projection-top,.kg-projection-telemetry{display:flex;align-items:center;justify-content:space-between;gap:5px}.kg-projection-top{padding:3px 2px 8px;color:rgb(var(--kg-primary-fixed-dim));font-size:8px;letter-spacing:.08em}.kg-projection-top>span:first-child{display:flex;align-items:center;gap:5px}.kg-projection-top i{width:6px;height:6px;border-radius:50%;background:rgb(var(--kg-primary-container));box-shadow:0 0 8px rgb(var(--kg-primary-container))}.kg-projection-top b{color:rgb(var(--kg-accent-warm))}.kg-projection-telemetry{padding:6px 7px;border:1px solid rgb(var(--kg-primary-container)/0.13333);border-radius:5px;background:rgb(var(--kg-neutral-15));color:rgb(var(--kg-warm-text-05));font-size:7px;letter-spacing:.08em}.kg-projection-machine{display:grid;grid-template-columns:11px minmax(0,1fr) 11px;gap:5px;align-items:stretch;margin:9px auto 7px;width:min(100%,355px);height:clamp(280px,88vw,370px);padding:8px;border:1px solid rgb(var(--kg-accent-muted));border-radius:9px;background:linear-gradient(90deg,rgb(var(--kg-neutral-51)),rgb(var(--kg-neutral-87)) 8%,rgb(var(--kg-neutral-44)) 18%,rgb(var(--kg-neutral-24)) 50%,rgb(var(--kg-neutral-51)) 82%,rgb(var(--kg-neutral-84)) 92%,rgb(var(--kg-neutral-51)));box-shadow:0 10px 24px rgb(var(--kg-black)/0.66667),inset 0 0 0 3px rgb(var(--kg-black)/0.53333)}.kg-projection-perfs{display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:4px 0}.kg-projection-perfs i{display:block;width:8px;height:13px;border-radius:2px;background:linear-gradient(135deg,rgb(var(--kg-neutral-108)),rgb(var(--kg-neutral-80)));box-shadow:inset 0 1px 2px rgb(var(--kg-black))}.kg-projection-window{position:relative;overflow:hidden;border:2px solid rgb(var(--kg-warm-text-01));border-radius:5px;background:rgb(var(--kg-neutral-07));box-shadow:0 0 22px rgb(var(--kg-primary-container)/0.09804)}.kg-projection-image{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;background:rgb(var(--kg-neutral-32))}.kg-projection-image img{width:100%;height:100%;object-fit:cover;filter:saturate(.86) contrast(1.04)}.kg-projection-image-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgb(var(--kg-neutral-10)/0.86667),transparent 44%,rgb(var(--kg-neutral-10)/0.25098))}.kg-projection-beam{position:absolute;z-index:2;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 10%,rgb(var(--kg-primary)/0.05098) 47%,rgb(var(--kg-white)/0.13333) 50%,rgb(var(--kg-primary-container)/0.06275) 54%,transparent 90%);mix-blend-mode:screen;animation:kgpBeam 3.2s ease-in-out infinite}.kg-projection-frame-meta{position:absolute;z-index:3;right:7px;bottom:7px;left:7px;display:flex;justify-content:space-between;gap:4px;color:rgb(var(--kg-primary-fixed-dim));font-size:8px;text-shadow:0 1px 4px rgb(var(--kg-black))}.kg-projection-frame-meta b{padding:2px 5px;border-radius:3px;background:rgb(var(--kg-neutral-15)/0.8)}.kg-projection-empty{display:grid;place-items:center;height:100%;padding:15px;color:rgb(var(--kg-primary-fixed-dim));text-align:center;font-weight:bold;letter-spacing:.12em}.kg-projection-caption{display:grid;gap:2px;padding:7px 3px 2px;border-top:1px solid rgb(var(--kg-primary-container)/0.14118)}.kg-projection-caption small{overflow:hidden;color:rgb(var(--kg-accent-text));font-size:7px;letter-spacing:.1em;text-overflow:ellipsis;white-space:nowrap}.kg-projection-caption strong{overflow:hidden;color:rgb(var(--kg-primary));font:600 17px/1.2 Georgia,serif;text-overflow:ellipsis;white-space:nowrap}.kg-projection-caption span{overflow:hidden;color:rgb(var(--kg-neutral-117));font-size:9px;text-overflow:ellipsis;white-space:nowrap}.kg-projection.is-running .kg-projection-window{animation:kgpFlicker .12s steps(2,end) infinite}.kg-projection.is-running .kg-projection-perfs i{animation:kgpPerf .18s linear infinite}.kg-projection-flash{animation:kgpFrame .18s ease-out}@keyframes kgpBeam{0%,100%{transform:translateX(-40%);opacity:.4}50%{transform:translateX(40%);opacity:.9}}@keyframes kgpFlicker{50%{filter:brightness(1.2)}}@keyframes kgpPerf{to{filter:brightness(1.6)}}@keyframes kgpFrame{50%{transform:scale(1.025);filter:brightness(1.3)}}@media(prefers-reduced-motion:reduce){.kg-projection *{animation-duration:.01ms!important;animation-iteration-count:1!important}}`;
  document.head.appendChild(projectionStyle);
  const projectionMotionStyle=document.createElement("style");projectionMotionStyle.id="kg-projection-motion-style";projectionMotionStyle.textContent=`.kg-projection-strip{position:absolute;inset:0 0 auto;display:flex;flex-direction:column;will-change:transform,filter}.kg-projection-strip-frame{position:relative;box-sizing:border-box;flex:none;width:100%;overflow:hidden;background:rgb(var(--kg-neutral-32))}.kg-projection-strip-frame img{display:block;width:100%;height:100%;object-fit:cover}.kg-projection-strip-frame .kg-projection-image-shade{z-index:1}.kg-projection.is-running .kg-projection-window{animation:none!important}.kg-projection.is-running .kg-projection-perfs i{animation:kgpPerf .55s ease-in-out infinite alternate}`;document.head.appendChild(projectionMotionStyle);
  window.KGCinemaReel=Object.freeze({render,spin,updateIMAX,renderTicket,presentTicket,prepareTicket,animateTicketDeck,isTicketMode:()=>false,isCassetteMode,isProjectionMode,mountCassetteDeck,spinCassetteDeck,mountProjectionTrack,spinProjectionTrack});
})();
