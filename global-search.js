/* Global movie, actor and director search backed by TMDB. */
(function(){
  "use strict";
  const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const image=(path,size="w185")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const root=document.createElement("div");root.id="kg-global-search";root.hidden=true;
  const emptySearch = `
    <div class="kgs-empty">
      <h2>${uiText("Поиск в Moven")}</h2>
      <p>${uiText("Найди фильм, режиссёра или актёра")}</p>
    </div>`;
  root.innerHTML = `
    <section class="kg-search-screen" role="dialog" aria-modal="true" aria-label="Поиск фильмов, актёров и режиссёров">
      <header class="kg-main-header">
        <div class="kg-main-header-actions">
          <button type="button" class="kg-header-action" data-kgs-close aria-label="Закрыть поиск">
            <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <label class="kg-header-action kg-header-search">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
            <input type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Поиск" aria-label="Поиск">
          </label>
        </div>
      </header>
      <div class="kgs-body">
        <div class="kgs-results" data-kgs-results aria-live="polite"></div>
      </div>
    </section>`;
  localizeInterfaceMarkup(root);
  document.body.appendChild(root);
  const style = document.createElement("style");
  style.textContent = `
#kg-global-search {
  position: fixed;
  inset: 0;
  z-index: 990;
  color: rgb(var(--kg-on-surface));
}
.kg-search-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: rgb(var(--kg-canvas-obsidian));
}
.kg-search-screen > header, .kg-search-screen > nav { flex: none; }
.kg-search-screen .kg-header-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.kg-search-screen .kg-header-search input:focus {
  outline: 0;
  box-shadow: none;
}
.kg-search-screen .kg-header-search input::placeholder {
  color: inherit;
  opacity: .8;
}
.kgs-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.kgs-results {
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0 16px;
}
.kgs-empty {
  display: grid;
  align-content: center;
  gap: 8px;
  min-height: 100%;
  padding: 20px 0;
  text-align: center;
  font-family: var(--kg-font-heading);
}
.kgs-empty h2 {
  font-size: clamp(1.15rem, 4vw, 1.5rem);
  font-weight: 600;
}
.kgs-empty p {
  color: rgb(var(--kg-on-surface-variant));
  font-size: .9rem;
}
.kgs-status{padding:26px 8px;text-align:center;color:rgb(var(--kg-text-muted));font-size:13px}.kgs-section{margin:12px 0 7px;color:rgb(var(--kg-primary-fixed-dim));font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.kgs-best{margin:2px 0 12px;padding:10px;border:1px solid rgb(var(--kg-accent-deep));border-radius:15px;background:linear-gradient(115deg,rgb(var(--kg-warm-surface-13)),rgb(var(--kg-neutral-71)) 70%)}.kgs-best-label{margin:0 0 7px;color:rgb(var(--kg-accent-text));font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.kgs-result{width:100%;min-height:70px;display:flex;align-items:center;gap:12px;margin:6px 0;padding:8px;border:1px solid rgb(var(--kg-white)/0.04706);border-radius:13px;background:rgb(var(--kg-neutral-71));color:rgb(var(--kg-warm-text-26));text-align:left;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}.kgs-result:hover,.kgs-result.is-active{background:rgb(var(--kg-neutral-88));border-color:rgb(var(--kg-accent-muted));transform:translateY(-1px)}.kgs-result img,.kgs-avatar{width:46px;height:62px;flex:none;object-fit:cover;border-radius:7px;background:rgb(var(--kg-neutral-90))}.kgs-movie-poster{display:grid;place-items:center;overflow:hidden;border-radius:8px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}.kgs-result .kgs-movie-poster img{width:100%;height:100%;border-radius:0}.kgs-avatar{height:46px;border-radius:50%;display:grid;place-items:center;color:rgb(var(--kg-primary-fixed-dim))}.kgs-result-copy{min-width:0;flex:1}.kgs-result-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 14px var(--kg-font-heading)}.kgs-result-sub{display:block;margin-top:5px;color:rgb(var(--kg-neutral-121));font-size:11px}.kgs-score{flex:none;color:rgb(var(--kg-primary-fixed-dim));font-size:11px}@media(prefers-reduced-motion:reduce){.kgs-result{transition:none}}`;
  document.head.appendChild(style);
  const input = root.querySelector("input");
  const results = root.querySelector("[data-kgs-results]");
  window.KGMountBottomNav(root, root.querySelector(".kg-search-screen"), "", close);
  let timer=0,sequence=0,items=[],active=-1,lastFocus=null,previousOverflow="";
  const getKey=()=>{try{return typeof apiKey!=="undefined"?apiKey:"";}catch{return "";}};
  function setStatus(message){results.innerHTML=`<div class="kgs-status">${esc(message)}</div>`;}
  function normalize(value){return String(value||"").toLocaleLowerCase("ru").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ё/g,"е").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
  function score(item,query){const fields=item.kind==="movie"?[item.title,item.original_title]:[item.name];const q=normalize(query);let best=0;for(const raw of fields){const n=normalize(raw);if(!n)continue;const s=n===q?1000:n.startsWith(q)?840:n.split(" ").some(w=>w.startsWith(q))?700:n.includes(q)?520:0;best=Math.max(best,s);}return best+Math.min(50,Number(item.popularity)||0)*.03+(Number(item.vote_average)||0)*.3;}
  async function tmdb(path,query){const key=getKey();if(!key)throw new Error(uiText("Добавьте ключ TMDB в настройках, чтобы искать фильмы и людей."));const url=new URL(`https://api.themoviedb.org/3/${path}`);url.search=new URLSearchParams({api_key:key,language:path==="search/movie"?filmLocale:"ru-RU",query,include_adult:"false",page:"1"});const response=await movieCatalog.request(url);if(!response.ok)throw new Error(response.status===401?uiText("Ключ TMDB не принят. Проверьте его в настройках."):uiText("Ошибка TMDB ({status}).", {status: response.status}));return response.json();}
  function yearOf(item){const date=item.release_date||item.first_air_date;return date?date.slice(0,4):"";}
  function movieButton(f,index){const title=f.title||f.original_title||uiText("Без названия"),poster=image(f.poster_path),year=yearOf(f),rating=Number(f.vote_average)||0;return `<div class="kg-bookmark-row"><button type="button" class="kgs-result${index===active?" is-active":""}" data-kgs-item="${index}" aria-label="${esc(uiText("Открыть фильм {title}", {title}))}"><span class="kg-film-card-poster kgs-movie-poster">${poster?`<img src="${poster}" alt="" loading="lazy">`:`<span class="material-symbols-outlined" aria-hidden="true">movie</span>`}</span><span class="kgs-result-copy"><span class="kgs-result-title">${esc(title)}</span><span class="kgs-result-sub">${esc(f.original_title&&f.original_title!==title?f.original_title+" · ":"")}${year||uiText("Год неизвестен")}${rating?` · ★ ${rating.toFixed(1)}`:""}</span></span><span class="kgs-score">${uiText("Фильм")}</span></button>${kgBookmarkButton(f)}</div>`;}
  function personButton(p,index,role){const photo=image(p.profile_path),known=(p.known_for||[]).map(x=>x.title||x.name).filter(Boolean).slice(0,2).join(", ");return `<button type="button" class="kgs-result${index===active?" is-active":""}" data-kgs-item="${index}" aria-label="${esc(uiText("Открыть профиль {name}", {name: p.name}))}">${photo?`<img src="${photo}" alt="" loading="lazy">`:`<span class="kgs-avatar"><span class="material-symbols-outlined">person</span></span>`}<span class="kgs-result-copy"><span class="kgs-result-title">${esc(p.name)}</span><span class="kgs-result-sub">${esc(known||p.known_for_department||uiText("Кинематографист"))}</span></span><span class="kgs-score">${uiText(role)}</span></button>`;}
  function draw(data,query){const movies=(data.movies||[]).map(x=>({...x,kind:"movie"}));const people=(data.people||[]).map(x=>({...x,kind:"person"}));const all=[...movies,...people].map(x=>({...x,_score:score(x,query)})).filter(x=>x._score>0).sort((a,b)=>b._score-a._score);items=all.map(item=>item.kind==="movie"?localizeFilmListItem(item):item);active=all.length?0:-1;if(!all.length){results.innerHTML=`<div class="kgs-empty"><h2>${uiText("Ничего не нашлось")}</h2><p>${uiText("Попробуйте изменить или сократить запрос.")}</p></div>`;return;}
    const best=all[0],bestIndex=0;let html=`<section class="kgs-best"><p class="kgs-best-label">${uiText("Лучшее совпадение")}</p>${best.kind==="movie"?movieButton(items[bestIndex],bestIndex):personButton(best,bestIndex,best.known_for_department==="Directing"?"Режиссёр":"Актёр")}</section>`;
    const rest=all.slice(1);const movieRest=rest.filter(x=>x.kind==="movie"),actorRest=rest.filter(x=>x.kind==="person"&&x.known_for_department!=="Directing"),directorRest=rest.filter(x=>x.kind==="person"&&x.known_for_department==="Directing");
    if(best.kind==="movie")movieRest.unshift(best);if(best.kind==="person"){(best.known_for_department==="Directing"?directorRest:actorRest).unshift(best);}
    const section=(label,list,role)=>list.length?`<h3 class="kgs-section">${uiText(label)}</h3>${list.map(x=>{const i=all.indexOf(x);return x.kind==="movie"?movieButton(items[i],i):personButton(x,i,role);}).join("")}`:"";
    html+=section("Фильмы",movieRest,"Фильм")+section("Актёры",actorRest,"Актёр")+section("Режиссёры",directorRest,"Режиссёр");results.innerHTML=html;
  }
  async function search(query){const seq=++sequence;const q=query.trim();if(q.length<2){items=[];active=-1;results.innerHTML=emptySearch;return;}setStatus(uiText("Ищем точные совпадения…"));try{const [movieData,personData]=await Promise.all([tmdb("search/movie",q),tmdb("search/person",q)]);if(seq!==sequence||!root.isConnected)return;draw({movies:movieData.results||[],people:personData.results||[]},q);}catch(error){if(seq!==sequence)return;setStatus(error.message||uiText("Не удалось выполнить поиск."));}}
  function schedule() {
    clearTimeout(timer);
    sequence++;
    items = [];
    active = -1;
    const query = input.value;
    if (query.trim().length < 2) {
      search(query);
      return;
    }
    setStatus(uiText("Подбираем лучший вариант…"));
    timer = setTimeout(() => search(query), 260);
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    clearTimeout(timer);
    sequence++;
    document.body.style.overflow = previousOverflow;
    input.value = "";
    items = [];
    active = -1;
    lastFocus?.focus?.();
    lastFocus = null;
  }

  function open() {
    if (!root.hidden) return;
    window.KGFilmCard.stopTrailers();
    lastFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    results.innerHTML = emptySearch;
    root.hidden = false;
    if (matchMedia("(min-width: 768px) and (pointer: fine)").matches && !window.Capacitor?.isNativePlatform?.()) {
      input.focus();
    }
  }
  function openItem(index, opener = input){
    const item=items[index];
    if(!item)return;
    if(item.kind==="person"){
      const role=item.known_for_department==="Directing"?"Режиссёр":"Актёр";
      window.KGOpenPersonProfile?.(item.id,item.name,role,opener);
    } else window.KGFilmCard.openDialog({...item,_kgGlobalRelated:true},opener);
  }
  root.addEventListener("click",event=>{
    if(event.target.closest("[data-kgs-close]")){close();return;}
    const button=event.target.closest("[data-kgs-item]");
    if(button) openItem(Number(button.dataset.kgsItem),button);
  });
  input.addEventListener("input",schedule);
  document.addEventListener("click",event=>{if(event.target.closest("[data-kg-search-open]")){event.preventDefault();open();}});
  document.addEventListener("keydown",event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open();return;}if(root.hidden||document.querySelector(".kg-film-dialog[open]"))return;if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();return;}if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();if(!items.length)return;active=(active+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;root.querySelectorAll("[data-kgs-item]").forEach(el=>el.classList.toggle("is-active",Number(el.dataset.kgsItem)===active));root.querySelector(`[data-kgs-item="${active}"]`)?.scrollIntoView({block:"nearest"});}else if(event.key==="Enter"&&active>=0){event.preventDefault();openItem(active);}});
  // Let person profiles use their existing TMDB-backed modal from search.
})();
