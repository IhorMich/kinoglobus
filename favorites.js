/* Personal favorites, separate from watched history and bookmarks. */
(() => {
  const KEY='kgFavorites.v1';let dialog,filter='all';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=()=>'<svg class="kg-favorite-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const isSeries=id=>window.KGSeries?.isSeriesId(id)??(Number(id)>1e12&&Number(id)<1e12+2147483648);
  function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
  function snapshot(f){
    const id=Number(f?.id);if(!Number.isSafeInteger(id)||id<=0||!movieCatalog.allows({...f,id})||f.media_type==='person')return null;
    return {id,adult:false,media_type:isSeries(id)?'tv':'movie',title:f.title||f.name||f.original_title||f.original||uiText(isSeries(id)?'Сериал':'Фильм'),original_title:f.original_title||f.originalTitle||f.original_name||f.original||'',release_date:f.release_date||f.release||f.first_air_date||String(f.year||''),poster_path:f.localizedPoster?.path||f.poster_path||f.poster||'',backdrop_path:f.backdrop_path||'',vote_average:Number(f.average??f.vote_average??f.score)||0,overview:String(f.overview||'').slice(0,500),_cc:f._cc||f.cc||''};
  }
  function list(){return Object.values(read()).filter(f=>Number.isSafeInteger(Number(f?.id))&&movieCatalog.allows(f)).sort((a,b)=>(Date.parse(b.favoritedAt)||0)-(Date.parse(a.favoritedAt)||0));}
  const has=id=>!!read()[Number(id)];
  const label=enabled=>uiText(enabled?'Убрать из любимых':'Добавить в любимые');
  function button(f){const film=snapshot(f);if(!film)return '';const enabled=has(film.id);return `<button type="button" class="kg-favorite-button" data-kg-favorite="${film.id}" data-kg-favorite-film="${esc(encodeURIComponent(JSON.stringify(film)))}" aria-pressed="${enabled}" aria-label="${esc(label(enabled))}" title="${esc(label(enabled))}">${icon()}</button>`;}
  function paint(){document.querySelectorAll('[data-kg-favorite]').forEach(b=>{const enabled=has(b.dataset.kgFavorite);b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',label(enabled));b.title=label(enabled);});}
  function toggle(f){
    const id=Number(f?.id);if(!Number.isSafeInteger(id)||id<=0)return false;const records=read(),enabled=!records[id];
    if(enabled){const record=snapshot(f);if(!record)return false;records[id]={...record,favoritedAt:new Date().toISOString()};}else delete records[id];
    localStorage.setItem(KEY,JSON.stringify(records));paint();render();document.dispatchEvent(new CustomEvent('kg:favorite-change',{detail:{id,enabled,mediaType:isSeries(id)?'tv':'movie'}}));return enabled;
  }
  function render(){
    if(!dialog?.open)return;const scroll=dialog.querySelector('.kg-favorites-list'),top=scroll.scrollTop,focused=dialog.contains(document.activeElement),items=list(),shown=items.filter(f=>filter==='all'||(filter==='series')===isSeries(f.id));
    dialog.querySelector('[data-favorites-count]').textContent=String(items.length);
    dialog.querySelectorAll('[data-favorites-filter]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.favoritesFilter===filter)));
    scroll.innerHTML=shown.length?shown.map(f=>{const year=String(f.release_date||'').slice(0,4),poster=/^\/[\w.-]+$/.test(f.poster_path||'')?f.poster_path:'';return `<article class="kg-favorites-row"><button type="button" class="kg-favorites-open" data-favorite-open="${f.id}" aria-label="${esc(uiText(isSeries(f.id)?'Открыть сериал {title}':'Открыть фильм {title}',{title:f.title}))}"><span class="kg-favorites-poster">${icon()}${poster?`<img src="https://image.tmdb.org/t/p/w185${esc(poster)}" alt="" loading="lazy" onerror="this.remove()">`:""}</span><span class="kg-favorites-copy"><b>${esc(f.title)}</b><span>${esc([uiText(isSeries(f.id)?'Сериал':'Фильм'),/^\d{4}$/.test(year)?year:'',f.vote_average>0?'★ '+f.vote_average.toFixed(1):''].filter(Boolean).join(' · '))}</span>${f.original_title&&f.original_title!==f.title?`<small>${esc(f.original_title)}</small>`:''}</span></button>${button(f)}</article>`;}).join(''):`<div class="kg-favorites-empty">${icon()}<h2>${uiText(items.length?'В этом разделе пока пусто':'Пока нет любимых')}</h2><p>${uiText('Нажмите на сердечко в карточке фильма или сериала.')}</p></div>`;
    scroll.scrollTop=top;if(focused)dialog.querySelector('[data-favorites-filter][aria-selected="true"]')?.focus({preventScroll:true});
  }
  function open(){
    if(!dialog){dialog=document.createElement('dialog');dialog.id='kg-favorites';dialog.setAttribute('aria-labelledby','kg-favorites-title');dialog.innerHTML=`<div class="kg-favorites-shell"><header><button type="button" data-favorites-back autofocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg>${uiText('Назад')}</button><h1 id="kg-favorites-title">${uiText('Любимые')}</h1><b data-favorites-count>0</b></header><div class="kg-favorites-tabs" role="tablist" aria-label="${uiText('Тип контента')}">${[['all','Все'],['films','Фильмы'],['series','Сериалы']].map(([key,text])=>`<button type="button" role="tab" data-favorites-filter="${key}" aria-selected="${filter===key}">${uiText(text)}</button>`).join('')}</div><div class="kg-favorites-list"></div><p data-favorites-status role="status" hidden></p></div>`;document.body.append(dialog);dialog.addEventListener('click',event=>{if(event.target.closest('[data-favorites-back]')){dialog.close();return;}const tab=event.target.closest('[data-favorites-filter]');if(tab){filter=tab.dataset.favoritesFilter;render();return;}const opener=event.target.closest('[data-favorite-open]');if(opener){const film=read()[opener.dataset.favoriteOpen];if(film)window.KGFilmCard.openDialog(film,opener);}});dialog.addEventListener('close',()=>dialog.__opener?.isConnected&&dialog.__opener.focus({preventScroll:true}));}
    dialog.__opener=document.activeElement;filter='all';if(!dialog.open)dialog.showModal();render();dialog.querySelector('.kg-favorites-list').scrollTop=0;
  }
  document.addEventListener('click',event=>{const target=event.target.closest('[data-kg-favorite]');if(!target)return;event.preventDefault();event.stopPropagation();try{toggle(JSON.parse(decodeURIComponent(target.dataset.kgFavoriteFilm)));}catch{const host=target.closest('.kg-film-detail')||dialog;if(host){let status=host.querySelector('[data-favorite-status]');if(!status){status=document.createElement('p');status.dataset.favoriteStatus='';status.setAttribute('role','status');host.append(status);}status.textContent=uiText('Не удалось изменить список любимых.');}}},true);
  window.KGFavorites={button,icon,has,toggle,list,snapshot,open};
})();
