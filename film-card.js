/* Shared film details, actions, and trailer player. */
(() => {
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const P = (path, size) => path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
const fl = code => `<span class="kgf">${flag(code,false)}</span>`;
const moneyText = amount => Number(amount) > 0 ? moneyFmt.format(Number(amount)) : uiText("Нет данных");
const langName = code => {
  try { return new Intl.DisplayNames([interfaceLanguage], {type:"language"}).of(code); }
  catch { return code; }
};
const noteLabel = id => uiText(window.KGHasCinemaDiaryNote?.(id) ? "Редактировать запись" : "Добавить запись");
function trailerThumb(v,f){
  const src=v&&v.site==="YouTube"?`https://i.ytimg.com/vi/${encodeURIComponent(v.key)}/hqdefault.jpg`:f.backdrop_path?P(f.backdrop_path,"w780"):"";
  return src?`<img src="${src}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-80" loading="eager" decoding="async" onerror="this.remove()">`:"";
}
function markup(f, {closable = true, inline = false} = {}) {
  const year=String(f.release_date||f.year||"").slice(0,4);
  const personLink=(p,role)=>p&&p.id?`<button type="button" data-kg-person-id="${p.id}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="${role}" class="kg-person-link">${esc(p.name)}</button>`:esc(p&&p.name||"");
  const cast=(f.castFull||[]).map(c=>`<button type="button" data-kg-person-id="${c.id||""}" data-kg-person-name="${esc(c.name)}" data-kg-person-role="Актёр" class="kg-person-card flex-shrink-0 w-28 flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-high" ${c.id?"":"disabled"}>
<div class="w-14 h-14 rounded-full overflow-hidden mb-2 bg-surface-variant shadow-md flex items-center justify-center">${c.photo?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="${P(c.photo,"w185")}">`:'<span class="material-symbols-outlined text-text-muted">person</span>'}</div>
<span class="font-label-sm text-label-sm text-on-surface font-semibold truncate w-full">${esc(c.name)}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate w-full">${esc(c.role)}</span></button>`).join("");
  const video=f._trailer;
  const oscar=f._oscarContext ? window.KGOscarPage?.info(f) : null;
  const awardRows=Array.isArray(f._oscarAwards)?f._oscarAwards:[];
  const awardWins=awardRows.filter(a=>a.won).length,awardNominations=awardRows.length-awardWins;
  const awardsHtml=oscar?(f._oscarAwards===undefined
    ?`<div class="pt-2 mt-1 border-t border-primary-container/20"><span class="font-micro-caption text-micro-caption text-text-muted">${uiText("Загружаем награды и номинации…")}</span></div>`
    :awardRows.length
      ?'<div class="pt-2 mt-1 border-t border-primary-container/20"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[18px]">emoji_events</span><span class="font-label-sm text-label-sm text-primary-fixed font-semibold">'+uiText('{count} '+(awardWins===1?'победа':awardWins>1&&awardWins<5?'победы':'побед'), {count: awardWins})+' · '+uiText('{count} '+(awardNominations===1?'номинация':awardNominations>1&&awardNominations<5?'номинации':'номинаций'), {count: awardNominations})+'</span></div><details class="mt-2"><summary class="flex items-center justify-between gap-2 cursor-pointer list-none rounded-lg bg-surface-container px-3 py-2 font-micro-caption text-micro-caption text-primary hover:bg-surface-container-high"><span>'+uiText("Полный список наград")+'</span><span class="material-symbols-outlined text-[16px]">expand_more</span></summary><div class="flex flex-col gap-1 pt-2">'+awardRows.map(a=>'<div class="flex items-start gap-1.5"><span class="material-symbols-outlined text-[16px] shrink-0 '+(a.won?'text-primary-container':'text-text-muted')+'" style="font-variation-settings:\'FILL\' '+(a.won?1:0)+';">'+(a.won?'emoji_events':'circle')+'</span><span class="font-body-sm text-body-sm '+(a.won?'text-on-surface font-semibold':'text-text-muted')+'">'+esc(a.label)+(a.year?' · '+a.year:'')+(a.won?'':uiText(' (номинация)'))+'</span></div>').join('')+'</div></details></div>'
      :""):"";
  const oscarBlock=oscar?`<div class="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-cinema-velvet-deep/50 via-surface-container-high to-surface-container-high border border-primary-container/25"><span class="material-symbols-outlined text-primary-container text-[28px] shrink-0" style="font-variation-settings:'FILL' 1;">workspace_premium</span><div class="min-w-0 flex flex-col gap-0.5"><h4 class="font-label-md text-label-md text-primary-fixed font-semibold">${uiText(oscar.best?"Оскар · Лучший фильм":"Лауреат премии «Оскар»")}</h4>${oscar.best?`<p class="font-label-sm text-label-sm text-primary-container font-semibold">${uiText("{number}-я церемония · {year} год", {number: oscar.n, year: oscar.year})}</p><p class="font-body-sm text-body-sm text-text-muted">${uiText("Главная награда Американской киноакадемии. Статуэтку получает лучший фильм года; эта картина вышла в {year} году.", {year: oscar.film})}</p>`:`<p class="font-body-sm text-body-sm text-text-muted">${uiText("Картина входит в список лауреатов Американской киноакадемии{year}.", {year: oscar.film?uiText(" · фильм {year} года", {year: oscar.film}):""})}</p>`}${awardsHtml}</div></div>`:"";
  const watched=!!window.KGIsFilmWatched?.(f.id),title=esc(f.title||uiText("Фильм"));
  const original = f.originalTitle || f.original_title;
  const orig=[year, original && original!==f.title ? esc(original) : ""].filter(Boolean).join(" · ");
  const countries=(f.countries&&f.countries.length?f.countries:(f._cc?[f._cc]:[])).map(cc=>`${esc(cname(cc))} ${fl(cc)}`).join(" · ");
  const genres=(f.genres?.length ? f.genres : genreLine(f).split(", ").filter(Boolean)).map(genre => uiText(genre)).join(" · ");
  const voteCount=Number(f.votes ?? f.vote_count)||0;
  const votes=voteCount>=1000?(voteCount/1000).toFixed(1)+"k":String(voteCount);
  const average=Number(f.average ?? f.vote_average)||0;
  const rating=average>0?`<div class="shrink-0 px-2.5 py-1 rounded-lg bg-primary-container/15 flex items-center gap-1.5"><span class="material-symbols-outlined text-primary-container text-[16px]" style="font-variation-settings:'FILL' 1;">star</span><span class="font-label-sm text-label-sm text-primary">${average.toFixed(1)} TMDB</span><span class="font-micro-caption text-micro-caption text-text-muted">(${votes})</span></div>`:"";
  const certBadge=f.cert?`<span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-cinema-velvet-deep/90 text-secondary font-label-sm text-label-sm">${esc(f.cert)}</span>`:"";
  const fact=(label,value,sub)=>`<div class="p-3.5 rounded-xl bg-surface-container flex flex-col gap-1"><span class="font-micro-caption text-micro-caption uppercase text-text-muted">${uiText(label)}</span>${value}${sub?`<span class="font-body-sm text-body-sm text-text-muted">${sub}</span>`:""}</div>`;
  const loading=f._detailsLoaded?"—":uiText("Загружаем…");
  const dirName=f.dirs&&f.dirs.length?(f.dirsFull&&f.dirsFull.length?f.dirsFull.map(d=>personLink(d,"Режиссёр")).join(", "):esc(f.dirs.join(", "))):loading;
  const releaseText=f.release?new Date(f.release+"T00:00:00").toLocaleDateString(interfaceLanguage,{day:"numeric",month:"long",year:"numeric"}):loading;
  const poster = filmPosterMarkup({...f,localizedPoster:f.localizedPoster || {path:f.poster_path || f.backdrop_path,showTitle:true}}, "w342") || '<span class="material-symbols-outlined" aria-hidden="true">movie</span>';
  const diaryLabel = esc(noteLabel(f.id));
  const preview = video
    ? `<button type="button" data-trailer-action="play" aria-label="${uiText("Воспроизвести трейлер")}" class="absolute inset-0 grid place-items-center text-primary-container">${trailerThumb(video,f)}<span class="relative grid place-items-center w-16 h-16 rounded-full bg-black/55 border border-primary-container/60"><span class="material-symbols-outlined text-[44px]" aria-hidden="true">play_arrow</span></span></button>`
    : `<div role="status" class="absolute inset-0 grid place-items-center px-3 text-center text-text-muted">${uiText(f._trailerStatus==="missing" ? "Трейлер не найден" : "Ищем трейлер…")}</div>`;
  const preferredLanguage = filmTextLanguage({original_language:f.originalLang});
  const languageNote = f.overviewLang && f.overviewLang !== preferredLanguage
    ? uiText("Показано доступное описание. Язык: {language}.", {language:langName(f.overviewLang)})
    : "";
  return `<section class="kg-film-detail" ${inline ? "data-kg-inline-film" : ""} data-selected-film="${Number(f.id)}">
<div data-film-part="summary" class="kg-film-detail-summary">
<div class="kg-film-detail-meta">
<h3 class="font-headline-md text-headline-md text-primary font-bold break-words" data-kg-film-title>${title}</h3>
${orig? `<p class="text-body-sm text-text-muted">${orig}</p>` : ""}
<p class="mt-1 text-body-sm text-on-surface-variant">${[countries,esc(genres),f.runtime?uiText("{minutes} мин",{minutes:f.runtime}):""].filter(Boolean).join(" · ")}</p>
${rating ? `<div class="mt-2 flex" data-kg-film-rating>${rating}</div>` : ""}
<div data-kg-film-actions class="kg-film-detail-actions">
${window.KGWatchedButtonHtml(watched, `data-film-watched="${Number(f.id)}"`)}
${kgBookmarkButton(f)}
<button type="button" data-kg-film-note aria-label="${diaryLabel}" title="${diaryLabel}"><span class="material-symbols-outlined" aria-hidden="true">add</span></button>
</div>
</div>
<div class="kg-film-detail-poster">${poster}</div>
${closable ? `<button type="button" data-act="close-film" aria-label="${uiText("Свернуть карточку")}" class="kg-film-detail-close"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>` : ""}
</div>
<div data-film-part="description" data-kg-film-description class="p-4 rounded-xl bg-surface-container flex flex-col gap-2"><h4 class="font-label-md text-label-md text-primary-fixed">${uiText("О фильме")}</h4>
${f.tagline&&f.taglineLang===f.overviewLang ? `<blockquote class="italic text-primary-fixed">«${esc(f.tagline)}»</blockquote>` : ""}
<p class="text-body-md text-on-surface leading-relaxed">${esc(f.overview)}</p>${languageNote ? `<small class="text-text-muted">${esc(languageNote)}</small>` : ""}</div>
<div data-film-part="trailer" class="flex flex-col gap-2">
<div data-kg-film-trailer class="kg-detail-trailer rounded-xl border border-primary-container/30" ${video ? 'data-video-key="' + esc(video.key) + '"' : ""}>
<div data-kg-film-preview class="absolute inset-0">${preview}${certBadge}</div></div>
<div class="flex flex-wrap items-center gap-2">
<button type="button" hidden data-trailer-action="close" class="min-h-10 px-3 rounded-lg bg-surface-container text-primary text-label-sm"><span class="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">close</span> ${uiText("Закрыть трейлер")}</button>
${video? `<a href="${esc(watchUrl(video))}" target="_blank" rel="noopener noreferrer" class="text-micro-caption text-primary underline">${esc(uiText("Не воспроизводится? Открыть на {site}", {site:video.site}))}</a>` : ""}
</div></div>
<div data-film-part="providers">${window.KGLegalWatch?.markup(f.id)||""}</div>
<div data-film-part="awards">${oscarBlock}</div>
<div data-film-part="cast" class="flex flex-col gap-2"><div class="flex items-center justify-between"><span class="font-label-md text-label-md text-primary-fixed tracking-wide uppercase">${uiText("В главных ролях")}</span>${(f.castFull||[]).length?`<span class="font-micro-caption text-micro-caption text-text-muted">${uiText("{count} {unit}", {count: f.castFull.length, unit: f.castFull.length%10===1&&f.castFull.length!==11?"актёр":f.castFull.length%10>1&&f.castFull.length%10<5&&(f.castFull.length<10||f.castFull.length>20)?"актёра":"актёров"})}</span>`:""}</div>${cast?`<div class="flex gap-2.5 overflow-x-auto py-1" style="-webkit-overflow-scrolling:touch">${cast}</div>`:`<p class="font-body-sm text-body-sm text-text-muted">${f._detailsLoaded?uiText("Сведения об актёрах недоступны."):uiText("Загружаем актёров…")}</p>`}</div>
<div data-film-part="facts" class="flex flex-col gap-2"><span class="font-label-md text-label-md text-primary-fixed tracking-wide uppercase px-0.5">${uiText("Факты производства")}</span><div class="grid grid-cols-2 gap-2.5">
${fact("Режиссёр",`<span class="font-label-md text-label-md text-on-surface">${dirName}</span>`)}
${fact("Выход",`<span class="font-label-md text-label-md text-on-surface">${releaseText}</span>`)}
${fact("Бюджет",`<span class="font-headline-sm text-headline-sm text-primary">${f._detailsLoaded?moneyText(f.budget):uiText("Загружаем…")}</span>`)}
${f.originalLang?fact("Язык оригинала",esc(langName(f.originalLang))):""}
${f.writers?.length?fact("Сценарий",esc(f.writers.join(", "))):""}
${f.companies?.length?fact("Студии",esc(f.companies.join(", "))):""}
${fact("Мировые сборы",`<span class="font-headline-sm text-headline-sm text-primary-container">${f._detailsLoaded?moneyText(f.revenue):uiText("Загружаем…")}</span>`)}
</div></div>
<section data-film-part="related" data-kg-related-films data-film-id="${f.id}" data-context-key="${esc(f._kgRelatedContext||"")}" data-placement="${f._oscarContext?"oscar":""}" data-global-related="${f._kgGlobalRelated||f._placement==="home-europe"?"true":"false"}" class="flex flex-col gap-space-sm"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary-container text-[20px]">movie_filter</span><h3 class="font-headline-sm text-headline-sm text-on-surface">${uiText("Похожие фильмы")}</h3></div><div data-kg-related-list class="flex gap-space-sm overflow-x-auto pb-1"><span class="font-micro-caption text-micro-caption text-text-muted">${uiText("Подбираем фильмы…")}</span></div></section></section>`;
}

const style = document.createElement("style");
style.textContent = `
.kg-film-detail{display:flex;flex-direction:column;gap:14px;width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:14px;background:rgb(var(--kg-surface-panel));border:1px solid rgb(var(--kg-primary-container)/.25);border-radius:16px;scroll-margin-top:84px}
#kg-globe-film{margin-inline:-15px}
.kg-film-list-shell:has(>.kg-film-detail){padding:0;background:none;box-shadow:none;overflow:visible}
.kg-film-list-shell:has(>.kg-film-detail)>[data-act="open"]{padding:12px;border-radius:12px;background:rgb(var(--kg-surface-panel))}
article:has(>[data-oscar-detail-host]>.kg-film-detail),article:has(>[id^="mood-film-detail-"]>.kg-film-detail){padding-inline:0}
#kg-home-feature:has(>.kg-film-detail){padding:0;background:none;box-shadow:none}
#kg-home-feature:has(>.kg-film-detail)>p{padding-inline:2px}
.kg-film-detail-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(72px, 30%, 120px);
  align-items: start;
  position: relative;
  gap: 12px;
}
.kg-film-detail-meta {
  min-width: 0;
  overflow-wrap: anywhere;
}
.kg-film-detail-meta [data-kg-film-rating] > div {
  min-width: 0;
  flex-wrap: wrap;
}
.kg-film-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.kg-film-detail .kg-film-detail-actions > button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 10px;
}
.kg-film-detail-actions [data-kg-film-note] {
  border: 1px solid rgb(var(--kg-primary)/.32);
  background: rgb(var(--kg-surface-container-high));
  color: rgb(var(--kg-primary));
}
.kg-film-detail-actions .kg-watched-button > span {
  display: none;
}
.kg-film-detail-actions .kg-watched-icon {
  width: 21px;
  height: 21px;
}
.kg-film-detail .kg-film-detail-actions button.kg-watched-button[aria-pressed="true"] {
  border-color: rgb(var(--kg-primary));
  background: rgb(var(--kg-primary));
  color: rgb(var(--kg-canvas-obsidian));
}
.kg-film-detail .kg-film-detail-actions .kg-bookmark-button .material-symbols-outlined {
  color: inherit;
}
.kg-film-detail-actions > button:focus-visible {
  outline: 2px solid rgb(var(--kg-primary));
  outline-offset: 2px;
}
.kg-film-detail-poster{display:grid;place-items:center;position:relative;overflow:hidden;aspect-ratio:2/3;border-radius:9px;background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
.kg-film-detail-close{position:absolute;right:0;top:0;z-index:1;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;color:rgb(var(--kg-text-muted));background:rgb(var(--kg-surface-container-high))}
.kg-detail-trailer{position:relative;width:100%;aspect-ratio:16/9;background:rgb(var(--kg-black));overflow:hidden;isolation:isolate}
.kg-film-detail [hidden]{display:none!important}
.kg-film-detail [data-film-part="providers"]:not(:has(.kgw-row:not([hidden]))),.kg-film-detail [data-film-part="awards"]:empty{display:none}
.kg-film-dialog{position:fixed;inset:0;margin:auto;padding:0;width:min(100%,520px);max-width:100%;height:min(100dvh,900px);max-height:100dvh;overflow:auto;overscroll-behavior:contain;color:rgb(var(--kg-on-surface));background:rgb(var(--kg-surface));border:0;text-align:left}
.kg-film-dialog::backdrop{background:rgb(var(--kg-black)/.68)}
.kg-film-dialog-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;min-height:56px;padding:env(safe-area-inset-top,0px) 12px 0;background:rgb(var(--kg-surface));border-bottom:1px solid rgb(var(--kg-surface-border-subtle))}
.kg-film-dialog-header button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 10px;color:rgb(var(--kg-primary))}
.kg-film-dialog [data-kg-film-dialog-content]{padding:10px 16px calc(12px + env(safe-area-inset-bottom,0px))}
`;
document.head.append(style);

const mountedFilms = new WeakMap();
const pendingWatched = new Set();

function create(film, options = {}) {
  const template = document.createElement("template");
  template.innerHTML = markup(film, options);
  const card = template.content.firstElementChild;
  mountedFilms.set(card, film);
  return card;
}

function update(card, film, options = {}) {
  const next = create(film, options);
  mountedFilms.set(card, film);
  for (const part of Array.from(next.children)) {
    const current = Array.from(card.children).find(element => element.dataset.filmPart === part.dataset.filmPart);
    // Keep the live player, recommendations and service buttons while metadata arrives.
    if (["providers", "related"].includes(part.dataset.filmPart)) continue;
    if (part.dataset.filmPart === "trailer" && current?.querySelector("iframe")) continue;
    if (current && current.outerHTML !== part.outerHTML) {
      const active = document.activeElement;
      const focusAttribute = current.contains(active) && ["data-act", "data-film-watched", "data-kg-bookmark", "data-kg-film-note", "data-trailer-action"].find(attribute => active.hasAttribute(attribute));
      current.replaceWith(part);
      if (focusAttribute) part.querySelector(`[${focusAttribute}="${active.getAttribute(focusAttribute)}"]`)?.focus({preventScroll:true});
    }
  }
}

function mount(host, film, options) {
  const card = host.firstElementChild;
  if (card?.matches(".kg-film-detail") && mountedFilms.get(card) === film) update(card, film, options);
  else host.replaceChildren(create(film, options));
  return host.firstElementChild;
}

function closeTrailer(card, focus = false) {
  const stage = card?.querySelector("[data-kg-film-trailer]");
  const frame = stage?.querySelector("iframe");
  if (!frame) return;
  frame.remove();
  const preview = stage.querySelector("[data-kg-film-preview]");
  preview.hidden = false;
  card.querySelector('[data-trailer-action="close"]').hidden = true;
  if (focus) preview.querySelector("button")?.focus({preventScroll:true});
}

function stopTrailers(root = document) {
  root.querySelectorAll(".kg-film-detail").forEach(card => closeTrailer(card));
}

function playTrailer(card, film, focus = true) {
  const stage = card.querySelector("[data-kg-film-trailer]");
  if (!film._trailer || !stage || stage.querySelector("iframe")) return;
  stopTrailers();
  const frame = document.createElement("iframe");
  frame.src = embedSrc(film._trailer,true);
  frame.allow = trailerFramePermissions;
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.title = uiText("Трейлер {title}", {title:film.title});
  frame.className = "kg-trailer-frame";
  stage.querySelector("[data-kg-film-preview]").hidden = true;
  stage.append(frame);
  const close = card.querySelector('[data-trailer-action="close"]');
  close.hidden = false;
  if (focus) close.focus({preventScroll:true});
}

function createModel(film, context = {}) {
  return {
    ...film,
    ...context,
    release_date:film.release_date || (film.year ? String(film.year) : ""),
    title:film.title || film.original_title || film.original || uiText("Фильм"),
    poster_path:film.poster_path || film.poster || "",
    originalTitle:film.originalTitle || film.original_title || film.original,
    _cc:context._cc || film._cc || film.origin_country?.[0] || film._kgCountry || film.cc || film.countries?.[0] || "",
    genres:film.genres?.filter(genre=>typeof genre==="string"),
    average:film.average ?? film.vote_average ?? film.score,
    votes:film.votes ?? film.vote_count,
    overview:filmSynopsis(film.overview) || uiText(apiKey ? "Загружаем описание…" : "Описание пока недоступно."),
    _detailsLoaded:!apiKey,
    _trailer:null,
    _trailerStatus:apiKey ? "loading" : "missing"
  };
}

function hydrate(model, source, refresh, active, onTrailer) {
  if (!apiKey) return;
  filmDetails(model.id).then(details=>{
    if (!active()) return;
    Object.assign(model, {
      ...details,
      title:details.title || model.title,
      poster_path:details.posterPath || model.poster_path,
      overview:details.overview || filmSynopsis(source.overview) || uiText("Описание пока недоступно."),
      _cc:model._cc || details.countries?.[0] || "",
      _detailsLoaded:true
    });
    refresh();
  }).catch(()=>{
    if (!active()) return;
    model.overview=filmSynopsis(source.overview) || uiText("Не удалось загрузить описание.");
    model._detailsLoaded=true;
    refresh();
  });
  trailerFor(source).catch(()=>null).then(video=>{
    if (!active()) return;
    model._trailer=video;
    model._trailerStatus=video ? "ready" : "missing";
    refresh();
    if (video) onTrailer?.();
  });
  if (model._oscarContext && window.KGOscarPage?.awards) {
    window.KGOscarPage.awards(source).catch(()=>[]).then(awards=>{
      if (!active()) return;
      model._oscarAwards=awards;
      refresh();
    });
  }
}

let dialogSequence = 0;
function openDialog(film, opener, {autoplayTrailer = false} = {}) {
  if (!film?.id) return;
  stopTrailers();
  const dialog = document.createElement("dialog");
  dialog.className="kg-film-dialog";
  dialog.setAttribute("aria-label",uiText("Фильм"));
  dialog.innerHTML=`<header class="kg-film-dialog-header"><button type="button" autofocus data-kg-film-back><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>${uiText("Назад")}</button></header><div data-kg-film-dialog-content></div>`;
  const host=dialog.querySelector("[data-kg-film-dialog-content]");
  const relatedPool=film._kgRelatedPool;
  const key=relatedPool?.length ? `film-dialog-${++dialogSequence}` : "";
  if (key) window.KGFilmInteractions?.registerPool(key,relatedPool);
  const model=createModel(film,{_kgRelatedContext:key, _kgGlobalRelated:film._kgGlobalRelated ?? !key});
  const refresh=()=>mount(host,model,{closable:false});
  refresh();
  document.body.append(dialog);
  dialog.showModal();
  dialog.scrollTop=0;
  dialog.addEventListener("click",event=>{
    if (event.target===dialog || event.target.closest("[data-kg-film-back]")) {
      stopTrailers(dialog);
      dialog.close();
    }
  });
  dialog.addEventListener("close",()=>{
    dialog.remove();
    if (key) window.KGFilmInteractions?.registerPool(key,null);
    if (opener?.isConnected) opener.focus({preventScroll:true});
  },{once:true});
  hydrate(model,film,refresh,()=>dialog.open,()=>{
    if (autoplayTrailer && [...document.querySelectorAll("dialog[open]")].at(-1) === dialog) playTrailer(host.firstElementChild,model,false);
  });
}

function savedFilm(record) {
  return {
    ...record,
    release_date:record.release_date || String(record.year || ""),
    poster_path:record.poster_path || record.poster,
    original_title:record.original_title || record.original,
    vote_average:record.vote_average ?? record.score,
    vote_count:record.vote_count ?? record.votes,
    genre_ids:record.genre_ids || record.genres?.filter(genre=>typeof genre==="number"),
    _cc:record._cc || record.cc || record.countries?.[0] || ""
  };
}

document.addEventListener("click", async event=>{
  const button=event.target.closest("[data-film-watched], [data-kg-film-note], [data-trailer-action]");
  const card=button?.closest(".kg-film-detail");
  if (!card) return;
  const film=mountedFilms.get(card) || window.KGInlineFilmModel?.(card);
  if (!film) return;
  event.preventDefault();
  if (button.hasAttribute("data-kg-film-note")) {
    stopTrailers();
    window.KGOpenCinemaDiaryNote?.(film);
  } else if (button.dataset.trailerAction==="play") {
    playTrailer(card,film);
  } else if (button.dataset.trailerAction==="close") {
    closeTrailer(card,true);
  } else if (window.KGToggleWatched && !pendingWatched.has(film.id)) {
    pendingWatched.add(film.id);
    window.KGPaintWatchedButton?.(button,!window.KGIsFilmWatched?.(film.id));
    try { await window.KGToggleWatched(film); }
    catch (error) { console.warn("[Kinoglobus] Не удалось обновить просмотр:",error); }
    finally { pendingWatched.delete(film.id); paintWatched(); }
  }
});

function paintWatched() {
  document.querySelectorAll(".kg-film-detail [data-film-watched]").forEach(button=>
    window.KGPaintWatchedButton?.(button,!!window.KGIsFilmWatched?.(button.dataset.filmWatched)));
}
document.addEventListener("kg:watched-change",paintWatched);
document.addEventListener("kg:diary-note-change", event => {
  document.querySelectorAll(".kg-film-detail [data-kg-film-note]").forEach(button => {
    const id = button.closest("[data-selected-film]").dataset.selectedFilm;
    if (id !== String(event.detail.id)) return;
    const label = noteLabel(id);
    button.setAttribute("aria-label", label);
    button.title = label;
  });
});
window.KGFilmCard={markup, createModel, hydrate, mount, update, playTrailer, stopTrailers, openDialog, savedFilm};
})();
