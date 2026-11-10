// ========== Film Detail Page Module ==========
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const poster=(path,size="w342")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  const backdrop=(path,size="w1280")=>path?`https://image.tmdb.org/t/p/${size}${path}`:"";
  
  // Genre mapping
  const GENRES={
    28:"Боевик",12:"Приключение",16:"Анимация",35:"Комедия",80:"Криминал",99:"Документальный",
    18:"Драма",10751:"Семейный",14:"Фэнтези",36:"История",27:"Ужасы",10402:"Музыка",
    9648:"Мистика",10749:"Романтика",878:"Научная фантастика",10770:"ТВ-фильм",53:"Триллер",10752:"Война"
  };

  // Certification mapping
  const RATINGS={"G":"General Audiences","PG":"Parental Guidance","PG-13":"Parents Strongly Cautioned","R":"Restricted","NC-17":"Adults Only"};

  const state={
    currentFilm:null,
    collectionType:null,
    collectionId:null,
    collectionName:null,
    isLoading:false
  };

  function parseRoute(){
    const hash=window.location.hash.slice(1);
    const match=hash.match(/^film\/(\d+)\/(.+?)\/(.+?)$/);
    if(!match)return null;
    return {filmId:parseInt(match[1]),collectionType:match[2],collectionId:match[3]};
  }

  function formatGenres(genreIds){
    if(!Array.isArray(genreIds))return "";
    return genreIds.slice(0,3).map(id=>GENRES[id]||"").filter(Boolean).join(" · ");
  }

  function formatRuntime(minutes){
    if(!minutes)return "";
    const hrs=Math.floor(minutes/60);
    const mins=minutes%60;
    return hrs>0?`${hrs} ч ${mins} мин`:`${mins} мин`;
  }

  function renderHeroSection(film,deps){
    const backdropUrl=film.backdrop_path?backdrop(film.backdrop_path):poster(film.poster_path,"w780");
    const posterUrl=poster(film.poster_path);
    const year=(film.release_date||"").slice(0,4);
    const rating=Number(film.vote_average||0).toFixed(1);
    const trailerBtn=state.currentFilm&&state.currentFilm._trailer?'<button class="flex items-center gap-2 text-on-surface hover:text-primary" data-hero-trailer type="button"><span class="material-symbols-outlined text-[20px]">play_arrow</span><span>Смотреть трейлер</span></button>':"";

    return `
<div class="relative w-full h-64 sm:h-80 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl mb-6">
  ${backdropUrl?`<img src="${backdropUrl}" alt="" class="absolute inset-0 w-full h-full object-cover">`:""}
  <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"></div>
  ${posterUrl?`<img src="${posterUrl}" alt="${esc(film.title)}" class="absolute left-4 sm:left-6 bottom-4 w-20 h-32 rounded-lg object-cover shadow-lg border border-primary-container/30">`:""}
  
  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    ${state.currentFilm&&state.currentFilm._trailer?`<button class="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-container/90 text-on-primary shadow-xl hover:bg-primary-container active:scale-95 transition-all pointer-events-auto" data-hero-trailer type="button"><span class="material-symbols-outlined text-[32px] sm:text-[40px]">play_arrow</span></button>`:""}
  </div>
  
  <div class="absolute left-4 sm:left-6 right-4 sm:right-6 bottom-4 sm:bottom-6 z-10">
    <h1 class="font-display-hero-mobile sm:font-display-hero text-display-hero-mobile sm:text-display-hero text-primary font-bold leading-tight mb-2">${esc(film.title||film.original_title||"Фильм")}</h1>
    <div class="flex items-center gap-3 flex-wrap">
      <span class="font-label-md text-label-md text-on-surface-variant">${year}</span>
      ${film.runtime?`<span class="font-label-md text-label-md text-on-surface-variant">${formatRuntime(film.runtime)}</span>`:""}
      <div class="flex items-center gap-1 bg-surface-container-highest/80 px-2 py-1 rounded-full">
        <span class="material-symbols-outlined text-primary text-[18px]">star</span>
        <span class="font-label-md text-label-md text-primary font-bold">${rating}</span>
      </div>
    </div>
  </div>
</div>`;
  }

  function renderMetadata(film){
    const year=(film.release_date||"").slice(0,4);
    const genreStr=formatGenres(film.genre_ids);
    const originCountries=(film.origin_country||[]).join(", ");
    
    return `
<div class="grid grid-cols-2 gap-3 mb-6">
  ${film.original_title&&film.original_title!==film.title?`
  <div class="col-span-2">
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Оригинальное название</p>
    <p class="font-body-md text-body-md text-on-surface">${esc(film.original_title)}</p>
  </div>
  `:""}
  
  ${year?`
  <div>
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Год выпуска</p>
    <p class="font-body-md text-body-md text-on-surface">${year}</p>
  </div>
  `:""}
  
  ${genreStr?`
  <div>
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Жанры</p>
    <p class="font-body-md text-body-md text-on-surface">${genreStr}</p>
  </div>
  `:""}
  
  ${film.vote_average?`
  <div>
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Рейтинг TMDB</p>
    <p class="font-body-md text-body-md text-on-surface">${Number(film.vote_average||0).toFixed(1)}/10</p>
  </div>
  `:""}
  
  ${originCountries?`
  <div>
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Страна</p>
    <p class="font-body-md text-body-md text-on-surface">${esc(originCountries)}</p>
  </div>
  `:""}
  
  ${film.runtime?`
  <div>
    <p class="font-micro-caption text-micro-caption text-text-muted uppercase tracking-wide mb-1">Длительность</p>
    <p class="font-body-md text-body-md text-on-surface">${formatRuntime(film.runtime)}</p>
  </div>
  `:""}
</div>`;
  }

  function renderSynopsis(film){
    if(!film.overview)return "";
    return `
<div class="mb-6">
  <h2 class="font-headline-md text-headline-md text-on-surface font-semibold mb-3">Синопсис</h2>
  <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${esc(film.overview)}</p>
</div>`;
  }

  function renderTrailerSection(deps){
    if(!state.currentFilm||!state.currentFilm._trailer)return "";
    const trailer=state.currentFilm._trailer;
    const trailerUrl=trailer.includes("youtube.com")||trailer.includes("youtu.be")?
      (trailer.includes("watch?v=")?(()=>{const match=trailer.match(/v=([a-zA-Z0-9_-]+)/);return match?`https://www.youtube.com/embed/${match[1]}`:""})():
       trailer.includes("youtu.be/")?(()=>{const match=trailer.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);return match?`https://www.youtube.com/embed/${match[1]}`:""})():""):
      trailer.includes("vimeo.com")?(()=>{const match=trailer.match(/vimeo\.com\/(\d+)/);return match?`https://player.vimeo.com/video/${match[1]}`:""})():
      "";
    
    if(!trailerUrl)return "";
    
    return `
<div class="mb-6">
  <h2 class="font-headline-md text-headline-md text-on-surface font-semibold mb-3">Трейлер</h2>
  <div class="relative w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-lg">
    <iframe class="w-full h-auto aspect-video" src="${trailerUrl}" title="Трейлер" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>`;
  }

  function renderActionButtons(){
    return `
<div class="flex gap-2 mb-6">
  <button class="flex-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg active:scale-[0.98] transition-all" data-action-trailer type="button">
    <span class="material-symbols-outlined text-[20px]">play_arrow</span>
    <span>Смотреть трейлер</span>
  </button>
  <button class="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container text-on-surface hover:text-primary transition-all active:scale-[0.95]" data-action-bookmark type="button" title="Добавить в избранное">
    <span class="material-symbols-outlined text-[20px]">bookmark</span>
  </button>
  <button class="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container text-on-surface hover:text-primary transition-all active:scale-[0.95]" data-action-share type="button" title="Поделиться">
    <span class="material-symbols-outlined text-[20px]">share</span>
  </button>
</div>`;
  }

  function renderBackButton(){
    const backLabel=state.collectionName?`Назад к вайбу «${esc(state.collectionName)}»`:"Назад к подборкам";
    return `
<div class="mb-6 pt-4 border-t border-surface-border-subtle">
  <button class="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all" data-back-button type="button">
    <span class="material-symbols-outlined text-[20px]">arrow_back</span>
    <span class="font-label-md text-label-md">${backLabel}</span>
  </button>
</div>`;
  }

  function render(root,deps){
    if(!root||!state.currentFilm)return;
    
    root.innerHTML=`
<div class="flex flex-col w-full pb-8">
  <div class="flex items-center justify-between pt-safe pb-4 px-gutter-mobile border-b border-surface-border-subtle mb-6">
    <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary" data-close-film type="button">
      <span class="material-symbols-outlined text-[20px]">close</span>
    </button>
    <span class="font-micro-caption text-micro-caption text-primary/80 uppercase tracking-widest">Фильм</span>
    <div class="w-6"></div>
  </div>
  
  <div class="px-gutter-mobile">
    ${renderHeroSection(state.currentFilm,deps)}
    ${renderMetadata(state.currentFilm)}
    ${renderSynopsis(state.currentFilm)}
    ${renderTrailerSection(deps)}
    ${renderActionButtons()}
    ${renderBackButton()}
  </div>
</div>`;

    attachEventListeners(root,deps);
  }

  function attachEventListeners(root,deps){
    root.querySelectorAll("[data-hero-trailer],[data-action-trailer]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(state.currentFilm&&state.currentFilm._trailer){
          const trailerSection=root.querySelector(".mb-6:has(iframe)");
          if(trailerSection){
            trailerSection.scrollIntoView({behavior:"smooth",block:"start"});
          }
        }
      });
    });

    root.querySelector("[data-action-bookmark]")?.addEventListener("click",()=>{
      const btn=root.querySelector("[data-action-bookmark]");
      btn.classList.toggle("text-secondary");
      btn.classList.toggle("bg-secondary-container/20");
    });

    root.querySelector("[data-action-share]")?.addEventListener("click",()=>{
      const text=`${state.currentFilm.title} (${(state.currentFilm.release_date||"").slice(0,4)})`;
      if(navigator.share){
        navigator.share({title:"Киноглобус",text,url:window.location.href}).catch(()=>{});
      }else{
        const url=window.location.href;
        navigator.clipboard.writeText(`${text}\n${url}`).catch(()=>{});
      }
    });

    root.querySelector("[data-close-film]")?.addEventListener("click",()=>{
      goBack();
    });

    root.querySelector("[data-back-button]")?.addEventListener("click",()=>{
      goBack();
    });
  }

  function goBack(){
    if(state.collectionType==="mood"){
      window.location.hash=`#mood`;
    }else if(state.collectionType==="oscar"){
      window.location.hash=`#oscar`;
    }else{
      window.location.hash=``;
    }
  }

  function openFilm(filmId,collectionType,collectionId,collectionName,deps){
    state.currentFilm=null;
    state.collectionType=collectionType;
    state.collectionId=collectionId;
    state.collectionName=collectionName;
    state.isLoading=true;

    // Note: showView is called from collections.js hash handler
    // This function just renders the content

    const filmPage=$("film-page");
    if(!filmPage)return;

    filmPage.replaceChildren();

    deps.details(filmId).then(details=>{
      state.currentFilm={
        ...details,
        id:filmId,
        _detailsLoaded:true
      };
      state.isLoading=false;
      render(filmPage,deps);
    }).catch(error=>{
      state.isLoading=false;
      console.error("[Kinoglobus] Не удалось загрузить сведения о фильме:",error);
    });

    deps.trailerFor({id:filmId}).then(trailer=>{
      if(state.currentFilm&&state.currentFilm.id===filmId){
        state.currentFilm._trailer=trailer;
        state.currentFilm._trailerStatus=trailer?"ready":"missing";
        render(filmPage,deps);
      }
    }).catch(e=>{
      if(state.currentFilm&&state.currentFilm.id===filmId){
        state.currentFilm._trailerStatus="missing";
        render(filmPage,deps);
      }
      console.error("[Kinoglobus] Не удалось загрузить трейлер:",e);
    });
  }

  window.KGFilmDetailPage={openFilm};
})();
