/* Series detail layout from the supplied reference; catalogue and personal progress only. */
(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sym=name=>{const paths={star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',check:'m5 12 4 4L19 6',check_circle:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M7 12l3 3 7-7',radio_button_unchecked:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',timelapse:'M12 3a9 9 0 1 1-9 9 9 9 0 0 1 9-9Zm0 3v6l4 2',tv:'M3 6h18v14H3zM8 2l4 4 4-4',smart_display:'M3 4h18v16H3zM10 8l6 4-6 4Z',play_arrow:'m8 5 11 7-11 7Z',edit_note:'M4 5h12M4 9h9M4 13h6m3 7 1-5 6-6 3 3-6 6Z',expand_less:'m6 15 6-6 6 6',expand_more:'m6 9 6 6 6-6',arrow_back:'M20 12H4m7-7-7 7 7 7'};return `<svg class="kg-sd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.tv}"/></svg>`;};
  const img=(path,size='w780')=>path?`https://image.tmdb.org/t/p/${size}${path}`:'';
  const states=new WeakMap(),seasonCache=new Map(),pending=new Set();
  const storageKey=id=>`kgSeries.episodes.v1.${window.KGSeries.rawId(id)}`;
  function readMarks(id){try{const value=JSON.parse(localStorage.getItem(storageKey(id))||'[]');return new Set(Array.isArray(value)?value.filter(x=>/^\d+:\d+$/.test(x)):[]);}catch{return new Set();}}
  function progress(episodes,marks,season){const count=episodes.filter(e=>marks.has(`${season}:${e.episode_number}`)).length;return {count,total:episodes.length,percent:episodes.length?Math.round(count/episodes.length*100):0};}
  function initialSeason(seasons){return seasons.find(s=>s.season_number>0&&s.episode_count>0)?.season_number??seasons[0]?.season_number??null;}
  const countText=(n,one,two,many)=>uiText(n%100>=11&&n%100<=14?many:n%10===1?one:n%10>=2&&n%10<=4?two:many,{count:n});
  const dateText=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?new Date(value+'T12:00:00').toLocaleDateString(interfaceLanguage,{day:'numeric',month:'long',year:'numeric'}):uiText('Дата пока неизвестна');
  const seasonLabel=s=>s===0?uiText('Спецвыпуски'):uiText('Сезон {season}',{season:s});
  const episodeCheck=()=>`<svg class="kg-sd-watch-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg>`;
  function episodeMarkup(f,e,marks,logs={}){
    const watched=marks.has(`${f._seriesSeason}:${e.episode_number}`),key=`${f._seriesSeason}:${e.episode_number}`,open=f._seriesOpenEpisode===key;
    return `<article class="kg-sd-episode ${watched?'is-watched':''}"><button type="button" class="kg-sd-episode-info" data-series-episode="${key}" aria-haspopup="dialog"><span class="kg-sd-still">${e.still_path?`<img src="${esc(img(e.still_path,'w300'))}" alt="" loading="lazy">`:sym('tv')}${watched?`<i>${sym('check')}</i>`:''}${e.runtime?`<small>${esc(uiText('{minutes} мин',{minutes:e.runtime}))}</small>`:''}</span><span class="kg-sd-episode-text"><b>${e.episode_number}. ${esc(e.name||uiText('Эпизод {episode}',{episode:e.episode_number}))}</b><span class="${open?'':'is-clamped'}">${esc(e.overview||uiText('Описание серии пока недоступно.'))}</span><time>${esc(dateText(e.air_date))}</time></span></button><button type="button" class="kg-sd-episode-check" data-series-watched="${key}" aria-pressed="${watched}" aria-label="${esc(uiText(watched?'Снять отметку «Просмотрено»':'Отметить серию просмотренной'))}">${episodeCheck()}</button></article>`;
  }
  function episodesMarkup(f){
    const seasons=f.seasons||[],selected=f._seriesSeason??initialSeason(seasons);f._seriesSeason=selected;
    const list=f._seriesEpisodes||[],marks=readMarks(f.id),logs=readEpisodeNotes(f.id),p=progress(list,marks,selected);
    return `<div class="kg-sd-section-heading"><h2>${uiText('Эпизоды')}</h2>${f.number_of_episodes?`<span>${esc(countText(f.number_of_episodes,'{count} серия','{count} серии','{count} серий'))}</span>`:''}</div><div class="kg-sd-season-tabs" role="tablist" aria-label="${uiText('Сезоны')}">${seasons.map(s=>`<button type="button" role="tab" data-series-season="${s.season_number}" aria-selected="${s.season_number===selected}">${esc(seasonLabel(s.season_number))}${Number.isFinite(s.episode_count)?` (${s.episode_count})`:''}</button>`).join('')}</div>${list.length?`<div class="kg-sd-progress"><div><span>${sym('timelapse')}${uiText('Прогресс просмотра')}</span><b>${esc(uiText('{count} из {total} серий · {percent}%',{count:p.count,total:p.total,percent:p.percent}))}</b></div><progress value="${p.count}" max="${p.total}" aria-label="${uiText('Прогресс просмотра')}"></progress><small>${esc(seasonLabel(selected))}</small></div>`:''}<div class="kg-sd-episode-list" role="tabpanel" aria-label="${esc(selected===null?uiText('Эпизоды'):seasonLabel(selected))}">${f._seriesEpisodeStatus==='error'?`<div class="kg-sd-message" role="status">${uiText('Не удалось загрузить эпизоды.')} <button type="button" data-series-retry>${uiText('Повторить')}</button></div>`:list.length?list.map(e=>episodeMarkup(f,e,marks,logs)).join(''):`<p class="kg-sd-message" role="status">${uiText(f._seriesEpisodeStatus==='ready'?'Эпизоды пока не объявлены.':f._detailsLoaded&&!seasons.length?'Сведения о сезонах пока недоступны.':'Загружаем эпизоды…')}</p>`}</div>`;
  }
  function markup(f,{closable=false}={}){
    const year=String(f.first_air_date||f.release_date||f.release||'').slice(0,4),last=String(f.last_air_date||'').slice(0,4),ended=['Ended','Canceled'].includes(f.status);
    const years=year+(!ended&&f.in_production?'–…':last&&last!==year?'–'+last:'');
    const countries=[...new Set(f.countries||f.origin_country||[])].map(code=>`<button type="button" data-kg-film-country="${esc(code)}">${esc(cname(code))}</button>`).join(' · ');
    const count=Number(f.number_of_seasons)||0,rating=Number(f.average??f.vote_average)||0;
    const people=(f.castFull||[]).map(p=>`<button type="button" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-profile="${esc(p.photo||'')}" data-kg-person-role="Актёр">${esc(p.name)}</button>`).join('');
    const creators=(f.created_by?.length?f.created_by:f.dirsFull||[]).map(p=>`<button type="button" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="Режиссёр">${esc(p.name)}</button>`).join(', ');
    const original=f.originalTitle||f.original_title,art=f.backdrop_path||f.poster_path;
    const tags=(f.genres||[]).map(g=>typeof g==='string'?g:g.name).filter(Boolean).join(' · ');
    return `<section class="kg-film-detail kg-series-detail" data-selected-film="${f.id}"><div data-film-part="summary" class="kg-sd-summary"><div class="kg-sd-hero">${art?`<img src="${esc(img(art))}" alt="" decoding="async">`:''}<div class="kg-sd-scrim"></div><div class="kg-sd-hero-copy"><div class="kg-sd-meta"><span>${esc(uiText(ended?'Завершён':'Сериал'))}</span><small>${[esc(years),countries,count?esc(countText(count,'{count} сезон','{count} сезона','{count} сезонов')):''].filter(Boolean).join(' · ')}</small></div><h1 data-kg-film-title>${esc(f.title)}</h1>${original&&original!==f.title?`<p class="kg-sd-original">${esc(original)}</p>`:''}<div class="kg-sd-badges">${rating?`<span>${sym('star')}<b>${rating.toFixed(1)}</b> TMDB</span>`:''}${f.cert?`<span>${esc(f.cert)}</span>`:''}</div></div>${closable?`<button type="button" class="kg-sd-inline-back" ${f._relatedPrevious?'data-kg-related-back':'data-act="close-film"'} aria-label="${uiText('Назад')}">${sym('arrow_back')}</button>`:''}</div><div class="kg-sd-actions"><button type="button" class="kg-sd-trailer-button" data-series-trailer ${f._trailer?'':'disabled'}>${sym('smart_display')}${uiText(f._trailer?'Трейлер':f._trailerStatus==='loading'?'Ищем трейлер…':'Трейлер не найден')}</button><div data-kg-film-actions class="kg-film-detail-actions" role="group">${window.KGWatchedButtonHtml(!!window.KGIsFilmWatched?.(f.id),`data-film-watched="${f.id}"`)}${kgBookmarkButton(f)}${window.KGFavorites?.button(f)||""}</div></div></div><div data-film-part="description" data-kg-film-description class="kg-sd-description"><p class="${f._seriesExpanded?'':'is-clamped'}">${esc(f.overview)}</p><button type="button" data-series-expand aria-expanded="${!!f._seriesExpanded}">${uiText(f._seriesExpanded?'Свернуть':'Читать далее')}${sym(f._seriesExpanded?'expand_less':'expand_more')}</button>${tags?`<p class="kg-sd-genres">${esc(tags)}</p>`:''}${creators?`<div class="kg-sd-creators">${uiText('Создатели')}: ${creators}</div>`:''}${people?`<div class="kg-sd-cast"><span>${uiText('В главных ролях')}:</span>${people}</div>`:''}</div><section data-film-part="episodes" class="kg-sd-episodes">${episodesMarkup(f)}</section><section data-film-part="trailer" class="kg-sd-trailer" ${f._seriesTrailerOpen?'':'hidden'}><div data-kg-film-trailer class="kg-detail-trailer"><div data-kg-film-preview class="absolute inset-0"><button type="button" data-trailer-action="play" aria-label="${uiText('Воспроизвести трейлер')}">${sym('play_arrow')}</button></div></div><button type="button" data-trailer-action="close" hidden>${uiText('Закрыть трейлер')}</button></section><div data-film-part="providers">${window.KGLegalWatch?.markup(f.id)||''}</div><section data-film-part="related" data-kg-related-films data-film-id="${f.id}" data-context-key="${esc(f._kgRelatedContext||'')}" data-global-related="true" class="kg-sd-related"><h2>${uiText('Похожие сериалы')}</h2><div data-kg-related-list class="flex gap-space-sm overflow-x-auto pb-1"><span>${uiText('Подбираем сериалы…')}</span></div></section></section>`;
  }
  const noteKey=id=>`kgSeries.episodeNotes.v1.${window.KGSeries.rawId(id)}`;
  function readEpisodeNotes(id){try{const value=JSON.parse(localStorage.getItem(noteKey(id))||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
  function persistEpisode(series,episode,season,value){
    const key=`${season}:${episode.episode_number}`,logs=readEpisodeNotes(series.id),marks=readMarks(series.id);
    if(value){logs[key]=value;marks.add(key);}else{delete logs[key];marks.delete(key);}
    const keys=[noteKey(series.id),storageKey(series.id)],before=keys.map(k=>localStorage.getItem(k));
    try{localStorage.setItem(keys[0],JSON.stringify(logs));localStorage.setItem(keys[1],JSON.stringify([...marks]));}
    catch(error){keys.forEach((k,i)=>{try{before[i]===null?localStorage.removeItem(k):localStorage.setItem(k,before[i]);}catch{}});throw error;}
    document.querySelectorAll('.kg-series-detail').forEach(card=>{const model=window.KGFilmCard.modelFor(card);if(model?.id===series.id)repaint(card,model);});
    document.dispatchEvent(new CustomEvent('kg:episode-note-change',{detail:{id:series.id,season,episode:episode.episode_number}}));
  }
  function unmarkEpisode(series,season,number){
    const marks=readMarks(series.id);marks.delete(`${season}:${number}`);
    localStorage.setItem(storageKey(series.id),JSON.stringify([...marks]));
    document.querySelectorAll('.kg-series-detail').forEach(card=>{const model=window.KGFilmCard.modelFor(card);if(model?.id===series.id)repaint(card,model);});
    document.dispatchEvent(new CustomEvent('kg:episode-note-change',{detail:{id:series.id,season,episode:number}}));
  }
  function openEpisodeNote(series,episode,season){
    const key=`${season}:${episode.episode_number}`,initial=readEpisodeNotes(series.id)[key]||{};
    const parent={id:series.id,adult:series.adult,title:series.title,original_title:series.original_title||series.originalTitle,poster_path:series.poster_path,backdrop_path:series.backdrop_path,release_date:series.release_date||series.release,countries:series.countries,origin_country:series.origin_country};
    const meta={episode_number:episode.episode_number,name:episode.name,overview:episode.overview,still_path:episode.still_path,air_date:episode.air_date,runtime:episode.runtime};
    return window.KGViewingNote.open({kind:'episode',title:episode.name||uiText('Эпизод {episode}',{episode:episode.episode_number}),subtitle:series.title,badge:`S${season}·E${episode.episode_number}`,poster:episode.still_path||series.poster_path,runtime:episode.runtime,release:episode.air_date,initial,
      onSave:value=>persistEpisode(parent,meta,season,{...value,series:parent,episode:meta,season}),
      onDelete:readMarks(series.id).has(key)||Object.hasOwn(readEpisodeNotes(series.id),key)?()=>persistEpisode(parent,meta,season,null):null
    });
  }
  function diaryEntries(){const rows=[];for(const storage of Object.keys(localStorage)){if(!storage.startsWith('kgSeries.episodeNotes.v1.'))continue;const raw=Number(storage.slice('kgSeries.episodeNotes.v1.'.length));if(!Number.isSafeInteger(raw)||raw<=0)continue;const id=1e12+raw,marks=readMarks(id);for(const [key,note] of Object.entries(readEpisodeNotes(id))){if(note.diary===false||!marks.has(key)||!note.series||!note.episode)continue;const f=note.series,e=note.episode;rows.push({film:{...f,poster:f.poster_path,original:f.original_title,year:String(f.release_date||'').slice(0,4),title:`${f.title} · S${note.season}E${e.episode_number} · ${e.name||''}`,_diaryKey:`${id}:${key}`,_episodeLog:{series:f,episode:e,season:note.season}},note});}}return rows;}
  function repaint(card,f){const region=card.querySelector('[data-film-part="episodes"]');if(region){const left=region.querySelector('.kg-sd-season-tabs')?.scrollLeft||0;region.innerHTML=episodesMarkup(f);region.querySelector('.kg-sd-season-tabs').scrollLeft=left;}}
  async function loadSeason(card,f,force=false){
    if(!apiKey||!card.isConnected)return;const season=f._seriesSeason??initialSeason(f.seasons||[]);if(season===null)return;f._seriesSeason=season;
    const state=states.get(f)||{};states.set(f,state);const key=`${filmLocale}:${f.id}:${season}`;
    if(!force&&state.key===key&&['loading','ready'].includes(f._seriesEpisodeStatus))return;
    state.key=key;const token=state.token=(state.token||0)+1;f._seriesEpisodeStatus='loading';f._seriesEpisodes=[];repaint(card,f);
    try{
      let entry=seasonCache.get(key);if(force||!entry||Date.now()-entry.time>3600000){const promise=requestTmdb(`tv/${window.KGSeries.rawId(f.id)}/season/${season}`,{language:filmLocale});entry={time:Date.now(),promise};seasonCache.set(key,entry);if(seasonCache.size>40)seasonCache.delete(seasonCache.keys().next().value);}
      const details=await entry.promise;if(state.token!==token||!card.isConnected)return;
      f._seriesEpisodes=(details.episodes||[]).filter(e=>Number.isInteger(e.episode_number));f._seriesEpisodeStatus='ready';repaint(card,f);
    }catch{seasonCache.delete(key);if(state.token!==token||!card.isConnected)return;f._seriesEpisodeStatus='error';repaint(card,f);}
  }
  function enhance(card,f){if(!card?.matches('.kg-series-detail'))return;loadSeason(card,f);}
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-series-season],[data-series-retry],[data-series-expand],[data-series-episode],[data-series-watched],[data-series-trailer],[data-series-note]');if(!button)return;
    const card=button.closest('.kg-series-detail'),f=card&&window.KGFilmCard.modelFor(card);if(!f)return;event.preventDefault();
    if(button.hasAttribute('data-series-season')){f._seriesSeason=Number(button.dataset.seriesSeason);f._seriesOpenEpisode=null;loadSeason(card,f);return;}
    if(button.hasAttribute('data-series-retry')){loadSeason(card,f,true);return;}
    if(button.hasAttribute('data-series-expand')){f._seriesExpanded=!f._seriesExpanded;button.setAttribute('aria-expanded',String(f._seriesExpanded));card.querySelector('[data-kg-film-description]>p').classList.toggle('is-clamped',!f._seriesExpanded);button.innerHTML=uiText(f._seriesExpanded?'Свернуть':'Читать далее')+sym(f._seriesExpanded?'expand_less':'expand_more');return;}
    if(button.hasAttribute('data-series-episode')){const [season,number]=button.dataset.seriesEpisode.split(':').map(Number),episode=f._seriesEpisodes?.find(e=>e.episode_number===number);if(episode)window.KGEpisodePage.open(f,episode,season,{episodes:f._seriesEpisodes,opener:button});return;}
    if(button.hasAttribute('data-series-trailer')){f._seriesTrailerOpen=true;const region=card.querySelector('[data-film-part="trailer"]');region.hidden=false;window.KGFilmCard.playTrailer(card,f,false);region.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(button.hasAttribute('data-series-note')){const [season,number]=button.dataset.seriesNote.split(':').map(Number),episode=f._seriesEpisodes?.find(e=>e.episode_number===number);if(episode)openEpisodeNote(f,episode,season);return;}
    const key=button.dataset.seriesWatched,lock=`${f.id}:${key}`;if(pending.has(lock))return;pending.add(lock);
    try{const marks=readMarks(f.id);if(!marks.has(key)){const episode=f._seriesEpisodes?.find(e=>e.episode_number===Number(key.split(':')[1]));if(episode)openEpisodeNote(f,episode,f._seriesSeason);return;}if(!await window.KGConfirmRemoval({kind:'watched',title:`${f.title} · ${seasonLabel(f._seriesSeason)} · ${key.split(':')[1]}`}))return;unmarkEpisode(f,f._seriesSeason,Number(key.split(':')[1]));}finally{pending.delete(lock);}
  });
  window.KGSeriesDetail={markup,enhance,progress,initialSeason,readMarks,openEpisodeNote,readEpisodeNotes,diaryEntries,persistEpisode,unmarkEpisode};
})();
