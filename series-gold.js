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
  let root, snapshot, generation=0, era="all", genre="all", sort="rating", layout="list", shown=5, phase="", episodePhase="";
  const metadata=new Map();
  let minis=[];
  let entries=[], episodes=[], episodeRequest=0;

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

  function hero(show){
    return `<article class="kg-gold-hero">
      <div class="kg-gold-hero-art">
        <button type="button" data-gold-open="${show.id}" aria-label="${esc(show.title)}">${goldImage(art(show.backdrop_path,"w780"),art(show.poster_path,"w500"))}</button>
        <span class="kg-gold-rank">#${show._goldRank}</span>${kgBookmarkButton(show)}
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
    </article>`;
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
    const focus=root.contains(document.activeElement)?document.activeElement.dataset.goldFocus:null;
    const railPositions=new Map(Array.from(root.querySelectorAll("[data-gold-rail]"),rail=>[rail.dataset.goldRail,rail.scrollLeft]));
    root.innerHTML=`
      <header class="kg-gold-heading"><h1>${label("Золотой фонд TV")}</h1><p>${label("250 лучших сериалов всех времён по рейтингу TMDB. В рейтинг входят сериалы с минимум 200 голосами.")}</p></header>
      ${entries.length?progress(count):""}
      ${entries.length?`<div class="kg-gold-filters" data-gold-rail="eras" role="group" aria-label="${label("Эпохи")}">${eras.map(([id,title])=>{
        const total=entries.filter(show=>inEra(show,id)&&inGenre(show,genre)).length;
        return `<button type="button" data-gold-era="${id}" data-gold-focus="era-${id}" aria-pressed="${era===id}">${label(title)} (${number(total)})</button>`;
      }).join("")}</div>
      <div class="kg-gold-filters kg-gold-genres" data-gold-rail="genres" role="group" aria-label="${label("Жанры")}">${["all",...genreOrder].map(id=>{
        const total=entries.filter(show=>inEra(show,era)&&inGenre(show,String(id))).length;
        return total||genre===String(id)?`<button type="button" data-gold-genre="${id}" data-gold-focus="genre-${id}" aria-pressed="${genre===String(id)}">${label(id==="all"?"Все жанры":genreLabel(id))} (${number(total)})</button>`:"";
      }).join("")}</div>
      <div class="kg-gold-toolbar">
      <label>${icon("swap_vert")}<select data-gold-sort data-gold-focus="sort" aria-label="${label("Сортировка:")}">${[["rating","По рейтингу"],["votes","По числу голосов"],["new","Свежие"]].map(([id,title])=>`<option value="${id}" ${sort===id?"selected":""}>${label(title)}</option>`).join("")}</select></label>
      <div role="group" aria-label="${label("Вид списка")}">${[["list","view_list","Списком"],["grid","grid_view","Сеткой"]].map(([id,symbol,title])=>`<button type="button" data-gold-layout="${id}" data-gold-focus="layout-${id}" aria-pressed="${layout===id}" aria-label="${label(title)}">${icon(symbol)}</button>`).join("")}</div></div>`:""}
      ${phase?`<p class="kg-gold-muted" role="status">${label(phase==="loading"?"Загружаем сериалы…":phase==="key"?"Добавьте ключ TMDB, чтобы загрузить сериалы подборки.":"Не удалось загрузить сериалы. Попробуйте ещё раз.")}</p>`:""}
      ${phase==="error"?`<button type="button" class="kg-gold-button" data-gold-retry>${label("Повторить")}</button>`:""}
      ${rows.length?hero(rows[0]):!phase?`<p class="kg-gold-muted">${label("Подходящих сериалов не нашлось.")}</p>`:""}
      ${rows.length>1?`<section class="kg-gold-list"><header><h2>${label("Топ сериалов")}</h2><span>${number(rows.length)}</span></header>
        <div class="kg-gold-cards ${layout==="grid"?"is-grid":""}">${rows.slice(1,shown+1).map(card).join("")}</div>
        ${rows.length>shown+1?`<button type="button" class="kg-gold-button" data-gold-more data-gold-focus="more">${label("Показать ещё")}</button>`:""}</section>`:""}
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
    const rows=visible().slice(0,shown+1).filter(show=>!metadata.has(show.id));
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

  function mount(panel){
    root=panel;
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
  window.KGSeriesGold={mount,show};
})();
