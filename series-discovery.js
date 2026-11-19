/* TV-only discovery rules. The shared globe, reel, audio and card flow stay in index.html. */
(() => {
  const MIN_VOTES=200,RECENT_KEY='kgSeries.emmy.recent.v1';
  const notes={
    light:'Неочевидный сериал: случайные страна и жанр, оценка от 7 и минимум 200 оценок. Просмотренное исключено.',
    find:'Скрытая жемчужина: оценка от 7, от 30 до 1500 оценок и небольшая популярность. Просмотренное исключено.',
    wild:'Необычный жанр и случайная страна. Оценка от 7 и минимум 50 оценок. Просмотренное исключено.'
  };
  const categories={drama:'Лучший драматический сериал',comedy:'Лучший комедийный сериал',limited:'Лучший мини-сериал или антология',series:'Лучший сериал',animation:'Лучший анимационный сериал',acting:'Награда за актёрскую игру',lead:'Лучшая главная роль',supporting:'Лучшая роль второго плана',guest:'Лучшая гостевая роль',voice:'Лучшая озвучка',directing:'Награда за режиссуру',writing:'Награда за сценарий'};
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
    // Verified lightweight snapshots keep discovery independent of catalogue size.
    // Fresh details for the chosen series are loaded before the shared reel presents it.
    return window.KGEmmyWinners.entries.map(entry=>{
      if(!entry.film)return null;
      const f=window.KGSeries.normalize({...entry.film,title:filmLocale.startsWith('ru')?entry.film.title:(entry.film.title_en||entry.film.original_title)});
      return movieCatalog.allows(f)?{...f,_emmyAwards:entry.awards}:null;
    }).filter(Boolean);
  }
  function recentIds(){
    try{const value=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');return Array.isArray(value)?value.filter(Number.isSafeInteger).slice(-30):[];}catch{return [];}
  }
  function remember(id){
    try{const ids=recentIds().filter(previous=>previous!==id);localStorage.setItem(RECENT_KEY,JSON.stringify([...ids,id].slice(-30)));}catch{}
  }
  function candidates(all){
    const left=all.filter(f=>!window.KGSeries.isWatched(f.id)),recent=recentIds();
    const unused=left.filter(f=>!recent.includes(f.id)),available=unused.length?unused:left;
    if(!available.length)return [];
    const previous=all.find(f=>f.id===recent.at(-1));
    const decade=f=>Math.floor(Number((f.release_date||'').slice(0,4))/10)*10;
    const decades=[...new Set(available.map(decade))],other=decades.filter(d=>d!==decade(previous||{}));
    const chosen=pick(other.length?other:decades),era=available.filter(f=>decade(f)===chosen);
    const varied=previous?era.filter(f=>f.genre_ids?.[0]!==previous.genre_ids?.[0]):era;
    const first=pick(varied.length?varied:era);
    return [first,...shuffle(available.filter(f=>f.id!==first.id))];
  }
  function awardText(film){
    const awards=film._emmyAwards||window.KGEmmyWinners.entries.find(e=>e.id===window.KGSeries.rawId(film.id))?.awards;
    const main=awards?.filter(a=>['drama','comedy','limited','series','animation'].includes(a.category));
    const award=(main?.length?main:awards)?.at(-1);if(!award)return uiText('Лауреат «Эмми»');
    return uiText('Эмми · {category} · {year}',{category:uiText(categories[award.category]),year:award.year})+(award.season?' · '+uiText('Сезон {season}',{season:award.season}):'');
  }
  async function spinEmmy(){
    if($('go').disabled)return;
    $('err').textContent='';
    if(!apiKey){showKeyUi();$('err').textContent=uiText('Сначала введите ключ TMDB.');return;}
    audio();lockSpin(uiText('Ищем сериал…'));
    try{
      reelStart();
      const all=await emmySeries(),left=candidates(all);
      if(!all.length)throw new Error(uiText('Не удалось загрузить лауреатов «Эмми». Повторите поиск.'));
      if(!left.length){$('err').textContent=uiText('Все лауреаты «Эмми» из списка уже отмечены просмотренными.');return;}
      let film,lastError;
      for(const candidate of left.slice(0,3)){
        try{
          const d=await filmDetails(candidate.id);
          const fresh={...candidate,adult:d.adult,title:d.title||candidate.title,original_title:d.originalTitle||candidate.original_title,
            release_date:d.release||candidate.release_date,poster_path:d.posterPath||candidate.poster_path,vote_count:d.votes,vote_average:d.average};
          if(!movieCatalog.allows(fresh))continue;
          film=fresh;break;
        }catch(error){lastError=error;}
      }
      if(!film)throw lastError||new Error(uiText('Не удалось загрузить лауреатов «Эмми». Повторите поиск.'));
      const cc=film.origin_country?.[0]||'US';
      await presentFilmSearchResult(cc,{films:[...shuffle(left.filter(f=>f.id!==film.id)).slice(0,40),film],emmy:true,total:all.length,votes:film.vote_count||0},film,false);
      remember(film.id);
    }catch(error){$('err').textContent=error.message;}
    finally{reelAbort();unlockSpin();}
  }
  window.KGSeriesDiscovery={MIN_VOTES,candidates,remember,spinEmmy,notes,surpriseQuery,surprisePool,qualifies,countryOrder,topParams,emmySeries,awardText};
})();
