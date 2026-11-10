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
  }
  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-kg-ticket-tear]");if(!button)return;
    const card=button.closest("[data-kg-ticket-card]");if(!card||button.getAttribute("aria-pressed")==="true")return;
    button.setAttribute("aria-pressed","true");button.innerHTML="✓ БИЛЕТ ПОГАШЕН";card.classList.add("is-torn");
    try{navigator.vibrate?.([12,28,18]);}catch{}
  });
  function render(options={}){
    const mode=options.mode||reelMode();
    if(mode==="70mm")return renderImax({...options,mode:"70mm"});
    if(mode==="ticket")return `<div class="kg-ticket-mode"><div data-kg-ticket-animation>${render({...options,mode:"35mm"})}</div><div data-kg-ticket-outlet hidden></div></div>`;
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
  const imaxCleanStyle=document.createElement("style");imaxCleanStyle.id="kg-imax-clean-style";
  imaxCleanStyle.textContent=`.kg-imax-stage{--kg-imax-wheel-size:112px}.kg-imax-machine{grid-template-columns:var(--kg-imax-wheel-size) minmax(0,1fr) var(--kg-imax-wheel-size);gap:7px;padding:8px 6px}.kg-imax-spool{display:block;width:var(--kg-imax-wheel-size);height:var(--kg-imax-wheel-size);min-width:0}.kg-imax-wheel{box-sizing:border-box;width:100%;height:100%;aspect-ratio:1}.kg-imax-wheel>b{font-size:0}.kg-imax-gate{align-self:center;overflow:hidden;border:0;border-radius:0;background:transparent;box-shadow:none}.kg-imax-window{height:var(--kg-imax-wheel-size)!important;min-height:0;display:block;border:0;background:transparent;-webkit-mask-image:none!important;mask-image:none!important}.kg-imax-window .kg-reel-run{gap:10px;padding-left:8px}.kg-imax-window .film-cell,.kg-imax-window .kgr-cell{position:relative!important;box-sizing:border-box!important;display:block!important;flex:0 0 80px!important;width:80px!important;min-width:80px!important;max-width:80px!important;height:var(--kg-imax-wheel-size)!important;min-height:var(--kg-imax-wheel-size)!important;max-height:var(--kg-imax-wheel-size)!important;overflow:hidden!important;object-fit:cover;border-radius:3px}.kg-imax-window .film-cell>img,.kg-imax-window .kgr-cell>img{position:absolute!important;inset:0!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;min-height:0!important;max-height:none!important;object-fit:cover!important;border-radius:0!important}.kg-imax-window .film-cell>.nop,.kg-imax-window .kgr-cell>.nop{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;width:100%!important;height:100%!important;padding:4px!important;text-align:center!important}.kg-imax-window .film-cell .yr,.kg-imax-window .kgr-cell .yr{display:none!important}.kg-imax-window .film-cell.chosen,.kg-imax-window .kgr-cell.chosen{transform:none!important;box-shadow:none!important}.kg-imax-window .kg-reel-frame{box-sizing:border-box;width:94px;height:var(--kg-imax-wheel-size);border-radius:4px}.kg-imax-controls{min-height:7px;padding:2px 6px;border-top:0;background:transparent}.kg-imax-controls>[data-imax-status]{font-size:0}.kg-imax-controls button{font-size:7px}.kg-imax-stage .kg-imax-head,.kg-imax-stage .kg-imax-gate-label,.kg-imax-stage .kg-imax-gate-foot,.kg-imax-stage .kg-imax-spool-label,.kg-imax-stage .kg-imax-slate{display:none!important}@media(max-width:390px){.kg-imax-stage{--kg-imax-wheel-size:96px}.kg-imax-machine{gap:5px;padding:7px 4px}.kg-imax-window .kg-reel-frame{width:90px}}`;
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
  window.KGCinemaReel=Object.freeze({render,spin,updateIMAX,renderTicket,presentTicket,prepareTicket});
})();
