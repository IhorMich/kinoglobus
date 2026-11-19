/* TV-only discovery rules. The shared globe, reel, audio and card flow stay in index.html. */
(() => {
  const MIN_VOTES=200,cache=new Map();
  const notes={
    light:'Неочевидный сериал: случайные страна и жанр, оценка от 7 и минимум 200 оценок. Просмотренное исключено.',
    find:'Скрытая жемчужина: оценка от 7, от 30 до 1500 оценок и небольшая популярность. Просмотренное исключено.',
    wild:'Необычный жанр и случайная страна. Оценка от 7 и минимум 50 оценок. Просмотренное исключено.'
  };
  const categories={drama:'Лучший драматический сериал',comedy:'Лучший комедийный сериал',limited:'Лучший мини-сериал или антология'};
  const unusual=['10765','9648','37','16','99','10768'];
  const genres=['10759','16','35','80','99','18','10751','9648','10765','10768','37'];
  function surpriseQuery(level){
    if(!Object.hasOwn(notes,level))level='light';
    return {g:pick(level==='wild'?unusual:genres),seriesSurprise:level,worst:false,rmin:'7',rmax:'',y:'',yto:'',theme:'',themeName:''};
  }
  function qualifies(f,level){
    const v=Number(f.vote_count),r=Number(f.vote_average),p=Number(f.popularity);
    return movieCatalog.allows(f)&&Number.isInteger(v)&&Number.isFinite(r)&&r>=7&&r<=10&&v>=(level==='light'?200:level==='find'?30:50)&&
      (level!=='find'||v<=1500&&Number.isFinite(p)&&p>=0&&p<=25)&&!window.KGSeries.isWatched(f.id);
  }
  async function surprisePool(cc,o){
    const level=o.seriesSurprise,minimum=level==='light'?200:level==='find'?30:50;
    const params={with_origin_country:cc,with_genres:o.g,'vote_count.gte':minimum,'vote_average.gte':7,sort_by:'vote_average.desc'};
    if(level==='find')Object.assign(params,{'vote_count.lte':1500});
    const first=await window.KGSeries.discover({...params,page:1});
    const pages=Math.min(first.total_pages||0,5),rows=[...(first.results||[])];
    const rest=await Promise.all(Array.from({length:Math.max(0,pages-1)},(_,i)=>window.KGSeries.discover({...params,page:i+2})));
    rest.forEach(p=>rows.push(...(p.results||[])));
    const ids=new Set(),films=rows.filter(f=>!ids.has(f.id)&&ids.add(f.id)&&(!f.origin_country?.length||f.origin_country.includes(cc))&&(!o.g||f.genre_ids?.includes(Number(o.g)))&&qualifies(f,level));
    return films.length?{films,total:first.total_results,votes:minimum,seriesSurprise:level,scoreMin:7,byRating:true}:null;
  }
  function countryOrder(order,previous){return order.filter(cc=>cc!==previous).concat(order.includes(previous)?[previous]:[]);}
  function topParams(base){return {...base,'vote_count.gte':MIN_VOTES,'vote_average.gte':Math.max(7,Number(base['vote_average.gte'])||0)};}
  async function emmySeries(){
    const key=filmLocale,cached=cache.get(key);if(cached&&Date.now()-cached.time<86400000)return cached.rows.slice();
    const rows=[];let failed=false;
    const entries=window.KGEmmyWinners.entries;
    for(let i=0;i<entries.length;i+=6){
      const results=await Promise.allSettled(entries.slice(i,i+6).map(async entry=>{
        const f=await requestTmdb(`tv/${entry.id}`,{language:filmLocale},{fresh:true});
        if(window.KGSeries.rawId(f.id)!==entry.id||!movieCatalog.allows(f)||(f.release_date||'').slice(0,4)!==String(entry.startYear))throw new Error('EMMY_UNVERIFIED');
        return {...localizeFilmListItem(f),genre_ids:(f.genres||[]).map(g=>g.id),_emmyAwards:entry.awards};
      }));
      for(const result of results)if(result.status==='fulfilled')rows.push(result.value);else failed=true;
    }
    if(!rows.length)throw new Error(uiText('Не удалось загрузить лауреатов «Эмми». Повторите поиск.'));
    if(!failed)cache.set(key,{time:Date.now(),rows});return rows;
  }
  function awardText(film){
    const awards=film._emmyAwards||window.KGEmmyWinners.entries.find(e=>e.id===window.KGSeries.rawId(film.id))?.awards;
    const award=awards?.at(-1);if(!award)return uiText('Лауреат «Эмми»');
    return uiText('Эмми · {category} · {year}',{category:uiText(categories[award.category]),year:award.year})+(award.season?' · '+uiText('Сезон {season}',{season:award.season}):'');
  }
  async function spinEmmy(){
    if($('go').disabled)return;
    $('err').textContent='';
    if(!apiKey){showKeyUi();$('err').textContent=uiText('Сначала введите ключ TMDB.');return;}
    audio();lockSpin(uiText('Ищем сериал…'));
    try{
      reelStart();
      const all=await emmySeries(),left=all.filter(f=>!window.KGSeries.isWatched(f.id));
      if(!left.length){$('err').textContent=uiText('Все лауреаты «Эмми» из списка уже отмечены просмотренными.');return;}
      const film=pick(left),cc=film.origin_country?.[0]||film.production_countries?.[0]?.iso_3166_1||'US';
      await presentFilmSearchResult(cc,{films:[...shuffle(left.filter(f=>f.id!==film.id)).slice(0,40),film],emmy:true,total:all.length,votes:film.vote_count||0},film,false);
    }catch(error){$('err').textContent=error.message;}
    finally{reelAbort();unlockSpin();}
  }
  window.KGSeriesDiscovery={MIN_VOTES,spinEmmy,notes,surpriseQuery,surprisePool,qualifies,countryOrder,topParams,emmySeries,awardText};
})();
