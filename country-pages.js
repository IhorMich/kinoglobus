/* Country atlas and country passport, powered by the existing TMDB key/history. */
(() => {
  const app = window.KGCountryApp;
  const dialog = document.getElementById('journey');
  const shell = dialog?.querySelector('.kg-in');
  const map = document.getElementById('mapbox');
  const zin = document.getElementById('mzin');
  const zout = document.getElementById('mzout');
  if (!app || !dialog || !shell || !map) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = value => new Intl.NumberFormat('ru-RU').format(Number(value) || 0);
  const flag = code => [...String(code || '')].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('') || '🌍';
  const year = film => String(film?.release_date || '').slice(0, 4) || 'Год неизвестен';
  const poster = (film, size='w342') => film?.poster_path ? `https://image.tmdb.org/t/p/${size}${film.poster_path}` : '';
  const root = document.createElement('div');
  root.id = 'kg-country-app';
  shell.prepend(root);
  shell.querySelectorAll(':scope > :not(#kg-country-app)').forEach(el => el.classList.add('kg-country-legacy'));

  const style = document.createElement('style');
  style.textContent = `
    #journey.kg-dlg{width:min(96vw,600px);max-height:92dvh;border-radius:24px;background:#100d14;border-color:#3a3140}
    #journey .kg-in{padding:0;gap:0;max-height:92dvh;overflow:auto;scroll-behavior:smooth}
    #journey .kg-country-legacy{display:none!important}
    #kg-country-app{font-family:'Plus Jakarta Sans',sans-serif;color:#e8e0ea;min-height:100%;background:radial-gradient(ellipse at 90% 14%,rgba(134,26,69,.17),transparent 34%),#100d14}
    .kgc-head{height:60px;padding:0 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:5;background:rgba(21,18,25,.92);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,220,168,.08)}
    .kgc-icon{border:0;background:transparent;color:#ffdca8;width:36px;height:40px;font-size:24px;cursor:pointer}.kgc-head-title{min-width:0;flex:1}.kgc-head-title b{font:600 17px 'Noto Serif',serif;color:#ffdca8;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kgc-head-title small,.kgc-muted{color:#b3a79a;font-size:11px}
    .kgc-pad{padding:16px}.kgc-panel{background:linear-gradient(145deg,rgba(34,30,38,.96),rgba(28,24,34,.92));border:1px solid rgba(255,220,168,.09);border-radius:18px;padding:15px;box-shadow:0 14px 36px rgba(0,0,0,.2)}
    .kgc-overview{position:relative;overflow:hidden;background:radial-gradient(ellipse at 95% 0,rgba(255,184,48,.14),transparent 42%),linear-gradient(135deg,#221e26,#151219)}
    .kgc-kicker{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#ffdca8;font-weight:700}.kgc-statbig{font:600 35px 'Noto Serif',serif;color:#ffdca8;line-height:1.15}.kgc-title{font:600 22px/1.25 'Noto Serif',serif;color:#fdfbf7}.kgc-section{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:23px 16px 10px}.kgc-section h3{margin:0;font:600 18px 'Noto Serif',serif;color:#f5e4cb}.kgc-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.kgc-mini{background:#1d1a22;border-radius:14px;padding:12px;min-height:82px}.kgc-mini b{display:block;margin-top:9px;font:600 20px 'Noto Serif',serif;color:#ffdca8}.kgc-mini small{display:block;color:#b3a79a;font-size:11px;line-height:1.35;margin-top:2px}.kgc-progress{height:7px;background:#37333b;border-radius:99px;overflow:hidden}.kgc-progress i{height:100%;display:block;background:linear-gradient(90deg,#d89120,#ffdca8);border-radius:inherit}.kgc-btn{border:0;border-radius:999px;padding:11px 15px;background:linear-gradient(100deg,#ffb830,#ffdaa0);color:#432c00;font-weight:700;font-size:13px;display:inline-flex;justify-content:center;align-items:center;gap:8px;cursor:pointer}.kgc-btn.secondary{background:#302a35;color:#ffdca8;border:1px solid rgba(255,220,168,.12)}.kgc-country-hero{position:relative;min-height:205px;overflow:hidden;border-radius:19px;display:flex;align-items:flex-end;background:linear-gradient(0deg,rgba(9,7,12,.96),rgba(9,7,12,.1)),linear-gradient(135deg,#332336,#17131d)}.kgc-country-hero:before{content:'';position:absolute;inset:0;background-image:var(--kgc-bg);background-size:cover;background-position:center;opacity:.67;filter:saturate(.72)}.kgc-country-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,rgba(7,6,10,.96),rgba(7,6,10,.02) 78%)}.kgc-hero-content{position:relative;z-index:1;padding:17px;width:100%}.kgc-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}.kgc-chip{border-radius:99px;padding:5px 9px;background:rgba(134,26,69,.55);color:#ffd9e1;font-size:10px;font-weight:700}.kgc-chip.neutral{background:rgba(28,24,34,.82);color:#e8e0ea}.kgc-country-name{font:600 30px/1.15 'Noto Serif',serif;color:#ffdca8;margin:0}.kgc-country-name em{font:italic 15px 'Noto Serif',serif;color:#d5c4ad}.kgc-blurb{font:italic 14px/1.5 'Noto Serif',serif;color:#f3dfc1;margin:8px 0 14px;max-width:38em}.kgc-feature{display:grid;grid-template-columns:92px 1fr;gap:13px;align-items:start}.kgc-poster{width:92px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;background:#302a35;box-shadow:0 9px 24px rgba(0,0,0,.34)}.kgc-filmname{font:600 18px/1.25 'Noto Serif',serif;color:#fdfbf7;margin:4px 0}.kgc-films-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 16px}.kgc-filmcard{padding:0;overflow:hidden;text-align:left;background:#1d1a22;border:1px solid rgba(255,220,168,.08);border-radius:14px;color:#e8e0ea;cursor:pointer}.kgc-filmcard img,.kgc-filmph{width:100%;aspect-ratio:2/3;object-fit:cover;background:#2c2830;display:flex;align-items:center;justify-content:center;color:#b3a79a;text-align:center;padding:8px}.kgc-filmcopy{padding:9px}.kgc-filmcopy b{font:600 14px/1.35 'Noto Serif',serif;display:block;min-height:38px}.kgc-filmcopy small{display:block;color:#b3a79a;font-size:10px;margin-top:4px}.kgc-rating{color:#ffdca8}.kgc-rowcards{display:flex;overflow:auto;gap:9px;padding:0 16px 5px}.kgc-person{flex:0 0 128px;text-align:center;padding:13px 9px;background:#1d1a22;border-radius:14px}.kgc-avatar{width:54px;height:54px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(145deg,#6a3f24,#211b26);display:grid;place-items:center;color:#ffdca8;font:600 16px 'Noto Serif',serif;border:1px solid rgba(255,220,168,.3)}.kgc-map{padding:12px}.kgc-map #mapbox{min-height:125px;max-height:165px}.kgc-map #mapbox svg{width:100%!important}.kgc-map-controls{display:flex;align-items:center;gap:8px;padding-top:8px}.kgc-country-list{display:flex;flex-wrap:wrap;gap:7px}.kgc-country-pill{border:1px solid rgba(255,220,168,.1);border-radius:999px;background:#221e26;color:#d5c4ad;padding:7px 10px;font-size:11px;cursor:pointer}.kgc-country-pill.has{color:#ffdca8;border-color:rgba(255,184,48,.32)}.kgc-filter{display:flex;gap:7px;overflow:auto;padding:0 16px 10px}.kgc-filter button{white-space:nowrap;border:0;border-radius:999px;padding:7px 11px;background:#221e26;color:#b3a79a;font-size:11px;cursor:pointer}.kgc-filter button.active{background:#ffb830;color:#432c00;font-weight:700}.kgc-empty{color:#b3a79a;background:#1d1a22;border-radius:14px;padding:14px;font-size:13px;line-height:1.5}.kgc-foot{padding:18px 16px calc(env(safe-area-inset-bottom,0px) + 18px)}
    @media(max-width:390px){.kgc-pad{padding:13px}.kgc-country-name{font-size:27px}.kgc-grid3{gap:6px}.kgc-mini{padding:10px 8px}.kgc-mini b{font-size:18px}.kgc-section h3{font-size:17px}}
  `;
  document.head.appendChild(style);

  const data = () => ({counts:app.counts(), watched:app.watched(), countries:app.countries()});
  const countsTotal = counts => Object.values(counts).reduce((n,v)=>n+(Number(v)||0),0);
  const sortedCountries = () => {
    const {counts,countries}=data();
    return countries.slice().sort((a,b)=>(counts[b]||0)-(counts[a]||0)||app.countryName(a).localeCompare(app.countryName(b),'ru'));
  };
  const openMovie = film => app.openMovie(film._kgCountry || (film.origin_country||[])[0] || '',film);

  function atlas(){
    root.dataset.page='atlas';
    const {counts,watched,countries}=data();
    const opened=Object.keys(counts).filter(c=>counts[c]>0).length;
    const total=countsTotal(counts), pct=Math.round(opened/Math.max(1,countries.length)*100);
    const ordered=sortedCountries(); const leader=ordered.find(c=>counts[c]);
    const latest=watched.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')))[0];
    const seenCountries=ordered.filter(c=>counts[c]);
    const latestCountry=latest?.cc || latest?.countries?.[0] || '';
    root.innerHTML=`
      <div class="kgc-head"><button class="kgc-icon" data-atlas-close aria-label="Закрыть">←</button><div class="kgc-head-title"><b>Атлас открытий</b><small>Кинематограф мира · ${countries.length} стран</small></div><span style="font-size:21px">🌍</span></div>
      <div class="kgc-pad"><section class="kgc-panel kgc-overview">
        <div style="display:flex;justify-content:space-between;gap:8px"><span class="kgc-kicker">✦ Киноэкспедиция</span><span class="kgc-chip neutral">${opened?`${opened} / ${countries.length} открыто`:'Начало пути'}</span></div>
        <div style="display:flex;align-items:center;gap:14px;margin:9px 0 4px"><div class="kgc-statbig">${opened}<span style="font-size:20px;color:#d5c4ad"> / ${countries.length}</span></div><div style="margin-left:auto;text-align:center"><button class="kgc-btn secondary" data-map-zoom>＋　Карта</button></div></div>
        <div class="kgc-muted" style="margin-bottom:14px">Страны мирового кинематографа</div>
        <div class="kgc-progress"><i style="width:${pct}%"></i></div><div style="display:flex;justify-content:space-between;margin-top:7px" class="kgc-muted"><span>${fmt(total)} просмотренных фильмов</span><span>${100-opened} не открыто</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:15px;color:#d5c4ad;font:12px 'Noto Serif',serif"><span>☝</span><span>Выберите страну на карте или в списке ниже</span></div>
      </section></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-grid3">
        <div class="kgc-mini"><span>🎞</span><b>${fmt(total)}</b><small>Фильмов просмотрено</small></div>
        <div class="kgc-mini"><span>🌐</span><b>${opened} / ${countries.length}</b><small>Стран открыто</small></div>
        <div class="kgc-mini"><span>✦</span><b>${opened?`${(total/Math.max(1,opened)).toFixed(1)}`:'0'}</b><small>Фильмов на страну</small></div>
      </div></div>
      <div class="kgc-section"><h3>🏆 Чаще всего в зале</h3><span class="kgc-chip neutral">Лидер кинопутешествия</span></div>
      ${leader?`<button class="kgc-pad" data-open-country="${leader}" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-country-hero" style="--kgc-bg:url('https://flagcdn.com/w1280/${leader.toLowerCase()}.png')"><div class="kgc-hero-content"><div class="kgc-chips"><span class="kgc-chip">${flag(leader)} ${fmt(counts[leader])} сеанс${counts[leader]===1?'':'а'}</span><span class="kgc-chip neutral">№ ${String(ordered.indexOf(leader)+1).padStart(2,'0')} в ваших открытиях</span></div><h2 class="kgc-country-name">${esc(app.countryName(leader))}</h2><p class="kgc-blurb">Ваша личная кинематографическая карта этой страны. Откройте паспорт, чтобы увидеть отмеченные фильмы.</p><span class="kgc-btn">Открыть паспорт страны　↗</span></div></div></button>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-panel"><div class="kgc-title">Ваше первое кинооткрытие</div><p class="kgc-muted">Отметьте просмотренный фильм — и страна его производства появится в атласе.</p><button class="kgc-btn secondary" data-open-map>Перейти к глобусу　↗</button></div></div>`}
      <div class="kgc-section"><h3>◎ Последнее открытие</h3><span class="kgc-muted">${latest?new Date(latest.watchedAt||Date.now()).toLocaleDateString('ru-RU'):'История пока пуста'}</span></div>
      ${latest?`<button data-open-saved="${esc(latest.id)}" class="kgc-pad" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-feature">${poster(latest,'w185')?`<img class="kgc-poster" src="${poster(latest,'w185')}" alt="">`:'<div class="kgc-poster"></div>'}<span><span class="kgc-chip">Просмотрено</span><b class="kgc-filmname">${esc(latest.title||'Фильм')}</b><small class="kgc-muted">${esc([latest.year,latestCountry?app.countryName(latestCountry):''].filter(Boolean).join(' · '))}</small></span></div></button>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-empty">Здесь появится последний фильм, который вы отметили как просмотренный.</div></div>`}
      <div class="kgc-section"><h3>🌐 Атлас кинолокаций</h3><span class="kgc-muted">${opened} отмечено</span></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-panel kgc-map"><div id="kg-country-map-host"></div><div class="kgc-map-controls"><span class="kgc-muted" style="flex:1">Нажмите на отмеченную страну</span><button class="kgc-btn secondary" data-open-globe>Развернуть глобус</button></div></div></div>
      ${seenCountries.length?`<div class="kgc-section"><h3>Открытые страны</h3><span class="kgc-muted">${seenCountries.length}</span></div><div class="kgc-pad" style="padding-top:0"><div class="kgc-country-list">${seenCountries.map(c=>`<button class="kgc-country-pill has" data-open-country="${c}">${flag(c)} ${esc(app.countryName(c))} · ${counts[c]}</button>`).join('')}</div></div>`:''}
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-close style="width:100%">Закрыть атлас</button></div>`;
    const mapHost=root.querySelector('#kg-country-map-host');
    if(mapHost){mapHost.append(map);if(zin&&zout){const controls=document.createElement('div');controls.className='kgc-map-controls';controls.append(zout,zin);mapHost.append(controls);}}
  }

  async function country(code){
    if(!code)return atlas();
    root.dataset.page='country'; root.dataset.code=code;
    const {counts,watched,countries}=data(); const name=app.countryName(code); const marked=watched.filter(x=>(x.countries||[]).includes(code));
    root.innerHTML=`<div class="kgc-head"><button class="kgc-icon" data-atlas-back aria-label="Назад">←</button><div class="kgc-head-title"><b>${esc(name)}</b><small>Паспорт страны · Киноглобус</small></div><span>${flag(code)}</span></div><div class="kgc-pad"><div class="kgc-empty">Загружаем фильмы и кинематографистов из TMDB…</div></div>`;
    if(!app.key()){
      root.querySelector('.kgc-empty').innerHTML='Для наполнения паспорта нужен сохранённый ключ TMDB. Фильмы и отметки просмотра уже доступны локально.';
      renderCountry(code,marked.map(x=>({id:x.id,title:x.title,release_date:x.year?x.year+'-01-01':'',poster_path:x.poster||null,vote_average:x.score||0,vote_count:x.votes||0,overview:x.overview||'',_kgCountry:code})),marked.length,marked);return;
    }
    try{
      const page=await app.getCountryFilms(code,1); if(root.dataset.code!==code)return;
      const films=(page.results||[]).map(f=>({...f,_kgCountry:code}));
      renderCountry(code,films,page.total_results||0,marked);
    }catch(error){if(root.dataset.code!==code)return;root.querySelector('.kgc-empty').textContent='Не удалось загрузить каталог TMDB. Ниже оставлены ваши локальные отметки просмотра.';renderCountry(code,marked.map(x=>({id:x.id,title:x.title,release_date:x.year?x.year+'-01-01':'',poster_path:x.poster||null,vote_average:x.score||0,vote_count:x.votes||0,overview:x.overview||'',_kgCountry:code})),marked.length,marked);}
  }

  function renderCountry(code,films,total,marked){
    if(root.dataset.code!==code)return;
    const name=app.countryName(code),counts=app.counts(),top=films[0],watchedLatest=marked.slice().sort((a,b)=>String(b.watchedAt||'').localeCompare(String(a.watchedAt||'')))[0];
    const ratings=films.filter(f=>Number(f.vote_average)>0);const avg=ratings.length?ratings.reduce((n,f)=>n+Number(f.vote_average),0)/ratings.length:0;
    const years=films.map(f=>Number(year(f))).filter(n=>n>1800);const range=years.length?`${Math.min(...years)} — ${Math.max(...years)}`:'—';
    const feature=watchedLatest||top;
    const backdrop=feature?.backdrop_path?`https://image.tmdb.org/t/p/w780${feature.backdrop_path}`:feature?.poster_path?`https://image.tmdb.org/t/p/w780${feature.poster_path}`:`https://flagcdn.com/w1280/${code.toLowerCase()}.png`;
    root.innerHTML=`
      <div class="kgc-head"><button class="kgc-icon" data-atlas-back aria-label="Назад">←</button><div class="kgc-head-title"><b>Паспорт страны</b><small>Кинематограф · ${esc(code)}</small></div><button class="kgc-icon" data-atlas-close aria-label="Закрыть">×</button><span>${flag(code)}</span></div>
      <div class="kgc-pad"><section class="kgc-country-hero" style="--kgc-bg:url('${backdrop}')"><div class="kgc-hero-content"><div class="kgc-chips"><span class="kgc-chip">${counts[code]?'✦ Открыта · '+counts[code]+' сеанс':'Кинематограф страны'}</span><span class="kgc-chip neutral">TMDB · ${esc(code)}</span></div><h1 class="kgc-country-name">${esc(name)}</h1><p class="kgc-blurb">${feature?esc((feature.overview||'').slice(0,180)||'Исследуйте фильмы и кинематографистов этой страны.'):'Каталог фильмов страны появится после загрузки данных TMDB.'}</p><button class="kgc-btn" data-country-search="${code}">▣　Крутить киноглобус</button></div></section></div>
      <div class="kgc-section"><h3>♧ Синефильский паспорт</h3><span class="kgc-kicker">Данные TMDB</span></div>
      <div class="kgc-pad" style="padding-top:0"><div class="kgc-grid3"><div class="kgc-mini"><span>▣</span><b>${fmt(total)}</b><small>Фильмов в каталоге</small></div><div class="kgc-mini"><span>★ ${avg?avg.toFixed(1):'—'}</span><b>${avg?avg.toFixed(1):'—'}</b><small>Средний рейтинг выборки</small></div><div class="kgc-mini"><span>⌁</span><b style="font-size:14px">${range}</b><small>Годы в выборке TMDB</small></div></div></div>
      <div class="kgc-section"><h3>🏅 Визитная карточка</h3><span class="kgc-kicker">${top?'Популярное в TMDB':'Подборка'}</span></div>
      ${feature?`<button data-film-id="${feature.id}" class="kgc-pad" style="display:block;width:100%;text-align:left;border:0;background:transparent;padding-top:0"><div class="kgc-panel kgc-feature">${poster(feature)?`<img class="kgc-poster" src="${poster(feature)}" alt="Постер «${esc(feature.title)}">`:'<div class="kgc-poster"></div>'}<span><span class="kgc-chip">${watchedLatest?'Просмотрено':'Выборка TMDB'}</span><b class="kgc-filmname">${esc(feature.title||'Фильм')}</b><small class="kgc-muted">${esc(year(feature))}　 <span class="kgc-rating">★ ${Number(feature.vote_average||0).toFixed(1)}</span></small><span class="kgc-muted" style="display:block;margin-top:8px">Нажмите, чтобы открыть фильм</span></span></div></button>`:`<div class="kgc-pad" style="padding-top:0"><div class="kgc-empty">Фильм TMDB пока не найден для этой страны.</div></div>`}
      <div class="kgc-section"><h3>🎬 Мэтры кинематографа</h3><span class="kgc-muted">Из популярных фильмов</span></div><div class="kgc-rowcards" id="kg-country-people"><div class="kgc-empty">Загружаем участников…</div></div>
      <div class="kgc-section"><h3>Коллекция картин</h3><span class="kgc-muted">${fmt(total)} фильмов</span></div>
      <div class="kgc-filter"><button class="active" data-film-filter="all">Все ленты (${fmt(total)})</button><button data-film-filter="classic">Классика · до 1970</button><button data-film-filter="newwave">1970–1999</button><button data-film-filter="modern">2000+</button></div>
      <div class="kgc-films-grid" id="kg-country-films"></div>
      <div class="kgc-foot"><button class="kgc-btn secondary" data-atlas-back style="width:100%">←　К атласу открытий</button></div>`;
    paintFilms(films,'all');
    root.querySelectorAll('[data-film-filter]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-film-filter]').forEach(x=>x.classList.toggle('active',x===b));paintFilms(films,b.dataset.filmFilter);}));
    const people=root.querySelector('#kg-country-people');
    Promise.all(films.slice(0,5).map(f=>app.getFilmDetails(f.id).then(d=>({f,d})).catch(()=>null))).then(items=>{
      if(root.dataset.code!==code||!people?.isConnected)return;
      const found=new Map();
      items.filter(Boolean).forEach(({f,d})=>{
        (d.dirsFull||[]).forEach(p=>{if(p.id&&!found.has(p.id))found.set(p.id,{...p,role:'Режиссёр',film:f.title});});
        (d.castFull||[]).slice(0,3).forEach(p=>{if(p.id&&!found.has(p.id))found.set(p.id,{...p,role:'Актёр',film:f.title});});
      });
      const list=[...found.values()].slice(0,12);
      people.innerHTML=list.length?list.map(p=>`<button class="kgc-person" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}"><span class="kgc-avatar">${esc(String(p.name||'К').split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</span><b style="display:block;font:600 12px 'Noto Serif',serif">${esc(p.name)}</b><small class="kgc-muted">${esc(p.role)} · ${esc(p.film||'')}</small></button>`).join(''):'<div class="kgc-empty">TMDB пока не вернул имена участников для этого списка.</div>';
    });
    root.querySelector('[data-film-filter="all"]')?.classList.add('active');
  }

  function paintFilms(films,filter){
    const box=root.querySelector('#kg-country-films');if(!box)return;
    const filtered=films.filter(f=>{const y=Number(year(f));return filter==='classic'?y&&y<1970:filter==='newwave'?y>=1970&&y<2000:filter==='modern'?y>=2000:true;});
    box.innerHTML=filtered.length?filtered.map(f=>`<button class="kgc-filmcard" data-film-id="${f.id}">${poster(f)?`<img loading="lazy" src="${poster(f)}" alt="Постер «${esc(f.title)}">`:`<span class="kgc-filmph">${esc(f.title)}</span>`}<span class="kgc-filmcopy"><b>${esc(f.title||'Фильм')}</b><small><span class="kgc-rating">★ ${Number(f.vote_average||0).toFixed(1)}</span>　${esc(year(f))}</small></span></button>`).join(''):'<div class="kgc-empty" style="grid-column:1/-1">В этой категории пока нет фильмов на первой странице каталога TMDB.</div>';
  }

  function showAtlas(){atlas();}
  window.KGSelectWatchedCountry=country;
  const mapButton=document.getElementById('mapBtn');
  const originalMapClick=mapButton?.onclick;
  if(mapButton)mapButton.onclick=function(event){originalMapClick?.call(this,event);showAtlas();};
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-open-country],[data-atlas-back],[data-atlas-close],[data-country-search],[data-open-map],[data-open-globe],[data-map-zoom],[data-film-id],[data-open-saved]');
    if(!target)return;
    if(target.dataset.openCountry){country(target.dataset.openCountry);return;}
    if(target.hasAttribute('data-atlas-back')){atlas();root.scrollIntoView({block:'start'});return;}
    if(target.hasAttribute('data-atlas-close')){dialog.close?.();return;}
    if(target.dataset.countrySearch){app.searchCountry(target.dataset.countrySearch);return;}
    if(target.hasAttribute('data-map-zoom')){root.querySelector('.kgc-map')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(target.hasAttribute('data-open-map')||target.hasAttribute('data-open-globe')){dialog.close?.();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(target.dataset.filmId){const film=(window.__kgCountryFilms||[]).find(f=>String(f.id)===target.dataset.filmId);if(film)openMovie(film);return;}
    if(target.dataset.openSaved){const film=app.watched().find(f=>String(f.id)===target.dataset.openSaved);if(film)openMovie({...film,id:film.id,title:film.title,release_date:film.year?film.year+'-01-01':'',poster_path:film.poster||null,vote_average:film.score||0,vote_count:film.votes||0,origin_country:film.countries||[film.cc]});}
  });
  document.addEventListener('click',event=>{
    const hit=event.target.closest('#mapbox [data-c]');if(hit&&dialog.open){event.preventDefault();event.stopImmediatePropagation();country(hit.dataset.c);}
  },true);
  if(typeof window.renderJourney==='function'){
    const originalRender=window.renderJourney;
    window.renderJourney=function(){originalRender();showAtlas();};
  }
  dialog.addEventListener('close',()=>{root.dataset.page='';});
  // Movie IDs in the country grid are handled by the profile-local film list.
  // Keep the currently fetched film objects available for card actions.
  const originalRenderCountry=renderCountry;
  renderCountry=function(code,films,total,marked){window.__kgCountryFilms=films;return originalRenderCountry(code,films,total,marked);};
})();
