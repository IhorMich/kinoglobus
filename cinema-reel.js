/* Shared visual markup for every film reel in Kinoglobus. */
(function(){
  const hole=()=>'<i aria-hidden="true"></i>'.repeat(12);
  const perf=()=>`<div class="kg-reel-perf" aria-hidden="true"><div>${hole()}</div></div>`;
  const attr=(name,value)=>value?` ${name}="${String(value).replace(/[&"<>]/g,c=>({"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"}[c]))}"`:"";
  function render(options={}){
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
  style.textContent=".kg-reel-perf{display:flex;align-items:center;justify-content:center;padding:4px 8px;background:rgba(0,0,0,.6);overflow:hidden;user-select:none}.kg-reel-perf>div{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:360px}.kg-reel-perf i{display:inline-block;width:10px;height:6px;border-radius:2px;background:#262626;border:1px solid #525252;flex:none}";
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
    const fastClass=options.fastClass||"fast",spinningClass=options.spinningClass||"spinning";
    let raf=0,done=false,lastStep=-1;
    const finish=cancelled=>{
      if(done)return;
      done=true;
      if(raf)cancelAnimationFrame(raf);
      run.classList.remove(fastClass);
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
    cells.forEach(cell=>cell.classList.add(spinningClass));
    run.style.transform=`translateX(${-startX}px)`;
    run.classList.add(fastClass);
    const started=performance.now();
    const step=now=>{
      if(done)return;
      const progress=Math.min(1,(now-started)/duration);
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
  window.KGCinemaReel=Object.freeze({render,spin});
})();
