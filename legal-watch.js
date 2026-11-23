/* Compact legal streaming links shared by every film detail card. */
(function(){
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
  const regions=["PL","US","GB","CA","AU","DE","FR","IT","ES","NL","SE","DK","NO","FI","PT","IE","CZ","HU","RO","TR","JP","KR","IN","BR","MX","AR","UA","RU","NZ","ZA"];
  const countryNames = new Intl.DisplayNames(["ru"], {type:"region"});
  const countryName = code => countryNames.of(code);
  const regionOptions = regions.map(code => ({code, name:countryName(code)}))
    .sort((a,b) => a.name.localeCompare(b.name, "ru"));
  const normalizeRegion = value => regions.includes(value) ? value : "auto";
  let selectedRegion = normalizeRegion(store.get("kgWatchRegion", "auto"));

  function region(){
    if (selectedRegion !== "auto") return selectedRegion;
    const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
    const zones={
      "Europe/Warsaw":"PL","Europe/Kyiv":"UA","Europe/Kiev":"UA","Europe/Moscow":"RU",
      "Europe/Berlin":"DE","Europe/Paris":"FR","Europe/London":"GB","Europe/Brussels":"BE",
      "Europe/Vienna":"AT","Europe/Zurich":"CH","Europe/Amsterdam":"NL","Europe/Rome":"IT",
      "Europe/Madrid":"ES","Europe/Lisbon":"PT","Europe/Athens":"GR","Europe/Prague":"CZ",
      "Europe/Budapest":"HU","Europe/Bucharest":"RO","Europe/Sofia":"BG","Europe/Stockholm":"SE",
      "Europe/Oslo":"NO","Europe/Copenhagen":"DK","Europe/Helsinki":"FI","Europe/Dublin":"IE",
      "Europe/Tallinn":"EE","Europe/Riga":"LV","Europe/Vilnius":"LT","Europe/Istanbul":"TR",
      "America/New_York":"US","America/Chicago":"US","America/Denver":"US","America/Phoenix":"US",
      "America/Los_Angeles":"US","America/Anchorage":"US","Pacific/Honolulu":"US",
      "America/Toronto":"CA","America/Vancouver":"CA","America/Edmonton":"CA","America/Winnipeg":"CA",
      "America/Halifax":"CA","America/St_Johns":"CA","America/Mexico_City":"MX","America/Sao_Paulo":"BR",
      "America/Argentina/Buenos_Aires":"AR","Asia/Tokyo":"JP","Asia/Seoul":"KR","Asia/Kolkata":"IN",
      "Asia/Singapore":"SG","Asia/Bangkok":"TH","Asia/Dubai":"AE","Asia/Riyadh":"SA",
      "Asia/Jerusalem":"IL","Asia/Shanghai":"CN","Asia/Hong_Kong":"HK","Asia/Taipei":"TW",
      "Australia/Sydney":"AU","Australia/Perth":"AU","Australia/Adelaide":"AU",
      "Pacific/Auckland":"NZ","Africa/Cairo":"EG","Africa/Johannesburg":"ZA","Africa/Lagos":"NG"
    };
    if(zones[zone])return zones[zone];
    const locales=[navigator.language,...(navigator.languages||[])];
    for(const locale of locales){
      try {
        const code = new Intl.Locale(locale).region;
        if (/^[A-Z]{2}$/.test(code||"")) return code;
      } catch (_) {}
    }
    return "";
  }
  function markup(id){
    const safeId=String(id||"").replace(/[^0-9]/g,"");
    return safeId?`<div class="kgw-row" data-kg-legal-watch data-film-id="${safeId}" aria-label="${uiText("Легальные сервисы просмотра")}" hidden></div>`:"";
  }
  function styles(){
    if(document.getElementById("kg-legal-watch-style"))return;
    const style=document.createElement("style");style.id="kg-legal-watch-style";
    style.textContent=`.kgw-row{display:flex;align-items:center;gap:10px;min-height:46px;margin-top:9px}.kgw-service{display:inline-flex;width:44px;height:44px;align-items:center;justify-content:center;flex:none;overflow:hidden;border:1px solid rgb(var(--kg-accent-muted)/0.21961);border-radius:12px;background:linear-gradient(145deg,rgb(var(--kg-neutral-79)),rgb(var(--kg-neutral-39)));box-shadow:0 3px 12px rgb(var(--kg-black)/0.26667);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.kgw-service:hover,.kgw-service:focus-visible{transform:translateY(-2px);border-color:rgb(var(--kg-primary-fixed-dim));box-shadow:0 5px 16px rgb(var(--kg-black)/0.46667);outline:none}.kgw-service img{display:block;width:100%;height:100%;padding:4px;object-fit:contain;border-radius:11px;background:transparent}.kgw-service-fallback{display:grid;place-items:center;width:100%;height:100%;color:rgb(var(--kg-accent-warm));font:700 14px/1 system-ui,sans-serif}.kgw-info{display:grid;gap:6px;font-size:12px}.kgw-links{display:flex;flex-wrap:wrap;gap:8px}.kgw-info a:not(.kgw-service){text-decoration:underline}.kgw-row[hidden]{display:none}@media(min-width:640px){.kgw-row{gap:11px}.kgw-service{width:48px;height:48px}}`;
    document.head.appendChild(style);
  }
  async function providerData(id){
    if(cache.has(id))return cache.get(id);
    const promise=(async()=>{let key="";try{key=apiKey||"";}catch{}if(!key)throw new Error("missing TMDB key");const response=await movieCatalog.request(`https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}/watch/providers?api_key=${encodeURIComponent(key)}`);if(!response.ok)throw new Error(`TMDB ${response.status}`);const json=await response.json();return json.results||{};})().catch(error=>{cache.delete(id);throw error;});
    cache.set(id,promise);return promise;
  }
  function regionProviders(all,code) {
    const result = all[code] || {};
    const groups=["flatrate","free","ads","rent","buy"],seen=new Set(),providers=[];
    for(const group of groups)for(const provider of result[group]||[]){if(!seen.has(provider.provider_id)){seen.add(provider.provider_id);providers.push(provider);}}
    return providers;
  }
  async function providersFor(id) {
    const code=region();
    if (!code) return {region:code,names:[]};
    const all=await providerData(id);
    return {region:code,names:regionProviders(all,code).map(provider=>provider.provider_name).filter(Boolean)};
  }
  function render(section,all){
    const items=regionProviders(all,region()).slice(0,3);
    if(!items.length){section.innerHTML="";section.hidden=true;return;}
    const links=items.map(provider=>{
      const name=provider.provider_name||uiText("Сервис просмотра");
      const site=officialSites.find(([pattern])=>pattern.test(name))?.[1];
      const href=site||`https://apps.apple.com/search?term=${encodeURIComponent(name)}`;
      const logo=provider.logo_path?`<img src="https://image.tmdb.org/t/p/w92${escape(provider.logo_path)}" alt="${escape(name)}" loading="lazy">`:`<span class="kgw-service-fallback" aria-hidden="true">${escape(name.slice(0,2).toUpperCase())}</span>`;
      return `<a class="kgw-service" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escape(uiText("Открыть {name}", {name}))}" title="${escape(name)}">${logo}</a>`;
    }).join("");
    section.innerHTML = `<div class="kgw-info"><div class="kgw-links">${links}</div>
      <span class="text-text-muted">${uiText("Данные:")} <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">JustWatch</a></span></div>`;
    section.hidden=false;
  }
  function refresh(section){
    providerData(section.dataset.filmId).then(all=>{
      if(section.isConnected)render(section,all);
    }).catch(()=>{});
  }
  function hydrate(section){
    if(section.dataset.kgWatchReady)return;section.dataset.kgWatchReady="true";styles();
    refresh(section);
  }
  function setRegion(value) {
    selectedRegion = normalizeRegion(value);
    store.set("kgWatchRegion", selectedRegion);
    document.querySelectorAll("[data-kg-legal-watch]").forEach(refresh);
  }
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.("[data-kg-legal-watch]"))hydrate(node);node.querySelectorAll?.("[data-kg-legal-watch]").forEach(hydrate);} )));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.querySelectorAll("[data-kg-legal-watch]").forEach(hydrate);
  window.KGLegalWatch=Object.freeze({markup, providersFor, regionOptions, getRegion:() => selectedRegion, getRegionName:() => countryName(region()), getEffectiveRegion:region, setRegion});
})();
