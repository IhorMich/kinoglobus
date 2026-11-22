(() => {
  const limit=250, minVotes=200, ttl=3600000;
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const label=(key,params)=>esc(uiText(key,params));
  const icon=name=>`<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  const art=(path,size)=>/^\/[\w.-]+$/.test(path||"")?`https://image.tmdb.org/t/p/${size}${path}`:"";
  function goldImage(primary,fallback,lazy=false){
    const source=primary||fallback;
    const backup=primary&&fallback&&primary!==fallback?fallback:"";
    return `<span class="kg-gold-image" aria-hidden="true">${icon("movie")}${source?`<img data-gold-image src="${esc(source)}" alt="" decoding="async"${lazy?' loading="lazy"':""}${backup?` data-gold-fallback="${esc(backup)}"`:""}>`:""}</span>`;
  }
  const year=show=>Number(show.first_air_date?.slice(0,4))||0;
  const score=show=>Number(show.vote_average||0).toFixed(1);
  const number=value=>new Intl.NumberFormat(interfaceLanguage).format(value);
  const eras=[["all","Все эпохи",0,9999],["classic","До 2000",1,1999],["gold","2000–2015",2000,2015],["recent","С 2016 года",2016,9999]];
  const rank=(a,b)=>Number(b.vote_average)-Number(a.vote_average)||Number(b.vote_count)-Number(a.vote_count)||a.id-b.id;
  const genreOrder=[80,10765,10768,9648,35,18,16,10759,10751,99];
  const milestones=[25,50,100,175,250];
  let root, back, snapshot, generation=0, era="all", genre="all", sort="rating", layout="list", shown=5, phase="", episodePhase="";
  const metadata=new Map();
  let minis=[];
  let entries=[], episodes=[], episodeRequest=0, dailyTimer, displayedDay;

  function localDay(date){
    return Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
  }

  function dailySeries(day){
    if(!entries.length)return null;
    const pool=[...entries].sort((a,b)=>a.id-b.id);
    // Step through the full pool in a varied order before repeating any series.
    const index=day*(pool.length===limit?73:1)%pool.length;
    return pool[index];
  }

  function refreshDaily(){
    clearTimeout(dailyTimer);
    if(root.hidden)return;
    const now=new Date();
    if(entries.length&&displayedDay!==localDay(now)){
      render();
      updateVisibleDetails();
    }
    const midnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    dailyTimer=setTimeout(refreshDaily,midnight-now);
  }

  async function loadRanking(){
    const params={sort_by:"vote_average.desc","vote_count.gte":minVotes,without_genres:"10763,10764,10767"};
    const fetchPage=page=>window.KGSeries.discover({...params,page});
    const first=await fetchPage(1);
    const items=new Map();
    const add=result=>{
      for(const show of result.results||[]){
        if(window.KGSeries.isSeriesId(show.id)&&movieCatalog.allows(show)&&Number(show.vote_average)>0&&Number(show.vote_count)>=minVotes)items.set(show.id,show);
      }
    };
    add(first);
    const last=Math.min(500,Number(first.total_pages)||1);
    let frontier=first;
    for(let page=2;page<=last;page+=4){
      const cutoff=items.size>=limit?Number([...items.values()].sort(rank)[limit-1].vote_average):0;
      const lastRating=frontier._kgRankingPage?.rMin??Math.min(...(frontier.results||[]).map(show=>Number(show.vote_average)));
      if(cutoff&&lastRating<cutoff)break;
      const pages=await Promise.all(Array.from({length:Math.min(4,last-page+1)},(_,index)=>fetchPage(page+index)));
      pages.forEach(add);
      frontier=pages.at(-1);
    }
    return [...items.values()].sort(rank).slice(0,limit).map((show,index)=>({...show,_goldRank:index+1}));
  }

  const inEra=(show,id)=>{
    const [,,from,to]=eras.find(row=>row[0]===id);
    return id==="all"||year(show)>=from&&year(show)<=to;
  };
  const inGenre=(show,id)=>id==="all"||show.genre_ids?.includes(Number(id));
  const visible=()=>{
    const rows=entries.filter(show=>inEra(show,era)&&inGenre(show,genre));
    if(sort==="votes")rows.sort((a,b)=>Number(b.vote_count)-Number(a.vote_count)||a._goldRank-b._goldRank);
    if(sort==="new")rows.sort((a,b)=>year(b)-year(a)||a._goldRank-b._goldRank);
    return rows;
  };
  const watched=show=>!!window.KGIsFilmWatched(show.id);
  const watchedButton=(show,hero=false)=>`<button type="button" data-gold-watch="${show.id}" data-gold-focus="watch-${hero?"hero":"row"}-${show.id}" aria-pressed="${watched(show)}" aria-label="${label(watched(show)?"Убрать отметку о просмотре":"Отметить как просмотренный")}">${icon(watched(show)?"check":"add")}${hero?label(watched(show)?"Просмотрено":"Отметить просмотренным"):""}</button>`;

  const genreLabel=id=>window.KGSeries.genreLabels[id]||"";
  function tags(show){
    return (show.genre_ids||[]).slice(0,3).map(id=>genreLabel(id)).filter(Boolean)
      .map(name=>`<span>${label(name)}</span>`).join("");
  }
  function detailsLine(show){
    const detail=metadata.get(show.id);
    const last=detail?.last_air_date?.slice(0,4);
    const dates=year(show)?[year(show),last&&last!==String(year(show))?last:null].filter(Boolean).join("–"):"";
    return [
      detail?.networks?.[0]?.name,dates,
      detail?.number_of_seasons?uiText("Сезонов: {count}",{count:detail.number_of_seasons}):"",
      detail?.number_of_episodes?uiText("Серий: {count}",{count:detail.number_of_episodes}):""
    ].filter(Boolean).map(esc).join(" · ");
  }
  function progress(count){
    const next=milestones.find(value=>value>count&&value<=entries.length);
    const percent=new Intl.NumberFormat(interfaceLanguage,{style:"percent",maximumFractionDigits:1}).format(count/entries.length);
    return `<section class="kg-gold-progress">
      <strong>${icon("verified")}${label("Мой прогресс")}</strong>
      <div class="kg-gold-progress-copy"><span>${label("Просмотрено {count} из {total}",{count:number(count),total:number(entries.length)})}</span><b>${percent}</b></div>
      <progress max="${entries.length}" value="${count}" aria-label="${label("Мой прогресс")}"></progress>
      ${next?`<div class="kg-gold-progress-copy kg-gold-muted"><span>${label("Следующая веха: {count}",{count:next})}</span><span>${label("Осталось: {count}",{count:next-count})}</span></div>`:""}
    </section>`;
  }
  function miniSeriesGroup(){
    const rows=minis.filter(show=>inEra(show,era)&&inGenre(show,genre));
    if(!rows.length)return "";
    return `<section class="kg-gold-episode-group kg-gold-mini-group"><header><h2>${label("Культовые мини-сериалы")}</h2><span>${number(rows.length)}</span></header>
      <div class="kg-gold-episode-strip" data-gold-rail="minis">${rows.map(show=>`<article class="kg-gold-mini">
          <button type="button" class="kg-gold-mini-open" data-gold-open="${show.id}">
            ${goldImage(art(show.backdrop_path,"w780"),art(show.poster_path,"w342"))}
            <span class="kg-gold-mini-copy"><strong>${esc(show.title)}</strong><small>${detailsLine(show)}</small><span>★ ${score(show)}</span></span>
          </button>
          <div class="kg-gold-mini-actions">${watchedButton(show)}${kgBookmarkButton(show)}</div>
        </article>`).join("")}</div></section>`;
  }

  function pageHeader(count){
    return `<header class="kg-gold-heading">
      <div class="relative z-30 bg-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgb(var(--kg-black)/0.65)]">
        <div class="h-14 px-gutter-mobile flex items-center justify-between gap-space-sm">
          <div class="flex items-center gap-space-sm min-w-0">
            <button type="button" data-gold-back class="kg-gold-back w-11 h-11 -ml-1.5 flex items-center justify-center rounded-full text-on-surface hover:text-primary transition-colors shrink-0" aria-label="${label("Назад")}">${icon("arrow_back")}</button>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5 min-w-0 text-primary">
                ${icon("military_tech")}<span class="font-headline-sm text-headline-sm tracking-tight truncate">${label("Золотой фонд")}</span>
              </div>
              <span class="font-micro-caption text-micro-caption text-text-muted">${label("Рейтинг TMDB")}</span>
            </div>
          </div>
          ${entries.length?`<button type="button" data-gold-filters class="kg-gold-filter-jump w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-colors shrink-0" aria-label="${label("Поиск и фильтры")}">${icon("tune")}</button>`:""}
        </div>
      </div>
      <div class="w-full px-gutter-mobile pt-space-md">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-panel to-surface-container-lowest p-space-lg shadow-xl shadow-canvas-obsidian/80">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cinema-amber-glow blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-cinema-velvet-glow blur-3xl pointer-events-none"></div>
          <div class="relative">
            <div class="kg-gold-cover relative h-56 rounded-2xl overflow-hidden shadow-xl">
              <img src="./assets/series-gold/gold-hero.webp" width="1376" height="768" alt="" class="w-full h-full object-cover object-center">
              <div class="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/90 via-canvas-obsidian/40 to-transparent"></div>
              <div class="kg-gold-heading-copy absolute bottom-3 left-0 right-0 flex flex-col items-center px-4">
                <span class="px-2.5 py-0.5 rounded-full bg-surface-panel/90 text-primary font-micro-caption text-micro-caption font-semibold tracking-wider mb-1">${label("ТОП-250")}</span>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight drop-shadow">${label("Золотой фонд TV")}</h1>
                <p class="font-body-sm text-body-sm text-primary-fixed/90 text-center leading-snug max-w-sm">${label("От классики до современных хитов. 250 лучших сериалов по рейтингу TMDB.")}</p>
              </div>
            </div>
            ${entries.length?progress(count):""}
          </div>
        </div>
      </div>
    </header>`;
  }

  function hero(show){
    return `<section class="kg-gold-daily" aria-labelledby="kg-gold-daily-title">
      <header>
        <div class="flex items-center gap-1.5 text-primary">${icon("auto_awesome")}<h2 id="kg-gold-daily-title" class="text-on-surface">${label("Сериал дня")}</h2></div>
        <span class="font-micro-caption text-micro-caption px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-semibold">${label("№ {rank} в топ-250",{rank:number(show._goldRank)})}</span>
      </header>
      <article class="kg-gold-hero">
      <div class="kg-gold-hero-art">
        <button type="button" data-gold-open="${show.id}" aria-label="${esc(show.title)}">${goldImage(art(show.backdrop_path,"w780"),art(show.poster_path,"w500"))}</button>
        ${kgBookmarkButton(show)}
        <div class="kg-gold-score">★ ${score(show)} <small>${number(show.vote_count)} ${label("оценок TMDB")}</small></div>
      </div>
      <div class="kg-gold-hero-body">
        <button type="button" class="kg-gold-title" data-gold-open="${show.id}">${esc(show.title)}</button>
        ${show.original_title&&show.original_title!==show.title?`<p class="kg-gold-original">${esc(show.original_title)}</p>`:""}
        <p class="kg-gold-muted">${detailsLine(show)}</p>
        ${show.overview?`<p class="kg-gold-summary">${esc(show.overview)}</p>`:""}
        <div class="kg-gold-tags">${tags(show)}</div>
        <div class="kg-gold-actions">${watchedButton(show,true)}<button type="button" data-gold-open="${show.id}" data-gold-seasons>${icon("view_list")}${label("Сезоны и серии")}</button></div>
      </div>
    </article></section>`;
  }

  function card(show){
    return `<article class="kg-gold-card">
      <button type="button" class="kg-gold-card-open" data-gold-open="${show.id}">
        <span class="kg-gold-poster">${goldImage(art(show.poster_path,"w185"),art(show.backdrop_path,"w300"),true)}<span class="kg-gold-rank">#${show._goldRank}</span></span>
        <span class="kg-gold-card-copy"><strong>${esc(show.title)}</strong><small>${detailsLine(show)}</small><span class="kg-gold-tags">${tags(show)}</span><span>★ ${score(show)} <small>· ${number(show.vote_count)} ${label("оценок TMDB")}</small></span></span>
      </button>
      ${watchedButton(show)}
    </article>`;
  }

  function episodeGroup(kind,title){
    const rows=episodes.filter(row=>row.kind===kind);
    if(!rows.length)return "";
    const isPilot=kind==="pilot";
    return `<section class="kg-gold-episode-group"><h2>${label(title)}</h2><p class="kg-gold-muted">${label("Из сериалов Золотого фонда")}</p><div ${isPilot?'class="kg-gold-episode-strip" data-gold-rail="pilots"':'class="kg-gold-finale-list"'}>
      ${rows.map(row=>{
        const {show,episode}=row;
        return `<button type="button" class="kg-gold-episode" data-gold-episode="${row.key}">
          ${isPilot?goldImage(art(episode.still_path,"w300"),art(show.backdrop_path,"w300")||art(show.poster_path,"w342")):""}
          <span><strong>${esc(episode.name||show.title)}</strong><small>${esc(show.title)} · S${episode.season_number}E${episode.episode_number}</small></span>
          <b>★ ${score(episode)}</b>
        </button>`;
      }).join("")}
    </div></section>`;
  }

  function render(){
    if(root.hidden)return;
    const rows=visible(), count=entries.filter(watched).length;
    displayedDay=localDay(new Date());
    const featured=dailySeries(displayedDay);
    const focus=root.contains(document.activeElement)?document.activeElement.dataset.goldFocus:null;
    const railPositions=new Map(Array.from(root.querySelectorAll("[data-gold-rail]"),rail=>[rail.dataset.goldRail,rail.scrollLeft]));
    root.innerHTML=`
      ${pageHeader(count)}
      ${featured?hero(featured):""}
      ${entries.length?`<div class="kg-gold-filters" data-gold-rail="eras" role="group" aria-label="${label("Эпохи")}">${eras.map(([id,title])=>{
        const total=entries.filter(show=>inEra(show,id)&&inGenre(show,genre)).length;
        return `<button type="button" data-gold-era="${id}" data-gold-focus="era-${id}" aria-pressed="${era===id}">${label(title)} (${number(total)})</button>`;
      }).join("")}</div>
      <div class="kg-gold-filters kg-gold-genres" data-gold-rail="genres" role="group" aria-label="${label("Жанры")}">${["all",...genreOrder].map(id=>{
        const total=entries.filter(show=>inEra(show,era)&&inGenre(show,String(id))).length;
        return total||genre===String(id)?`<button type="button" data-gold-genre="${id}" data-gold-focus="genre-${id}" aria-pressed="${genre===String(id)}">${label(id==="all"?"Все жанры":genreLabel(id))} (${number(total)})</button>`:"";
      }).join("")}</div>
      <div class="kg-gold-toolbar">
      <label class="kg-gold-sort">${icon("swap_vert")}<select data-gold-sort data-gold-focus="sort" aria-label="${label("Сортировка:")}">${[["rating","По рейтингу"],["votes","По числу голосов"],["new","Свежие"]].map(([id,title])=>`<option value="${id}" ${sort===id?"selected":""}>${label(title)}</option>`).join("")}</select><span class="kg-gold-sort-chevron" aria-hidden="true"></span></label>
      <div role="group" aria-label="${label("Вид списка")}">${[["list","view_list","Списком"],["grid","grid_view","Сеткой"]].map(([id,symbol,title])=>`<button type="button" data-gold-layout="${id}" data-gold-focus="layout-${id}" aria-pressed="${layout===id}" aria-label="${label(title)}">${icon(symbol)}</button>`).join("")}</div></div>`:""}
      ${phase?`<p class="kg-gold-muted" role="status">${label(phase==="loading"?"Загружаем сериалы…":phase==="key"?"Добавьте ключ TMDB, чтобы загрузить сериалы подборки.":"Не удалось загрузить сериалы. Попробуйте ещё раз.")}</p>`:""}
      ${phase==="error"?`<button type="button" class="kg-gold-button" data-gold-retry>${label("Повторить")}</button>`:""}
      ${!rows.length&&!phase?`<p class="kg-gold-muted">${label("Подходящих сериалов не нашлось.")}</p>`:""}
      ${rows.length?`<section class="kg-gold-list"><header><h2>${label("Топ сериалов")}</h2><span>${number(rows.length)}</span></header>
        <div class="kg-gold-cards ${layout==="grid"?"is-grid":""}">${rows.slice(0,shown).map(card).join("")}</div>
        ${rows.length>shown?`<button type="button" class="kg-gold-button" data-gold-more data-gold-focus="more">${label("Показать ещё")}</button>`:""}</section>`:""}
      ${miniSeriesGroup()}
      ${era==="all"&&genre==="all"?episodeGroup("pilot","Величайшие пилоты")+episodeGroup("finale","Лучшие финалы"):""}
      ${entries.length&&era==="all"&&genre==="all"&&episodePhase==="loading"?`<p class="kg-gold-muted" role="status">${label("Загружаем эпизоды…")}</p>`:""}
      ${entries.length?`<footer class="kg-gold-footer">${label("Рейтинг, постеры и сведения об эпизодах предоставлены TMDB.")}</footer>`:""}`;
    for(const rail of root.querySelectorAll("[data-gold-rail]"))rail.scrollLeft=railPositions.get(rail.dataset.goldRail)??0;
    if(focus)root.querySelector(`[data-gold-focus="${focus}"]`)?.focus({preventScroll:true});
  }

  function loadDetails(show){
    if(!metadata.has(show.id)){
      const request=requestTmdb(`tv/${window.KGSeries.rawId(show.id)}`,{language:filmLocale})
        .then(details=>movieCatalog.allows(details)?details:null)
        .catch(()=>{if(metadata.get(show.id)===request)metadata.delete(show.id);return null;});
      metadata.set(show.id,request);
      request.then(details=>{if(details&&metadata.get(show.id)===request)metadata.set(show.id,details);});
    }
    return Promise.resolve(metadata.get(show.id));
  }

  async function updateVisibleDetails(){
    const request=generation;
    const shownRows=visible().slice(0,shown);
    const featured=dailySeries(displayedDay);
    if(featured&&!shownRows.includes(featured))shownRows.push(featured);
    const rows=shownRows.filter(show=>!metadata.has(show.id));
    for(let start=0;start<rows.length;start+=4){
      if(request!==generation||root.hidden)return;
      await Promise.all(rows.slice(start,start+4).map(loadDetails));
    }
    if(rows.length&&request===generation)render();
  }

  async function loadMinis(ranking,request){
    const cutoff=ranking.at(-1)?.vote_average;
    if(!cutoff)return;
    const params={with_type:2,sort_by:"vote_average.desc","vote_count.gte":minVotes,"vote_average.gte":cutoff};
    try{
      const first=await window.KGSeries.discover(params);
      const pages=await Promise.all(Array.from({length:Math.min(4,Math.max(0,first.total_pages-1))},(_,index)=>window.KGSeries.discover({...params,page:index+2})));
      if(request!==generation)return;
      const ids=new Set([first,...pages].flatMap(page=>(page.results||[]).map(show=>show.id)));
      minis=ranking.filter(show=>ids.has(show.id)).slice(0,12);
      for(let i=0;i<minis.length;i+=4){
        if(request!==generation)return;
        await Promise.all(minis.slice(i,i+4).map(loadDetails));
      }
      if(request===generation)render();
    }catch{}
  }

  async function episodeHighlights(shows,request){
    const rows=[];
    for(let offset=0;offset<shows.length;offset+=3){
      if(request!==episodeRequest)return;
      const batch=await Promise.allSettled(shows.slice(offset,offset+3).map(async show=>{
        const id=window.KGSeries.rawId(show.id);
        const tv=await loadDetails(show);
        if(!tv)return [];
        const full={...show,...tv}, entries=[];
        const last=tv.status==="Ended"?tv.last_episode_to_air:null;
        const season=number=>requestTmdb(`tv/${id}/season/${number}`,{language:filmLocale});
        const first=await season(1).catch(()=>null);
        const pilot=first?.episodes?.find(episode=>episode.episode_number===1);
        if(pilot?.vote_count>0&&Number(pilot.vote_average)>=8.5)entries.push({kind:"pilot",show:full,episode:pilot,list:first.episodes});
        if(last?.season_number>0){
          const finalSeason=last.season_number===1?first:await season(last.season_number).catch(()=>null);
          const finale=finalSeason?.episodes?.find(episode=>episode.episode_number===last.episode_number);
          if(finale?.vote_count>0&&Number(finale.vote_average)>=8.5)entries.push({kind:"finale",show:full,episode:finale,list:finalSeason.episodes});
        }
        return entries;
      }));
      rows.push(...batch.flatMap(item=>item.status==="fulfilled"?item.value:[]));
    }
    if(request!==episodeRequest)return;
    episodes=["pilot","finale"].flatMap(kind=>rows.filter(row=>row.kind===kind)
      .sort((a,b)=>Number(b.episode.vote_average)-Number(a.episode.vote_average)||Number(b.episode.vote_count)-Number(a.episode.vote_count))
      .slice(0,6).map(row=>({...row,key:`${row.show.id}:${row.episode.season_number}:${row.episode.episode_number}`})));
    episodePhase="";render();
  }

  async function show(force=false){
    refreshDaily();
    const key=`${apiKey}:${filmLocale}`;
    if(!apiKey){generation++;episodeRequest++;snapshot=null;entries=[];episodes=[];minis=[];phase="key";render();return;}
    if(!force&&snapshot?.key===key&&Date.now()-snapshot.time<ttl){render();updateVisibleDetails();return;}
    const token=++generation;
    episodeRequest++;entries=[];episodes=[];minis=[];metadata.clear();phase="loading";episodePhase="";render();
    try{
      const ranking=await loadRanking();
      if(token!==generation)return;
      snapshot={key,time:Date.now()};entries=ranking;phase="";episodePhase=entries.length?"loading":"";render();
      if(entries.length){
        updateVisibleDetails();loadMinis(entries,token);
        const popular=[...entries].sort((a,b)=>Number(b.vote_count)-Number(a.vote_count)).slice(0,8);
        const sample=[...new Map([...entries.slice(0,12),...popular].map(show=>[show.id,show])).values()];
        episodeHighlights(sample,++episodeRequest);
      }
    }catch{
      if(token!==generation)return;
      phase="error";render();
    }
  }

  function mount(panel,onBack){
    root=panel;back=onBack;
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="visible")refreshDaily();
    });
    root.addEventListener("error",event=>{
      const image=event.target;
      if(!image.matches?.("img[data-gold-image]"))return;
      const fallback=image.dataset.goldFallback;
      if(fallback){
        delete image.dataset.goldFallback;
        image.src=fallback;
      }else{
        image.hidden=true;
      }
    },true);
    root.addEventListener("change",event=>{
      if(event.target.matches("[data-gold-sort]")){sort=event.target.value;shown=5;render();updateVisibleDetails();}
    });
    root.addEventListener("click",event=>{
      const button=event.target.closest("button");if(!button)return;
      if(button.matches("[data-gold-back]")){back();return;}
      if(button.matches("[data-gold-filters]")){
        root.querySelector("[data-gold-rail=eras]")?.scrollIntoView({behavior:"smooth",block:"center"});
        return;
      }
      if(button.matches("[data-gold-retry]")){show(true);return;}
      if(button.matches("[data-gold-more]")){shown+=5;render();updateVisibleDetails();return;}
      const {goldEra,goldGenre,goldLayout,goldEpisode,goldOpen,goldWatch}=button.dataset;
      if(goldGenre){genre=goldGenre;shown=5;render();updateVisibleDetails();return;}
      if(goldEra){era=goldEra;shown=5;render();updateVisibleDetails();return;}
      if(goldLayout){layout=goldLayout;render();return;}
      if(goldEpisode){
        const row=episodes.find(entry=>entry.key===goldEpisode);
        if(row)window.KGEpisodePage.open(row.show,row.episode,row.episode.season_number,{episodes:row.list,opener:button});
        return;
      }
      const film=entries.find(show=>String(show.id)===(goldOpen||goldWatch));
      if(!film)return;
      if(goldWatch)window.KGToggleWatched(film);
      else window.KGSeriesHub.openSeries(film,button,{showEpisodes:button.hasAttribute("data-gold-seasons")});
    });
    document.addEventListener("kg:watched-change",()=>{if(!root.hidden&&entries.length)render();});
  }
  window.KGSeriesGold={mount,show,hide:()=>clearTimeout(dailyTimer)};
})();
