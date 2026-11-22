/* Main-screen TV adapter. The live globe, filters and reel use the same DOM
 * and discovery engine as films; editorial film feeds stay in the film panel. */
(() => {
  const OFFSET=1_000_000_000_000;
  const genreLabels={'':'Любой жанр',10759:'Боевик и приключения',16:'Мультфильм',35:'Комедия',80:'Криминал',99:'Документальный',18:'Драма',10751:'Семейный',10762:'Детский',9648:'Детектив',10763:'Новости',10764:'Реалити-шоу',10765:'Фантастика и фэнтези',10766:'Мыльная опера',10767:'Ток-шоу',10768:'Война и политика',37:'Вестерн'};
  const filterKeys=new Set(['cats','countryFilters','year','yearTo','rmin','rmax','playMode','surprise','theme']);
  let active=false,home,panel,slots=[],states={},observer;
  const isSeriesId=id=>Number.isSafeInteger(Number(id)) && Number(id)>OFFSET && Number(id)<OFFSET+2_147_483_648;
  const rawId=id=>isSeriesId(id)?Number(id)-OFFSET:Number(id);
  function normalize(show){
    if(!show || !Number.isSafeInteger(Number(show.id)))return show;
    const id=isSeriesId(show.id)?Number(show.id):OFFSET+Number(show.id);
    const result={...show,id,_tmdbId:rawId(id),media_type:'tv',title:show.title||show.name||'',original_title:show.original_title||show.original_name||'',release_date:show.release_date||show.first_air_date||'',runtime:show.runtime||show.episode_run_time?.[0]||show.last_episode_to_air?.runtime||0};
    if(show.translations)result.translations={...show.translations,translations:(show.translations.translations||[]).map(t=>({...t,data:{...t.data,title:t.data?.title||t.data?.name||''}}))};
    if(show.created_by?.length){const credits=show.credits||{},crew=credits.crew||[];result.credits={...credits,crew:[...show.created_by.map(p=>({...p,job:'Director'})),...crew.filter(p=>!show.created_by.some(c=>c.id===p.id))]};}
    if(show.content_ratings)result.release_dates={results:(show.content_ratings.results||[]).map(r=>({iso_3166_1:r.iso_3166_1,release_dates:[{certification:r.rating}]}))};
    return result;
  }
  function route(url){
    const movie=/^\/3\/movie\/(\d+)(\/.*)?$/.exec(url.pathname);
    if(movie && isSeriesId(movie[1])){
      url.pathname=`/3/tv/${rawId(movie[1])}${movie[2]||''}`;
      if(url.searchParams.has('append_to_response'))url.searchParams.set('append_to_response',url.searchParams.get('append_to_response').split(',').map(x=>x==='release_dates'?'content_ratings':x).join(','));
    }
    return url;
  }
  function normalizeResponse(data,endpoint){
    if(/^tv\/\d+$/.test(endpoint))return normalize(data);
    if(/^(?:discover\/tv|search\/tv|tv\/\d+\/(?:recommendations|similar))$/.test(endpoint) && Array.isArray(data?.results))return {...data,results:data.results.map(normalize)};
    return data;
  }
  function query(params){
    const mapped={...params};
    for(const [film,tv] of [['primary_release_date.gte','first_air_date.gte'],['primary_release_date.lte','first_air_date.lte'],['primary_release_year','first_air_date_year']])if(film in mapped){mapped[tv]=mapped[film];delete mapped[film];}
    return mapped;
  }
  async function discover(params,options={}){
    const result=await requestTmdb('discover/tv',{language:filmLocale,sort_by:'vote_average.desc',include_adult:'false',...query(params)},options);
    if(result.results)result.results=result.results.map(localizeFilmListItem);
    return result;
  }
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const savedSeriesState=()=>({cats:read('series.cats',[]),countries:read('series.countryFilters',[]),year:read('series.year',''),yearTo:read('series.yearTo',''),rmin:read('series.rmin','6'),rmax:read('series.rmax',''),mode:read('series.playMode','filters'),surprise:read('series.surprise','light'),quick:'',theme:''});
  function mount(filmPanel,seriesPanel){
    home=filmPanel;panel=seriesPanel;panel.replaceChildren();panel.className=home.className;panel.classList.add('kg-series-page');
    slots=[...home.children].filter(node=>!['kg-home-releases','kg-home-editorial'].includes(node.id)).map(node=>{const slot=document.createComment('shared discovery frame');node.before(slot);return {node,slot};});
    states.tv=savedSeriesState();
    window.KGSeriesHub?.mount(panel);
  }
  function refreshLabels(){
    for(const [id,source] of [['btn-top-one',active?'Топ-1 сериалов':'Топ-1 всех времён'],['btn-oscar-laureate',active?'Лауреат Эмми':'Лауреат Оскар']]){
      const label=document.querySelector(`#${id} span:last-child`),text=uiText(source);
      if(label&&label.textContent!==text)label.textContent=text;
    }
    if(!active)return;
    const roots=['kg-globe-empty-hint','btn-spin-text','surprise-description-text','err','reel-frame-counter'];
    for(const id of roots){const node=document.getElementById(id);if(!node)continue;const walk=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;while(text=walk.nextNode()){
      const changed=text.nodeValue.replace(/фильмов/g,'сериалов').replace(/фильмами/g,'сериалами').replace(/фильмы/g,'сериалы').replace(/фильма/g,'сериала').replace(/фильм/g,'сериал').replace(/Фильм/g,'Сериал').replace(/movies/gi,'series').replace(/movie/gi,'series').replace(/\bfilms?\b/gi,'series');
      if(changed!==text.nodeValue)text.nodeValue=changed;
    }}
  }
  function setMode(series){
    if(series===active)return true;
    const bridge=window.KGDiscoveryBridge;if(!bridge || bridge.busy())return false;
    states[active?'tv':'movie']=bridge.snapshot();
    bridge.reset();active=series;
    if(active)for(const {node} of slots)panel.insertBefore(node,panel.querySelector('#kg-series-hub'));
    else for(const {node,slot} of slots)slot.after(node);
    bridge.restore(states[active?'tv':'movie']);
    document.documentElement.dataset.kgMedia=active?'tv':'movie';
    document.querySelector('[data-kg-search-open]')?.setAttribute('aria-label',uiText(active?'Поиск сериалов, актёров и режиссёров':'Поиск фильмов, актёров и режиссёров'));
    observer?.disconnect();
    if(active){observer=new MutationObserver(refreshLabels);observer.observe(panel,{subtree:true,childList:true,characterData:true});}
    refreshLabels();
    document.dispatchEvent(new CustomEvent('kg:media-change',{detail:{mediaType:active?'tv':'movie'}}));
    return true;
  }
  const records=kind=>read(`kgSeries.${kind}`,{});
  const isWatched=id=>!!records('watched')[Number(id)];
  const isBookmarked=id=>!!records('bookmarks')[Number(id)];
  async function toggleRecord(kind,id,film){
    id=Number(id);let saved=records(kind);const enabled=!saved[id];
    if(!enabled && !await window.KGConfirmRemoval({kind:kind==='watched'?'watched':'bookmark',title:film?.title||saved[id]?.title}))return !!records(kind)[id];
    saved=records(kind);
    if(enabled){if(!movieCatalog.allows({...film,id}))return false;const {_watchLog,...source}=film;saved[id]={...source,id,media_type:'tv',_tmdbId:rawId(id),savedAt:new Date().toISOString(),...(kind==='watched'?(window.KGWatchEntry?.metadata(_watchLog)||{watchedAt:new Date().toISOString()}):{})};}
    else delete saved[id];
    write(`kgSeries.${kind}`,saved);
    if(kind==='bookmarks')document.querySelectorAll(`[data-kg-bookmark="${id}"]`).forEach(button=>paintBookmarkButton(button,enabled));
    document.dispatchEvent(new CustomEvent(kind==='watched'?'kg:watched-change':'kg-bookmark-change',{detail:{id,enabled,mediaType:'tv'}}));
    return enabled;
  }
  // Namespace TV IDs and actions so equal TMDB movie/TV IDs never share marks.
  const originalWatched=window.KGIsFilmWatched,originalToggleWatched=window.KGToggleWatched;
  window.KGIsFilmWatched=id=>isSeriesId(id)?isWatched(id):originalWatched?.(id);
  window.KGToggleWatched=film=>isSeriesId(film?.id)?toggleRecord('watched',film.id,film):originalToggleWatched(film);
  const originalBookmark=window.kgIsBookmarked,originalToggleBookmark=window.kgToggleBookmark;
  window.kgIsBookmarked=id=>isSeriesId(id)?isBookmarked(id):originalBookmark(id);
  window.kgToggleBookmark=(id,film)=>isSeriesId(id)?toggleRecord('bookmarks',id,film):originalToggleBookmark(id,film);
  window.KGSeries={get active(){return active;},genreLabels,isSeriesId,rawId,normalize,route,normalizeResponse,query,discover,mount,setMode,isWatched,watchedList:()=>Object.values(records("watched")),bookmarkList:()=>Object.values(records("bookmarks")),bookmarkIds:()=>Object.keys(records("bookmarks")).map(Number).filter(isSeriesId),storageKey:key=>active && filterKeys.has(key)?'series.'+key:key};
})();
