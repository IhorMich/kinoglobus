/* Shared visual markup for every film reel in Kinoglobus. */
(function(){
  const hole=()=>'<i aria-hidden="true"></i>'.repeat(12);
  const perf=()=>`<div class="kg-reel-perf" aria-hidden="true"><div>${hole()}</div></div>`;
  const attr=(name,value)=>value?` ${name}="${String(value).replace(/[&"<>]/g,c=>({"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"}[c]))}"`:"";
  const html=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const spool=(side,label,caption)=>`<div class="kg-imax-spool kg-imax-${side}"><div class="kg-imax-wheel"><i></i><i></i><i></i><i></i><i></i><i></i><b><span>${caption}</span></b></div><span class="kg-imax-spool-label">${label}</span></div>`;
  function renderImax(options={}){
    const p=options.prefix||"kg-imax",windowId=options.windowId||`${p}-window`,trackId=options.trackId||`${p}-track`,frameId=options.frameId||`${p}-frame`;
    const runId=options.runId||`${p}-run`,runClass=options.runClass||"run";
    const title=html(options.title||"Ожидание фильма"),subtitle=html(options.subtitle||"TMDB · кинопоиск 70 мм"),description=html(options.description||"После запуска поиска постеры пройдут через оптическую рамку и остановятся на найденном фильме.");
    const country=html(options.country||"КИНОПОИСК"),rating=html(options.rating||"—"),runtime=html(options.runtime||"—");
    const content=options.includeRun===false?"":`<div${attr("id",runId)} class="kg-reel-run kgr-run ${runClass}">${options.content||""}</div>`;
    return `<section${attr("id",options.rootId||`${p}-stage`)} class="kg-imax-stage ${options.rootClass||""}">
      <div class="kg-imax-head"><span>IMAX 15/70 <i>·</i> EASTMAN KODAK</span><span class="kg-imax-head-state" data-imax-state>${html(options.state||"ГОТОВ К ПОИСКУ")}</span></div>
      <div class="kg-imax-machine">${spool("supply","ПОДАЮЩАЯ БОБИНА","НАМОТКА")}
        <div class="kg-imax-gate"><div class="kg-imax-gate-label"><span>70 ММ · 15 PERFORATIONS</span><span data-imax-counter>${html(options.counter||"КАДР --")}</span></div>
          ${perf()}<div${attr("id",windowId)} class="kg-reel-window kgr-win kg-imax-window"><div${attr("id",trackId)} class="kg-reel-track kgr-track">${content}</div><div${attr("id",frameId)} ${options.frameAttr||""} class="kg-reel-frame kgr-frame kg-imax-frame" aria-hidden="true"></div></div>${perf()}
          <div class="kg-imax-gate-foot"><span>15-PERF · 1.43:1</span><span>TMDB FILM FEED</span></div>
        </div>${spool("takeup","ПРИЁМНАЯ БОБИНА","НАМОТКА")}
      </div>
      <div class="kg-imax-slate"><div class="kg-imax-titleline"><span data-imax-country>${country}</span><span class="kg-imax-rating">★ <b data-imax-rating>${rating}</b></span></div><h3 data-imax-title>${title}</h3><div class="kg-imax-subtitle" data-imax-subtitle>${subtitle}${runtime!=="—"?` · ${runtime}`:""}</div><p data-imax-description>${description}</p></div>
      <div class="kg-imax-controls"><span class="kg-imax-led"></span><span data-imax-status>Плёнка готова к протяжке</span><button type="button" data-imax-skip hidden>К выбранному фильму</button></div>
    </section>`;
  }
  function render(options={}){
    if(options.mode==="70mm")return renderImax(options);
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
  window.KGCinemaReel=Object.freeze({render,spin,updateIMAX});
})();
