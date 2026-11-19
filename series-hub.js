/* Series home editorial block, adapted from the supplied Stitch layout. */
(() => {
  const DAY=86400000,CACHE_TTL=60*60*1000;
  const platforms={all:'Все сервисы',netflix:'Netflix',apple:'Apple TV+',max:'HBO / Max',prime:'Prime Video',fx:'FX'};
  const seedRows=[
    [194764,'Пингвин','The Penguin','max',0], [94997,'Дом Дракона','House of the Dragon','max',1],
    [136315,'Медведь','The Bear','fx',2], [95480,'Медленные лошади','Slow Horses','apple',3],
    [94605,'Аркейн','Arcane','netflix',4], [126308,'Сёгун','Shōgun','fx',5],
    [76479,'Пацаны','The Boys','prime',6], [70523,'Тьма','Dark','netflix',7], [46648,'Настоящий детектив','True Detective','max',8]
  ];
  const art=new Map(seedRows.map(([id,,,,index])=>[id,`assets/series-hub/reference-${index}.jpg`]));
  const seeds=()=>seedRows.map(([id,title,original_title,service])=>({...window.KGSeries.normalize({id,title,original_title,adult:false}),_hubService:service,_hubReference:true,overview:id===194764?'Освальд Кобблпот начинает кровавую битву за власть на тёмных улицах разрушенного Готэма после падения криминальной империи Фальконе.':''}));
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name,size=16)=>{
    const paths={star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z',chevron:'M9 5l7 7-7 7',info:'M12 8h.01M11 11h1v6m10-5a10 10 0 1 1-20 0 10 10 0 0 1 20 0',calendar:'M7 2v4m10-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',filter:'M3 4h18l-7 8v7l-4 2v-9z',spark:'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z',grid:'M3 3h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 10h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 17h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z'};
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="${['star','grid'].includes(name)?'currentColor':'none'}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.info}"/></svg>`;
  };
  const dateKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const dayAfter=(day,offset)=>dateKey(new Date(new Date(day+'T12:00:00').getTime()+offset*DAY));
  const plural=(count,forms)=>uiText(forms[count%100>=11&&count%100<=14?2:count%10===1?0:count%10>=2&&count%10<=4?1:2],{count});
  const seasons=f=>Number(f.number_of_seasons)>0?plural(Number(f.number_of_seasons),['{count} сезон','{count} сезона','{count} сезонов']):'—';
  const episodes=f=>Number(f.number_of_episodes)>0?plural(Number(f.number_of_episodes),['{count} серия','{count} серии','{count} серий']):'—';
  const title=f=>f.title||f.name||uiText('Сериал');
  const image=(f,portrait=false)=>art.get(window.KGSeries.rawId(f.id))||(portrait?f.poster_path||f.backdrop_path:f.backdrop_path||f.poster_path)&&`https://image.tmdb.org/t/p/${portrait?'w500':'w780'}${portrait?f.poster_path||f.backdrop_path:f.backdrop_path||f.poster_path}`||'';
  function service(f){
    if(f._hubService&&f._hubService!=='all'&&Object.hasOwn(platforms,f._hubService))return f._hubService;
    const names=(f.networks||[]).map(n=>n.name||'').join(' ').toLowerCase();
    if(/netflix/.test(names))return 'netflix';if(/apple/.test(names))return 'apple';if(/hbo|\bmax\b/.test(names))return 'max';if(/amazon|prime/.test(names))return 'prime';
    if(/\bfx\b/.test(names)||(f.production_companies||[]).some(c=>/\bfx\b/i.test(c.name||'')))return 'fx';
    return f._hubService||seedRows.find(row=>row[0]===window.KGSeries.rawId(f.id))?.[3]||'other';
  }
  const serviceLabel=f=>platforms[service(f)]||(f.networks||[])[0]?.name||uiText('Сериал');
  function scheduleFor(shows,today=dateKey()){
    const until=dayAfter(today,7),result=[],known=new Set();
    for(const show of shows)for(const episode of [show.last_episode_to_air,show.next_episode_to_air]){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(episode?.air_date||'') || episode.air_date<today || episode.air_date>until)continue;
      const key=`${show.id}:${episode.season_number}:${episode.episode_number}`;if(known.has(key))continue;known.add(key);result.push({show,episode});
    }
    return result.sort((a,b)=>a.episode.air_date.localeCompare(b.episode.air_date)||title(a.show).localeCompare(title(b.show)));
  }
  function categoryQuery(category,today=dateKey()){
    const query={sort_by:'popularity.desc','vote_count.gte':10};
    if(category==='week')Object.assign(query,{'air_date.gte':today,'air_date.lte':dayAfter(today,7)});
    else if(category==='crime')query.with_genres='80|9648';
    else if(category==='scifi')query.with_genres='10765';
    else if(category==='complete')query.with_status='3';
    return query;
  }
  const categories=[['all','Все новинки'],['week','Премьеры недели'],['crime','Триллер & Детектив'],['scifi','Фантастика'],['complete','Завершенные сезоны']];
  let root,category='all',platform='all',generation=0,loadedKey='',loading=false,expanded=false,filterVersion=0;
  const networkCache=new Map(),featured=new Map();
  let heroTimer,heroVersion=0,heroFrame=0,heroKey='';
  let data={hero:null,popular:[],premieres:[],schedule:[]},allShows=new Map(),fadeTimers=new Map();
  const heading=(text,aside='')=>`<div class="kg-sh-heading"><h3>${esc(uiText(text))}</h3>${aside}</div>`;
  const badge=f=>`<span class="kg-sh-score">${icon('star',11)} ${Number(f.vote_average)>0?Number(f.vote_average).toFixed(1):'—'}</span>`;
  function bookmark(f){return kgBookmarkButton(f);}
  function remember(shows){for(const f of shows)if(f?.id)allShows.set(String(f.id),f);}
  function heroMarkup(f){
    if(!f)return `<div class="kg-sh-hero" data-sh-hero hidden></div>`;
    return `<div class="kg-sh-hero" data-sh-hero data-service="${service(f)}"><div class="kg-sh-showcase-ribbon"><span><i></i><b>${esc(uiText('Выбор Moven'))} · ${esc(serviceLabel(f))}</b></span>${icon('spark',13)}</div><div class="kg-sh-hero-card"><div class="kg-sh-parallax"><div class="kg-sh-bg-layer is-active" style="background-image:url('${esc(image(f))}')"></div><div class="kg-sh-bg-layer"></div></div><div class="kg-sh-darkness"></div><div class="kg-sh-hero-shade"></div><span class="kg-sh-scroll-cue" aria-hidden="true">↓</span><div class="kg-sh-hero-copy"><div class="kg-sh-content-crossfade"><div class="kg-sh-badges"><span class="kg-sh-exclusive">${esc(uiText('Выбор Moven'))}</span><span class="kg-sh-provider" data-sh-hero-platform>${esc(serviceLabel(f))}</span>${badge(f)}<span class="kg-sh-meta-badge">${esc(seasons(f))} · ${esc(episodes(f))}</span><span class="kg-sh-format">${esc(uiText(f.status==='Ended'?'Завершён':'Сериал'))}</span></div><div><h2>${esc(title(f))}</h2><p class="kg-sh-hero-sub">${esc([f.original_title!==title(f)?f.original_title:'',(f.genres||[]).slice(0,3).map(g=>g.name||g).join(', ')].filter(Boolean).join(' · '))}</p></div><p class="kg-sh-synopsis">${esc(f.overview||uiText('Откройте карточку, чтобы узнать больше о сериале.'))}</p><div class="kg-sh-hero-actions"><button type="button" class="kg-sh-primary" data-sh-open="${f.id}">${icon('info',20)}${esc(uiText('О сериале'))}</button>${bookmark(f)}</div></div></div></div></div>`;
  }
  function premiereMarkup(f){
    return `<article class="kg-sh-card kg-sh-premiere" data-sh-card data-sh-id="${f.id}" data-service="${service(f)}"><div class="kg-sh-portrait"><button type="button" class="kg-sh-art-button" data-sh-open="${f.id}" aria-label="${esc(uiText('Открыть сериал {title}',{title:title(f)}))}"><img src="${esc(image(f,true))}" alt="" loading="lazy"></button><span class="kg-sh-ribbon">${esc(uiText(f._hubReference?'В подборке':Number(f.number_of_seasons)>1?'Новый сезон':'Премьера'))}</span>${bookmark(f)}<div class="kg-sh-poster-foot">${badge(f)}<span class="kg-sh-service">${esc(serviceLabel(f))}</span></div></div><button type="button" class="kg-sh-title" data-sh-open="${f.id}">${esc(title(f))}</button><p class="kg-sh-muted kg-sh-truncate">${esc(seasons(f))}${f.genres?.[0]?' · '+esc(f.genres[0].name||f.genres[0]):''}</p></article>`;
  }
  function popularMarkup(f){
    return `<article class="kg-sh-card kg-sh-popular" data-sh-card data-sh-id="${f.id}" data-service="${service(f)}"><div class="kg-sh-still"><button type="button" class="kg-sh-art-button" data-sh-open="${f.id}" aria-label="${esc(uiText('Открыть сериал {title}',{title:title(f)}))}"><img src="${esc(image(f))}" alt="" loading="lazy"></button><span class="kg-sh-still-service">${esc(serviceLabel(f))}</span>${badge(f)}${bookmark(f)}</div><button type="button" class="kg-sh-title" data-sh-open="${f.id}">${esc(title(f))}</button><div class="kg-sh-counts"><span>${esc(seasons(f))}</span><span>${esc(episodes(f))}</span></div></article>`;
  }
  function scheduleMarkup({show:f,episode:e}){
    const today=dateKey(),label=e.air_date===today?uiText('Сегодня'):e.air_date===dayAfter(today,1)?uiText('Завтра'):new Date(e.air_date+'T12:00:00').toLocaleDateString(interfaceLanguage,{day:'numeric',month:'short'});
    return `<article class="kg-sh-card kg-sh-episode ${e.air_date===today?'is-today':''}" data-sh-card data-sh-id="${f.id}" data-service="${service(f)}"><div class="kg-sh-episode-top"><span class="kg-sh-day">${e.air_date===today?'<i></i>':''}${esc(label)}</span><span>${esc(new Date(e.air_date+'T12:00:00').toLocaleDateString(interfaceLanguage,{weekday:'short'}))}</span></div><button type="button" class="kg-sh-episode-body" data-sh-open="${f.id}"><img src="${esc(image(f,true))}" alt="" loading="lazy"><span><b>${esc(title(f))}</b><small>${esc(uiText('Сезон {season} · Эпизод {episode}',{season:e.season_number,episode:e.episode_number}))}</small><span class="kg-sh-truncate">${esc(e.name||uiText('Новая серия'))}</span></span></button><div class="kg-sh-episode-foot"><span>${icon('calendar',14)}${esc(serviceLabel(f))}</span><button type="button" data-sh-open="${f.id}">${esc(uiText('Подробнее'))}${icon('chevron',14)}</button></div></article>`;
  }
  function render(animate=false){
    if(!root)return;const rails=[...root.querySelectorAll('.kg-sh-categories,.kg-sh-platform-scroll,.kg-sh-scroll')].map(el=>el.scrollLeft);const focused=root.contains(document.activeElement)?['data-sh-platform','data-sh-category','data-sh-more','data-sh-open','data-kg-bookmark'].map(key=>[key,document.activeElement.getAttribute(key)]).find(([,value])=>value!==null):null;
    for(const timer of fadeTimers.values())clearTimeout(timer);fadeTimers.clear();
    const slides=expanded?data.premieres:data.premieres.slice(0,6);remember([data.hero,...data.popular,...data.premieres,...data.schedule.map(x=>x.show)]);
    const liveHero=root.querySelector('[data-sh-hero]');
    const holder=document.createElement('div');holder.innerHTML=`<div class="kg-sh-categories">${categories.map(([key,text])=>`<button type="button" data-sh-category="${key}" aria-pressed="${category===key}">${key==='all'?icon('spark',14):''}${esc(uiText(text))}</button>`).join('')}</div>${heroMarkup(data.hero)}<section class="kg-sh-platforms">${heading('Стриминговые сервисы',`<span>${esc(uiText('Платформы'))}</span>`)}<div class="kg-sh-platform-scroll">${Object.entries(platforms).map(([key,label])=>`<button type="button" data-sh-platform="${key}" aria-pressed="${platform===key}">${key==='all'?icon('grid',18):`<img src="assets/series-hub/${key}.svg" alt="">`}${esc(uiText(key==='all'?'Все':label))}</button>`).join('')}</div><div class="kg-sh-filter-status" data-sh-filter-status hidden><span>${icon('filter',15)}<span data-sh-filter-text></span></span><button type="button" data-sh-reset>${esc(uiText('Сбросить'))}</button></div></section><section class="kg-sh-schedule">${heading('График выхода новых серий',`<span>${esc(uiText('Неделя'))}</span>`)}<div class="kg-sh-scroll" data-sh-schedule>${data.schedule.length?data.schedule.slice(0,12).map(scheduleMarkup).join(''):`<p class="kg-sh-message">${esc(uiText(loading?'Загружаем расписание…':!apiKey?'Добавьте ключ TMDB, чтобы загрузить расписание.':'На ближайшую неделю подтверждённых дат пока нет.'))}</p>`}</div></section><section class="kg-sh-premieres">${heading('Громкие премьеры и продолжения',`<button type="button" data-sh-more aria-expanded="${expanded}">${esc(uiText(expanded?'Свернуть':'Все'))}${icon('chevron',16)}</button>`)}<div class="kg-sh-scroll">${slides.map(premiereMarkup).join('')}</div></section><section class="kg-sh-popular-section">${heading('Популярно в сети',`<span>${esc(uiText('Рейтинг'))}</span>`)}<div class="kg-sh-grid">${data.popular.slice(0,expanded?20:6).map(popularMarkup).join('')}</div></section><div class="kg-sh-empty" data-sh-empty hidden>${icon('info',30)}<h4>${esc(uiText('Релизы не найдены'))}</h4><p>${esc(uiText('На данной платформе пока нет добавленных премьер в этом разделе.'))}</p><button type="button" data-sh-reset>${esc(uiText('Показать все сериалы'))}</button></div><p class="kg-sh-data-status" data-sh-status role="status"></p>`;
    if(liveHero){liveHero.hidden=!data.hero;for(const child of [...root.children])if(child!==liveHero)child.remove();for(const child of [...holder.children]){if(child.matches('[data-sh-hero]'))continue;if(child.matches('.kg-sh-categories'))root.insertBefore(child,liveHero);else root.append(child);}updateHero(data.hero,animate);}else{root.append(...holder.children);heroKey=String(data.hero?.id);queueParallax();}
    localizeInterfaceMarkup(root);root.querySelectorAll('.kg-sh-categories,.kg-sh-platform-scroll,.kg-sh-scroll').forEach((el,i)=>el.scrollLeft=rails[i]||0);if(focused)root.querySelector(`[${focused[0]}="${focused[1]}"]`)?.focus({preventScroll:true});if(animate)root.querySelectorAll('[data-sh-card]').forEach(card=>card.classList.add('is-fading'));applyPlatform(platform,animate);
  }
  function applyPlatform(value,animate=true){
    if(!root || !Object.hasOwn(platforms,value))return;platform=value;const version=++filterVersion,matches=new Set();animate=animate&&!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    root.querySelectorAll('[data-sh-platform]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shPlatform===value)));
    root.querySelectorAll('[data-sh-card]').forEach(card=>{
      const match=value==='all'||card.dataset.service===value;clearTimeout(fadeTimers.get(card));
      if(match){matches.add(card.dataset.shId);card.classList.remove('is-hidden');if(animate)requestAnimationFrame(()=>version===filterVersion&&card.isConnected&&card.classList.remove('is-fading'));else card.classList.remove('is-fading');}
      else{card.classList.add('is-fading');if(animate)fadeTimers.set(card,setTimeout(()=>{if(card.classList.contains('is-fading'))card.classList.add('is-hidden');},240));else card.classList.add('is-hidden');}
    });
    const status=root.querySelector('[data-sh-filter-status]');status.hidden=value==='all';root.querySelector('[data-sh-filter-text]').textContent=uiText('Выбрано: {platform} · Найдено тайтлов: {count}',{platform:platforms[value],count:matches.size});
    root.querySelector('[data-sh-empty]').hidden=loading||value==='all'||matches.size>0;
    const candidates=[...allShows.values()].filter(f=>value==='all'||service(f)===value);
    const selected=value==='all'?(featured.get(category)||data.hero):candidates.find(f=>f.id===data.hero?.id)||candidates[0]||seeds().find(f=>service(f)===value);
    if(selected)updateHero(selected,animate);
  }
  function updateHero(f,animate=true){
    const hero=root?.querySelector('[data-sh-hero]');if(!hero||!f)return;
    remember([f]);const key=JSON.stringify([f.id,f.vote_average,f.number_of_episodes,f.overview]);if(key===heroKey)return;heroKey=key;
    const version=++heroVersion;clearTimeout(heroTimer);const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const next=document.createElement('div');next.innerHTML=heroMarkup(f);const target=next.firstElementChild;
    const content=hero.querySelector('.kg-sh-content-crossfade'),ribbon=hero.querySelector('.kg-sh-showcase-ribbon');
    if(!content||!ribbon){hero.replaceWith(target);queueParallax();return;}
    content.classList.toggle('is-fading',animate&&!reduced);ribbon.classList.toggle('is-fading',animate&&!reduced);
    const layers=[...hero.querySelectorAll('.kg-sh-bg-layer')],incoming=layers.find(l=>!l.classList.contains('is-active'))||layers[1];
    const preload=new Image();preload.src=image(f);incoming.style.backgroundImage=target.querySelector('.kg-sh-bg-layer').style.backgroundImage;
    requestAnimationFrame(()=>{if(version!==heroVersion)return;layers.forEach(l=>l.classList.toggle('is-active',l===incoming));});
    const swap=()=>{if(version!==heroVersion)return;content.innerHTML=target.querySelector('.kg-sh-content-crossfade').innerHTML;ribbon.innerHTML=target.querySelector('.kg-sh-showcase-ribbon').innerHTML;hero.dataset.service=service(f);localizeInterfaceMarkup(hero);requestAnimationFrame(()=>{if(version!==heroVersion)return;content.classList.remove('is-fading');ribbon.classList.remove('is-fading');});queueParallax();};
    if(animate&&!reduced)heroTimer=setTimeout(swap,190);else swap();
  }
  function parallaxState(scroll){
    if(scroll<0){const pull=Math.min(-scroll/240,1);return {y:0,scale:1.08+pull*.20,dark:.20,textY:0,textScale:1+pull*.04,opacity:1,blur:0,cue:1};}
    const progress=Math.min(scroll,450)/450;
    return {y:scroll*.38,scale:1.08,dark:.30+progress*.55,textY:-scroll*.16,textScale:1,opacity:Math.max(0,1-scroll/360),blur:progress*3.5,cue:Math.max(0,1-scroll/80)};
  }
  function queueParallax(){if(heroFrame)return;heroFrame=requestAnimationFrame(()=>{heroFrame=0;const hero=root?.querySelector('.kg-sh-hero-card');if(!hero||!window.KGSeries.active||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
    const rect=hero.getBoundingClientRect();if(rect.bottom<0||rect.top>window.innerHeight)return;
    // The reference begins at the top; here the same progress starts when this card reaches the viewport top.
    const state=parallaxState(window.pageYOffset<0?window.pageYOffset:Math.max(0,-rect.top));
    hero.querySelector('.kg-sh-parallax').style.transform=`translate3d(0,${state.y.toFixed(2)}px,0) scale(${state.scale.toFixed(4)})`;
    hero.querySelector('.kg-sh-darkness').style.opacity=state.dark.toFixed(3);
    const copy=hero.querySelector('.kg-sh-hero-copy');copy.style.transform=`translate3d(0,${state.textY.toFixed(2)}px,0) scale(${state.textScale})`;copy.style.opacity=state.opacity.toFixed(3);copy.style.filter=state.blur>.3?`blur(${state.blur.toFixed(1)}px)`:'none';
    hero.querySelector('.kg-sh-scroll-cue').style.opacity=state.cue.toFixed(2);
  });}
  function platformResults(rows,selected){return rows.filter(movieCatalog.allows).map(f=>selected==='all'?f:{...f,_hubService:selected});}
  async function tmdb(path,params={}){return requestTmdb(path,{language:filmLocale,include_adult:'false',...params});}
  async function networkQuery(selected){
    if(selected==='all')return {};
    if(!networkCache.has(selected)){
      const anchor=selected==='fx'?seedRows.find(row=>row[0]===126308):seedRows.find(row=>row[3]===selected),pattern={netflix:/netflix/i,apple:/apple/i,max:/hbo|\bmax\b/i,prime:/amazon|prime/i,fx:/\bfx\b|hulu/i}[selected];
      const pending=tmdb(`tv/${anchor[0]}`).then(show=>{const ids=(show.networks||[]).filter(n=>pattern.test(n.name||'')).map(n=>n.id);if(!ids.length)throw new Error('network unavailable');return {with_networks:ids.join('|')};}).catch(error=>{networkCache.delete(selected);throw error;});
      networkCache.set(selected,pending);
    }
    return networkCache.get(selected);
  }
  const cacheName=()=>`kgSeriesHub.v2.${filmLocale}.${dateKey()}.${category}.${platform}`;
  function cached(){try{const record=JSON.parse(localStorage.getItem(cacheName()));return record&&Date.now()-record.time<CACHE_TTL&&['popular','premieres','schedule'].every(k=>Array.isArray(record.data?.[k]))?record.data:null;}catch{return null;}}
  function storeCache(){try{const key=cacheName();localStorage.setItem(key,JSON.stringify({time:Date.now(),data}));const keys=Object.keys(localStorage).filter(k=>k.startsWith('kgSeriesHub.v2.')&&k!==key);for(const k of keys){const value=JSON.parse(localStorage.getItem(k)||'null');if(!value||Date.now()-value.time>CACHE_TTL)localStorage.removeItem(k);}}catch{}}
  async function detailsFor(shows,token){
    const unique=[...new Map(shows.filter(Boolean).map(f=>[f.id,f])).values()],output=new Map();let next=0;
    await Promise.all(Array.from({length:Math.min(4,unique.length)},async()=>{while(next<unique.length){if(token!==generation)return;const f=unique[next++];try{const raw=await tmdb(`tv/${window.KGSeries.rawId(f.id)}`);output.set(f.id,localizeFilmListItem({...f,...raw}));}catch{output.set(f.id,f);}}}));return output;
  }
  async function load(force=false){
    if(!root || !window.KGSeries.active)return;
    const key=String(apiKey||'')+':'+category+':'+platform;if(!force&&loading&&loadedKey===key)return;
    const token=++generation;
    const stored=!force&&cached();if(stored){data=stored;loadedKey=key;loading=false;render(true);return;}
    if(!apiKey){root.querySelector('[data-sh-status]').textContent=uiText('Добавьте ключ TMDB, чтобы обновлять сериалы и расписание.');return;}
    loadedKey=key;loading=true;root.setAttribute('aria-busy','true');root.querySelector('[data-sh-empty]').hidden=true;root.querySelector('[data-sh-status]').textContent=uiText('Обновляем сериалы…');
    if(!data.schedule.length)root.querySelector('[data-sh-schedule]').innerHTML=`<p class="kg-sh-message" role="status">${esc(uiText('Загружаем расписание…'))}</p>`;
    try{
      const today=dateKey(),networks=await networkQuery(platform);if(token!==generation)return;const queries=await Promise.allSettled([
        tmdb('discover/tv',{...categoryQuery(category,today),...networks}),tmdb('discover/tv',{...categoryQuery(category,today),...networks,...(category==='week'?{}:{'air_date.gte':dayAfter(today,-30),'air_date.lte':dayAfter(today,7)})}),category==='all'&&platform==='all'?tmdb('tv/on_the_air',{page:1}):tmdb('discover/tv',{...categoryQuery(category,today),...networks,'air_date.gte':today,'air_date.lte':dayAfter(today,7)})
      ]);
      if(token!==generation)return;
      if(queries.every(r=>r.status==='rejected'))throw new Error('unavailable');
      const lists=queries.map(r=>r.status==='fulfilled'?platformResults(r.value.results||[],platform):[]);
      const popular=(lists[0].length?lists[0]:lists[2]).slice(0,12),premieres=lists[1].slice(0,10),schedule=lists[2].slice(0,16);
      const hero=popular.find(f=>f.backdrop_path)||premieres[0]||popular[0]||schedule[0];
      // Render network-qualified rows before the optional per-show metadata requests.
      allShows.clear();data={hero:hero||null,popular,premieres:premieres.length?premieres:popular,schedule:[]};render(true);
      root.querySelector('[data-sh-empty]').hidden=!!hero;root.querySelector('[data-sh-status]').textContent=uiText('Обновляем сериалы…');
      const details=await detailsFor([hero,...popular.slice(0,8),...premieres.slice(0,6),...schedule],token);if(token!==generation)return;
      const enriched=items=>items.map(f=>details.get(f.id)||f).filter(movieCatalog.allows);
      const heroCandidate=details.get(hero?.id)||hero;
      const safeHero=movieCatalog.allows(heroCandidate)?heroCandidate:enriched(popular)[0];if(platform==='all')featured.set(category,safeHero);
      data={hero:safeHero,popular:enriched(popular),premieres:enriched(premieres.length?premieres:popular),schedule:scheduleFor(enriched(schedule))};
      loading=false;root.removeAttribute('aria-busy');render(true);storeCache();root.querySelector('[data-sh-status]').textContent='';
    }catch{if(token!==generation)return;loading=false;root.removeAttribute('aria-busy');root.querySelector('[data-sh-empty]').hidden=true;if(!data.schedule.length)root.querySelector('[data-sh-schedule]').innerHTML=`<div class="kg-sh-message"><p>${esc(uiText('Не удалось загрузить расписание.'))}</p><button type="button" data-sh-retry>${esc(uiText('Повторить'))}</button></div>`;root.querySelector('[data-sh-status]').innerHTML=`${esc(uiText('Не удалось обновить сериалы.'))} <button type="button" data-sh-retry>${esc(uiText('Повторить'))}</button>`;}
  }
  function mount(panel){
    if(root)return;root=document.createElement('section');root.id='kg-series-hub';root.className='kg-sh kg-home-full-width';root.setAttribute('aria-label',uiText('Сериалы: новинки и расписание'));panel.append(root);
    const sample=seeds();data={hero:sample[0],popular:[sample[8],sample[2],sample[3],sample[1],sample[4],sample[6]],premieres:[sample[5],sample[4],sample[6],sample[7],sample[3]],schedule:[]};render();
    root.addEventListener('click',event=>{
      const platformButton=event.target.closest('[data-sh-platform]');if(platformButton){applyPlatform(platformButton.dataset.shPlatform);load();return;}
      if(event.target.closest('[data-sh-reset]')){applyPlatform('all');load();return;}
      const categoryButton=event.target.closest('[data-sh-category]');if(categoryButton){category=categoryButton.dataset.shCategory;expanded=false;render();load();return;}
      if(event.target.closest('[data-sh-more]')){expanded=!expanded;render();return;}
      if(event.target.closest('[data-sh-retry]')){load(true);return;}
      const open=event.target.closest('[data-sh-open]');if(open){const f=allShows.get(open.dataset.shOpen);if(f)window.KGFilmCard.openDialog({...f,_kgGlobalRelated:true},open);}
    });
    window.addEventListener('scroll',queueParallax,{passive:true});window.addEventListener('resize',queueParallax,{passive:true});
    document.addEventListener('kg:media-change',event=>{if(event.detail.mediaType==='tv')load();else{generation++;loading=false;}});
    document.addEventListener('kg-bookmark-change',()=>{if(root)root.querySelectorAll('[data-kg-bookmark]').forEach(b=>paintBookmarkButton(b,kgIsBookmarked(b.dataset.kgBookmark)));});
  }
  window.KGSeriesHub={mount,load,scheduleFor,categoryQuery,service,applyPlatform,parallaxState,platformResults};
})();
