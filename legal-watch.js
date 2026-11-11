/* Legal streaming availability shared by every film detail card. */
(function(){
  const regions=["PL","US","GB","CA","AU","DE","FR","IT","ES","NL","SE","DK","NO","FI","PT","IE","CZ","HU","RO","TR","JP","KR","IN","BR","MX","AR","UA","RU","NZ","ZA"];
  const regionNames=new Intl.DisplayNames(["ru"],{type:"region"});
  const cache=new Map();
  const escape=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const officialSites=[
    [/netflix/i,"https://www.netflix.com/"],[/prime video|amazon prime/i,"https://www.primevideo.com/"],[/disney\+/i,"https://www.disneyplus.com/"],
    [/apple tv/i,"https://tv.apple.com/"],[/max|hbo/i,"https://www.max.com/"],[/hulu/i,"https://www.hulu.com/"],[/paramount/i,"https://www.paramountplus.com/"],
    [/peacock/i,"https://www.peacocktv.com/"],[/mubi/i,"https://mubi.com/"],[/youtube/i,"https://www.youtube.com/"],[/crunchyroll/i,"https://www.crunchyroll.com/"],
    [/skyshowtime/i,"https://www.skyshowtime.com/"],[/rakuten/i,"https://www.rakuten.tv/"],[/canal\+/i,"https://www.canalplus.com/"],[/filmin/i,"https://www.filmin.es/"],
    [/viaplay/i,"https://viaplay.com/"],[/megogo/i,"https://megogo.net/"],[/ivi/i,"https://www.ivi.ru/"],[/okko/i,"https://okko.tv/"],
    [/kinopoisk/i,"https://hd.kinopoisk.ru/"],[/amediateka/i,"https://amediateka.ru/"],[/wink/i,"https://wink.ru/"],[/start/i,"https://start.ru/"],[/kion/i,"https://kion.ru/"]
  ];
  function region(){
    try{const saved=JSON.parse(localStorage.getItem("kgWatchRegion")||"null");if(regions.includes(saved))return saved;}catch{}
    const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
    const zones={"Europe/Warsaw":"PL","Europe/Kyiv":"UA","Europe/Kiev":"UA","Europe/Moscow":"RU","Europe/Berlin":"DE","Europe/Paris":"FR","Europe/London":"GB","America/New_York":"US","America/Los_Angeles":"US","America/Toronto":"CA","Asia/Tokyo":"JP","Asia/Seoul":"KR","Asia/Kolkata":"IN","Australia/Sydney":"AU"};
    if(zones[zone])return zones[zone];
    const locale=(navigator.language||"").split(/[-_]/)[1]?.toUpperCase();return regions.includes(locale)?locale:"PL";
  }
  function markup(id){
    const safeId=String(id||"").replace(/[^0-9]/g,"");if(!safeId)return "";
    const opts=regions.map(code=>`<option value="${code}" ${code===region()?"selected":""}>${escape(regionNames.of(code)||code)}</option>`).join("");
    return `<section data-kg-legal-watch data-film-id="${safeId}" class="kgw-wrap rounded-xl bg-surface-panel p-3 shadow-sm"><div class="kgw-head"><div class="kgw-title"><span class="material-symbols-outlined">live_tv</span><div><h3>Где смотреть легально</h3><small>Доступность зависит от страны</small></div></div><label class="kgw-region-label"><span>Регион</span><select data-kg-watch-region aria-label="Страна доступности сервисов">${opts}</select></label></div><div data-kg-watch-list class="kgw-list"><span class="kgw-loading">Загружаем доступность…</span></div><div class="kgw-source"><span>Данные TMDB · JustWatch</span><a data-kg-watch-source hidden target="_blank" rel="noopener noreferrer">Открыть список доступности</a></div></section>`;
  }
  function styles(){
    if(document.getElementById("kg-legal-watch-style"))return;
    const style=document.createElement("style");style.id="kg-legal-watch-style";style.textContent=`.kgw-wrap{display:flex;flex-direction:column;gap:9px;border:1px solid #d4af3726}.kgw-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.kgw-title{display:flex;align-items:center;gap:8px;min-width:0}.kgw-title>.material-symbols-outlined{color:#d7a53e;font-size:20px}.kgw-title h3{margin:0;color:#eee4d2;font:600 14px/1.2 Georgia,serif}.kgw-title small{display:block;margin-top:2px;color:#9c929f;font-size:10px}.kgw-region-label{display:flex;align-items:center;gap:5px;color:#a99eaa;font-size:9px;white-space:nowrap}.kgw-region-label select{max-width:128px;padding:5px 20px 5px 7px;border:1px solid #d4af373a;border-radius:7px;background:#211b27;color:#f2dba2;font:600 10px system-ui,sans-serif}.kgw-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.kgw-provider{min-width:0;padding:7px;border:1px solid #ffffff0b;border-radius:9px;background:#ffffff05}.kgw-provider-main{display:flex;align-items:center;gap:7px;min-width:0}.kgw-provider-logo{width:27px;height:27px;flex:none;object-fit:contain;border-radius:6px;background:#fff}.kgw-provider-logo.is-missing{display:grid;place-items:center;background:#322a36;color:#e3c36d;font-size:9px;font-weight:700}.kgw-provider-name{overflow:hidden;color:#eee5d6;font-size:10px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.kgw-provider-type{overflow:hidden;margin-top:2px;color:#d2ad55;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.kgw-provider-links{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.kgw-provider-links a{padding:3px 5px;border:1px solid #d4af3728;border-radius:5px;color:#c9bdc9;font-size:8px;text-decoration:none}.kgw-provider-links a:hover{border-color:#d4af3780;color:#ffdc83}.kgw-loading,.kgw-empty{grid-column:1/-1;padding:4px 1px;color:#a39aa5;font-size:10px}.kgw-source{display:flex;justify-content:space-between;gap:8px;color:#8f8791;font-size:8px}.kgw-source a{color:#d8b65e;text-decoration:underline;text-underline-offset:2px}.kgw-provider-count{color:#9e95a0;font-size:9px;white-space:nowrap}@media(max-width:370px){.kgw-list{grid-template-columns:1fr}.kgw-region-label span{display:none}.kgw-region-label select{max-width:112px}}`;
    document.head.appendChild(style);
  }
  async function providerData(id){
    if(cache.has(id))return cache.get(id);
    const promise=(async()=>{let key="";try{key=apiKey||"";}catch{}if(!key)throw new Error("missing TMDB key");const response=await fetch(`https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}/watch/providers?api_key=${encodeURIComponent(key)}`);if(!response.ok)throw new Error(`TMDB ${response.status}`);const json=await response.json();return json.results||{};})().catch(error=>{cache.delete(id);throw error;});
    cache.set(id,promise);return promise;
  }
  function renderRegion(section,all,code){
    const result=all[code],list=section.querySelector("[data-kg-watch-list]"),source=section.querySelector("[data-kg-watch-source]");if(!list)return;
    if(source){source.hidden=!result?.link;if(result?.link)source.href=result.link;}
    if(!result){list.innerHTML=`<span class="kgw-empty">Пока нет данных о легальном просмотре в ${escape(regionNames.of(code)||code)}.</span>`;return;}
    const groups=[["flatrate","Подписка"],["free","Бесплатно"],["ads","Бесплатно с рекламой"],["rent","Аренда"],["buy","Покупка"]],byId=new Map();
    groups.forEach(([key,label])=>(result[key]||[]).forEach(provider=>{const id=provider.provider_id;if(!byId.has(id))byId.set(id,{...provider,types:[]});byId.get(id).types.push(label);}));
    const items=[...byId.values()].slice(0,6);
    if(!items.length){list.innerHTML=`<span class="kgw-empty">В ${escape(regionNames.of(code)||code)} TMDB пока не показывает легальные варианты.</span>`;return;}
    list.innerHTML=items.map(provider=>{
      const name=provider.provider_name||"Сервис просмотра",search=encodeURIComponent(name),official=officialSites.find(([pattern])=>pattern.test(name))?.[1]||"";
      const logo=provider.logo_path?`<img class="kgw-provider-logo" src="https://image.tmdb.org/t/p/w92${escape(provider.logo_path)}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="kgw-provider-logo is-missing">▶</span>`;
      const links=`${official?`<a href="${official}" target="_blank" rel="noopener noreferrer">Сайт</a>`:""}<a href="https://apps.apple.com/search?term=${search}" target="_blank" rel="noopener noreferrer">App Store</a><a href="https://play.google.com/store/search?q=${search}&amp;c=apps" target="_blank" rel="noopener noreferrer">Google Play</a>`;
      return `<article class="kgw-provider"><div class="kgw-provider-main">${logo}<div class="min-w-0"><div class="kgw-provider-name" title="${escape(name)}">${escape(name)}</div><div class="kgw-provider-type">${escape(provider.types.join(" · "))}</div></div></div><div class="kgw-provider-links">${links}</div></article>`;
    }).join("");
  }
  function hydrate(section){
    if(section.dataset.kgWatchReady)return;section.dataset.kgWatchReady="true";styles();
    const select=section.querySelector("[data-kg-watch-region]");if(select)select.value=region();
    providerData(section.dataset.filmId).then(all=>{if(section.isConnected)renderRegion(section,all,region());}).catch(()=>{const list=section.querySelector("[data-kg-watch-list]");if(list)list.innerHTML='<span class="kgw-empty">Не удалось загрузить сервисы просмотра. Проверьте подключение и ключ TMDB.</span>';});
  }
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-legal-watch]"))hydrate(node);node.querySelectorAll?.("[data-kg-legal-watch]").forEach(hydrate);})));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-legal-watch]").forEach(hydrate);
  document.addEventListener("change",event=>{
    const select=event.target.closest("[data-kg-watch-region]");if(!select)return;
    const code=regions.includes(select.value)?select.value:"PL";try{localStorage.setItem("kgWatchRegion",JSON.stringify(code));}catch{}
    document.querySelectorAll("[data-kg-watch-region]").forEach(item=>{item.value=code;const section=item.closest("[data-kg-legal-watch]");if(!section)return;providerData(section.dataset.filmId).then(all=>renderRegion(section,all,code)).catch(()=>{});});
  });
  window.KGLegalWatch=Object.freeze({markup});
})();
