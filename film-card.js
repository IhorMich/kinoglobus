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
const castButton=c=>`<button type="button" data-kg-person-id="${c.id||""}" data-kg-person-profile="${esc(c.photo||"")}" data-kg-person-name="${esc(c.name)}" data-kg-person-role="Актёр" class="kg-person-card flex flex-col items-center text-center py-1" ${c.id?"":"disabled"}>
<div class="kg-cast-avatar rounded-full overflow-hidden mb-1 bg-surface-variant flex items-center justify-center">${c.photo?`<img class="w-full h-full object-cover" loading="lazy" alt="" src="${P(c.photo,"w185")}">`:'<span class="material-symbols-outlined text-text-muted">person</span>'}</div>
<span class="kg-cast-name text-on-surface font-semibold">${esc(c.name)}</span><span class="font-micro-caption text-micro-caption text-text-muted truncate w-full">${esc(c.role)}</span>${c.eps?`<span class="font-micro-caption text-micro-caption text-text-muted">${uiText("{count} эп.",{count:c.eps})}</span>`:""}</button>`;
const COUNT_UNIT=n=>n%10===1&&n!==11?"актёр":n%10>1&&n%10<5&&(n<10||n>20)?"актёра":"актёров";
function castPart(f){
  const short=f.castFull||[],full=f.castAll&&f.castAll.length>short.length?f.castAll:short;
  const expanded=!!f._castExpanded&&full!==short,list=expanded?full:short,total=full.length;
  const buttons=list.map(castButton).join("");
  const toggle=full!==short?`<button type="button" data-kg-cast-toggle class="kg-extras-more" aria-expanded="${expanded}">${expanded?uiText("Свернуть"):uiText("Показать всех ({count})",{count:total})}</button>`:"";
  return `<div data-film-part="cast" class="flex flex-col gap-2"><div class="flex items-center justify-between"><span class="font-label-md text-label-md text-primary-fixed tracking-wide uppercase">${uiText("В главных ролях")}</span>${total?`<span class="font-micro-caption text-micro-caption text-text-muted">${uiText("{count} {unit}",{count:total,unit:COUNT_UNIT(total)})}</span>`:""}</div>${buttons?`<div class="${expanded?"kg-cast-grid":"kg-cast-rail flex overflow-x-auto py-1"}">${buttons}</div>${toggle}`:`<p class="font-body-sm text-body-sm text-text-muted">${f._detailsLoaded?uiText("Сведения об актёрах недоступны."):uiText("Загружаем актёров…")}</p>`}</div>`;
}

// Stills, posters, logos and extra videos. The markup depends only on the model, so update() can repaint it safely.
const EXTRA_TABS=[["shots","Кадры"],["posters","Постеры"],["logos","Логотипы"],["videos","Видео"]];
const VIDEO_TYPES=["Clip","Behind the Scenes","Featurette","Bloopers","Teaser","Trailer"];
const VIDEO_LABELS={"Clip":"Фрагменты","Behind the Scenes":"Закулисье","Featurette":"Спецматериалы","Bloopers":"Дубли","Teaser":"Тизеры","Trailer":"Трейлеры"};
function extraItems(f,tab){
  const g=f.gallery||{};
  return tab==="shots"?(g.backdrops||[]):tab==="posters"?(g.posters||[]):tab==="logos"?(g.logos||[]):Array.isArray(f._extraVideos)?f._extraVideos:[];
}
function extrasTabs(f){
  return EXTRA_TABS.filter(([id])=>id==="videos"?(f._extraVideos===undefined||f._extraVideos==="loading"||(Array.isArray(f._extraVideos)&&f._extraVideos.length)):extraItems(f,id).length);
}
function extrasPart(f){
  if(!f._detailsLoaded)return `<div data-film-part="extras" hidden></div>`;
  const tabs=extrasTabs(f);
  if(!tabs.length)return `<div data-film-part="extras" hidden></div>`;
  const active=tabs.some(([id])=>id===f._extrasTab)?f._extrasTab:tabs[0][0];
  const head=tabs.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===active}" data-kg-extras-tab="${id}" class="kg-extras-tab">${uiText(label)}${id!=="videos"?`<span>${extraItems(f,id).length}</span>`:""}</button>`).join("");
  let body="";
  if(active==="videos"){
    if(f._extraVideos==="loading"||f._extraVideos===undefined)body=`<p class="font-body-sm text-body-sm text-text-muted">${uiText("Загружаем видео…")}</p>`;
    else{
      const list=f._extraVideos,groups=VIDEO_TYPES.filter(type=>list.some(v=>v.type===type));
      body=groups.map(type=>`<div class="kg-extras-group"><span class="font-micro-caption text-micro-caption uppercase text-text-muted">${uiText(VIDEO_LABELS[type])}</span><div class="kg-extras-rail">${list.map((v,i)=>[v,i]).filter(([v])=>v.type===type).map(([v,i])=>`<button type="button" class="kg-extras-video" data-kg-extras-open="${i}" title="${esc(v.name)}" aria-label="${esc(v.name)}"><span class="kg-extras-video-thumb">${v.site==="YouTube"?`<img loading="lazy" decoding="async" alt="" src="https://i.ytimg.com/vi/${encodeURIComponent(v.key)}/mqdefault.jpg" onerror="this.remove()">`:""}<span class="material-symbols-outlined" aria-hidden="true">play_arrow</span></span><span class="kg-extras-video-name">${esc(v.name)}</span></button>`).join("")}</div></div>`).join("");
    }
  }else{
    const items=extraItems(f,active),size=active==="shots"?"w300":active==="posters"?"w185":"w185";
    body=`<div class="kg-extras-rail kg-extras-${active}">${items.map((x,i)=>`<button type="button" class="kg-extras-img" data-kg-extras-open="${i}" aria-label="${esc(uiText(active==="shots"?"Кадр {n}":active==="posters"?"Постер {n}":"Логотип {n}",{n:i+1}))}"><img loading="lazy" decoding="async" alt="" src="${P(x.p,size)}"></button>`).join("")}</div>`;
  }
  return `<div data-film-part="extras" class="flex flex-col gap-2" data-kg-extras-active="${active}"><span class="font-label-md text-label-md text-primary-fixed tracking-wide uppercase">${uiText("Материалы")}</span><div class="kg-extras-tabs" role="tablist">${head}</div>${body}</div>`;
}
function markup(f, {closable = true, inline = false} = {}) {
  if(window.KGSeries?.isSeriesId(f.id)&&window.KGSeriesDetail)return window.KGSeriesDetail.markup(f,{closable,inline});
  if (f.backdrop_path && ((f.castFull && f.castFull.length) || (f.dirsFull && f.dirsFull.length)))
    window.KGPersonBackdropWarm?.(f.backdrop_path);
  const year=String(f.release_date||f.year||"").slice(0,4);
  const personLink=(p,role)=>p&&p.id?`<button type="button" data-kg-person-id="${p.id}" data-kg-person-profile="${esc(p.photo||"")}" data-kg-person-name="${esc(p.name)}" data-kg-person-role="${role}" class="kg-person-link">${esc(p.name)}</button>`:esc(p&&p.name||"");
  const cast=castPart(f);
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
  const countryCodes=[...new Set(f.countries?.length ? f.countries : f.production_countries?.length ? f.production_countries.map(country=>country.iso_3166_1) : f._cc ? [f._cc] : [])].filter(Boolean);
  const countries=countryCodes.map(cc=>window.KGCountryApp?.countries().includes(cc)
    ? `<button type="button" class="kg-film-country-link" data-kg-film-country="${esc(cc)}" aria-label="${esc(uiText("Паспорт страны {country}",{country:cname(cc)}))}">${esc(cname(cc))} ${fl(cc)}</button>`
    : `${esc(cname(cc))} ${fl(cc)}`).join(" · ");
  const genres=(f.genres?.length ? f.genres : genreLine(f).split(", ").filter(Boolean)).map(genre => uiText(genre)).join(" · ");
  const voteCount=Number(f.votes ?? f.vote_count)||0;
  const votes=voteCount>=1000?(voteCount/1000).toFixed(1)+"k":String(voteCount);
  const average=Number(f.average ?? f.vote_average)||0;
  const rating=average>0?`<div class="shrink-0 px-2.5 py-1 rounded-lg bg-primary-container/15 flex items-center gap-1.5"><span class="material-symbols-outlined text-primary-container text-[16px]" style="font-variation-settings:'FILL' 1;">star</span><span class="font-label-sm text-label-sm text-primary">${average.toFixed(1)} TMDB</span><span class="font-micro-caption text-micro-caption text-text-muted">(${votes})</span></div>`:"";
  const certBadge=f.cert?`<span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-cinema-velvet-deep/90 text-secondary font-label-sm text-label-sm">${esc(f.cert)}</span>`:"";
  const fact=(label,value,sub)=>`<div class="py-2 flex flex-col gap-1"><span class="font-micro-caption text-micro-caption uppercase text-text-muted">${uiText(label)}</span>${value}${sub?`<span class="font-body-sm text-body-sm text-text-muted">${sub}</span>`:""}</div>`;
  const loading=f._detailsLoaded?"—":uiText("Загружаем…");
  const dirName=f.dirs&&f.dirs.length?(f.dirsFull&&f.dirsFull.length?f.dirsFull.map(d=>personLink(d,"Режиссёр")).join(", "):esc(f.dirs.join(", "))):loading;
  const producers=(f.producers||[]).map(p=>personLink(p,p.job==="Executive Producer"?"Исполнительный продюсер":"Продюсер")).join(", ");
  const releaseText=f.release?new Date(f.release+"T00:00:00").toLocaleDateString(interfaceLanguage,{day:"numeric",month:"long",year:"numeric"}):loading;
  const posterPath = f.localizedPoster?.path || f.poster_path || f.backdrop_path;
  const poster = filmPosterMarkup({...f, localizedPoster: {path: posterPath, showTitle: false}}, "w342")
    || '<span class="material-symbols-outlined" aria-hidden="true">movie</span>';
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
<div class="kg-film-detail-poster">${poster}</div>
<div class="kg-film-detail-meta">
<h3 class="font-headline-md text-headline-md text-primary font-bold break-words" data-kg-film-title>${title}</h3>
${orig? `<p class="text-body-sm text-text-muted">${orig}</p>` : ""}
<p class="mt-1 text-body-sm text-on-surface-variant">${[countries,esc(genres),f.runtime?uiText("{minutes} мин",{minutes:f.runtime}):""].filter(Boolean).join(" · ")}</p>
${rating ? `<div class="mt-2 flex" data-kg-film-rating>${rating}</div>` : ""}
<div data-kg-film-actions class="kg-film-detail-actions" role="group">
${window.KGWatchedButtonHtml(watched, `data-film-watched="${Number(f.id)}"`)}
${kgBookmarkButton(f)}
${window.KGFavorites?.button(f)||""}
${window.KGReleaseFollow?.compactButton(f)||""}
</div>
${window.KGReviews?.button(f,null,watched)||""}
</div>
  ${closable ? (f._relatedPrevious ? `<button type="button" data-kg-related-back aria-label="${uiText("Вернуться к предыдущему фильму")}" class="kg-film-detail-close"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>` : `<button type="button" data-act="close-film" aria-label="${uiText("Свернуть карточку")}" class="kg-film-detail-close"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>`) : ""}
</div>
<div data-film-part="description" data-kg-film-description class="flex flex-col gap-2"><h4 class="font-label-md text-label-md text-primary-fixed">${uiText(window.KGSeries?.isSeriesId(f.id)?"О сериале":"О фильме")}</h4>
${f.tagline&&f.taglineLang===f.overviewLang ? `<blockquote class="italic text-primary-fixed">«${esc(f.tagline)}»</blockquote>` : ""}
<p class="text-body-md text-on-surface leading-relaxed">${esc(f.overview)}</p>${languageNote ? `<small class="text-text-muted">${esc(languageNote)}</small>` : ""}</div>
<div data-film-part="trailer" class="flex flex-col gap-2">
<div data-kg-film-trailer class="kg-detail-trailer" ${video ? 'data-video-key="' + esc(video.key) + '"' : ""}>
<div data-kg-film-preview class="absolute inset-0">${preview}${certBadge}</div></div>
<div class="flex flex-wrap items-center gap-2">
<button type="button" hidden data-trailer-action="close" class="min-h-10 px-3 rounded-lg bg-surface-container text-primary text-label-sm"><span class="material-symbols-outlined text-[16px] align-middle" aria-hidden="true">close</span> ${uiText("Закрыть трейлер")}</button>
${video? `<a href="${esc(watchUrl(video))}" target="_blank" rel="noopener noreferrer" class="text-micro-caption text-primary underline">${esc(uiText("Не воспроизводится? Открыть на {site}", {site:video.site}))}</a>` : ""}
</div></div>
<div data-film-part="providers">${window.KGLegalWatch?.markup(f.id)||""}</div>
<div data-film-part="awards">${oscarBlock}</div>
<div data-film-part="producers" ${producers?"":"hidden"} class="flex flex-wrap gap-2"><strong>${uiText("Продюсеры")}</strong><span>${producers}</span></div>
${cast}
${extrasPart(f)}
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
.kg-film-detail{display:flex;flex-direction:column;gap:14px;width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:0;background:transparent;border:0;border-radius:0;scroll-margin-top:84px}
.kg-film-detail:not(.kg-series-detail){gap:var(--kg-section-gap)}
.kg-film-detail [data-kg-film-description]{padding:0;border-radius:0;background:transparent}
#kg-globe-film > .kg-film-detail,
[data-home-inline-film] > .kg-film-detail,
#cl-result > .kg-film-detail,
#oscar-reel-detail > .kg-film-detail {background:transparent}
:is(#kg-globe-film, #cl-result, #oscar-reel-detail) [data-kg-film-description],
[data-home-inline-film] [data-kg-film-description] {
  padding: 0;
  border-radius: 0;
  background: transparent;
}
.kg-film-list-shell:has(>.kg-film-detail){padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible}
.kg-film-list-shell:has(>.kg-film-detail)>[data-act="open"]{padding:var(--kg-card-padding);border-radius:var(--kg-radius-card);background:transparent!important;box-shadow:none!important}
article:has(>[data-oscar-detail-host]>.kg-film-detail),
article:has(>[id^="mood-film-detail-"]>.kg-film-detail),
article[data-vibe-film]:has(+ [id^="mood-film-detail-v"]>.kg-film-detail),
article:has(+ [id^="mood-film-detail-"]>.kg-film-detail),
div[data-collection-grid-detail]:has(>.kg-film-detail),
#oscar-reel:has(#oscar-reel-detail>.kg-film-detail),
div.relative:has(> [id^="mood-roulette-winner-detail-"]>.kg-film-detail){
  padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important
}
#kg-home-feature:has(>.kg-film-detail){padding:0;background:none;box-shadow:none}
#kg-home-feature:has(>.kg-film-detail)>p{padding-inline:2px}
.kg-film-detail-summary {
  display: grid;
  grid-template-columns: clamp(80px, 34%, 136px) minmax(0, 1fr);
  align-items: start;
  position: relative;
  gap: var(--kg-space-lg);
}
.kg-film-detail-meta {
  min-width: 0;
  overflow-wrap: anywhere;
}
.kg-film-detail-summary:has(.kg-film-detail-close) [data-kg-film-title] {
  padding-inline-end: 42px;
}
.kg-film-detail-meta [data-kg-film-rating] > div {
  min-width: 0;
  flex-wrap: wrap;
}
.kg-film-detail-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  width: min(100%, 156px);
  margin-top: var(--kg-space-lg);
  padding: 2px;
  border: 1px solid var(--kg-nav-control-border);
  border-radius: 999px;
  background: var(--kg-nav-control-fill);
}
.kg-film-detail-meta .kg-film-detail-actions:has(> [data-kg-follow]) {
  grid-template-columns: repeat(4,minmax(0,1fr));
  width: min(100%,184px);
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions > button {
  display: grid;
  place-items: center;
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  box-shadow: none;
  color: rgb(var(--kg-on-surface));
  cursor: pointer;
  transition: color .15s, background-color .15s, transform .15s;
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions > button:hover {
  outline: none;
  color: rgb(var(--kg-primary));
}
:root[data-kg-theme] :is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions > button[aria-pressed="true"] {
  background: rgb(var(--kg-primary) / .14);
  box-shadow: none;
  color: rgb(var(--kg-primary));
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions > button:active {
  transform: scale(.96);
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions > button:focus-visible {
  outline: 2px solid rgb(var(--kg-primary));
  outline-offset: -2px;
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions .kg-watched-button > span {
  display: none;
}
:is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions .kg-watched-icon {
  width: 22px;
  height: 22px;
  color: inherit;
}
:root[data-kg-theme] :is(.kg-film-detail,.kgc-catalog-card) .kg-film-detail-actions .material-symbols-outlined {
  font-size: 22px;
  color: inherit;
}
.kg-film-detail-poster{display:grid;place-items:center;position:relative;overflow:hidden;aspect-ratio:2/3;border-radius:var(--kg-radius-card);background:rgb(var(--kg-surface-container-high));color:rgb(var(--kg-primary))}
.kg-film-detail-close{position:absolute;right:0;top:0;z-index:1;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;color:rgb(var(--kg-text-muted));background:rgb(var(--kg-surface-container-high))}
.kg-film-detail:not([hidden]) [data-film-part="trailer"]{width:100%;min-width:0}
.kg-film-detail .kg-detail-trailer{position:relative;width:100vw;max-width:none;margin-inline:calc(50% - 50vw);aspect-ratio:16/9;background:rgb(var(--kg-black));overflow:hidden;isolation:isolate}
/* The homepage detail already sits in the page column; keep its trailer inside that column. */
#kg-home-feature .kg-detail-trailer{width:100%;max-width:100%;margin-inline:0}
.kg-film-detail [hidden]{display:none!important}
.kg-film-detail [data-film-part="providers"]:not(:has(.kgw-row:not([hidden]))),.kg-film-detail [data-film-part="awards"]:empty{display:none}
.kg-film-dialog{position:fixed;inset:0;margin:auto;padding:0;width:100%;max-width:100%;height:100dvh;max-height:100dvh;overflow:auto;overscroll-behavior:contain;color:rgb(var(--kg-on-surface));background:rgb(var(--kg-surface));border:0;text-align:left}
.kg-film-dialog::backdrop{background:rgb(var(--kg-black)/.68)}
.kg-film-dialog-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;min-height:56px;padding:env(safe-area-inset-top,0px) 12px 0;background:rgb(var(--kg-surface));border-bottom:1px solid rgb(var(--kg-surface-border-subtle))}
.kg-film-dialog-header button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 10px;color:rgb(var(--kg-primary))}
.kg-film-dialog [data-kg-film-dialog-content]{padding:var(--kg-card-padding-compact) var(--kg-page-padding) calc(var(--kg-card-padding) + env(safe-area-inset-bottom,0px))}

.kg-cast-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:.5rem .375rem}
.kg-cast-grid .kg-person-card{min-width:0;appearance:none;border:0;background:transparent;box-shadow:none}
.kg-series-detail [data-film-part="extras"]{padding:0 20px 20px}
.kg-extras-more{align-self:flex-start;min-height:44px;padding:0 4px;color:rgb(var(--kg-primary));font-size:.85rem;text-decoration:underline;text-underline-offset:3px}
.kg-extras-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.kg-extras-tab{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid rgb(var(--kg-surface-border-subtle));border-radius:999px;color:rgb(var(--kg-on-surface));font-size:.8rem}
.kg-extras-tab span{opacity:.6;font-size:.72rem}
.kg-extras-tab[aria-selected="true"]{color:rgb(var(--kg-primary));border-color:rgb(var(--kg-primary-container)/.6);background:rgb(var(--kg-primary-container)/.14)}
.kg-extras-rail{display:flex;gap:8px;overflow-x:auto;padding:2px 0 6px;scroll-snap-type:x proximity;scrollbar-width:thin}
.kg-extras-rail>*{scroll-snap-align:start}
.kg-extras-group{display:flex;flex-direction:column;gap:6px}
.kg-extras-img{flex:none;display:block;padding:0;border:1px solid rgb(var(--kg-surface-border-subtle));border-radius:var(--kg-radius-card);overflow:hidden;background:rgb(var(--kg-surface))}
.kg-extras-shots .kg-extras-img{height:96px;aspect-ratio:16/9}
.kg-extras-posters .kg-extras-img{height:150px;aspect-ratio:2/3}
.kg-extras-logos .kg-extras-img{height:64px;min-width:110px;display:flex;align-items:center;justify-content:center;padding:8px;background:rgb(var(--kg-black)/.55)}
.kg-extras-img img{width:100%;height:100%;object-fit:cover;display:block}
.kg-extras-logos .kg-extras-img img{object-fit:contain}
.kg-extras-video{flex:none;display:flex;flex-direction:column;gap:4px;width:160px;padding:0;text-align:left;color:rgb(var(--kg-on-surface))}
.kg-extras-video-thumb{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border-radius:var(--kg-radius-card);overflow:hidden;background:rgb(var(--kg-black)/.7)}
.kg-extras-video-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85}
.kg-extras-video-thumb .material-symbols-outlined{position:relative;font-size:34px;color:#fff;filter:drop-shadow(0 1px 4px rgb(0 0 0/.6))}
.kg-extras-video-name{display:-webkit-box;overflow:hidden;font-size:.72rem;line-height:1.2;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.kg-extras-lightbox{position:fixed;inset:0;margin:auto;width:100%;max-width:100%;height:100dvh;max-height:100dvh;padding:0;border:0;color:#fff;background:rgb(var(--kg-black)/.92)}
.kg-extras-lightbox::backdrop{background:rgb(var(--kg-black)/.8)}
.kg-extras-stage{position:absolute;inset:56px 8px 40px;display:flex;align-items:center;justify-content:center}
.kg-extras-stage img{max-width:100%;max-height:100%;object-fit:contain}
.kg-extras-stage iframe{width:100%;max-width:960px;aspect-ratio:16/9;border:0;border-radius:var(--kg-radius-card);background:#000}
.kg-extras-lightbox button{position:absolute;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;color:#fff;background:rgb(var(--kg-black)/.55)}
.kg-extras-lightbox [data-lb-close]{top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;z-index:2}
.kg-extras-lightbox [data-lb-prev]{left:8px;top:50%;z-index:2}
.kg-extras-lightbox [data-lb-next]{right:8px;top:50%;z-index:2}
.kg-extras-count{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);left:0;right:0;text-align:center;font-size:.78rem;opacity:.75}
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
      const focusAttribute = current.contains(active) && ["data-act", "data-film-watched", "data-kg-bookmark", "data-kg-follow", "data-kg-film-note", "data-review-action", "data-trailer-action"].find(attribute => active.hasAttribute(attribute));
      current.replaceWith(part);
      if (focusAttribute) part.querySelector(`[${focusAttribute}="${active.getAttribute(focusAttribute)}"]`)?.focus({preventScroll:true});
    }
  }
}

function mount(host, film, options) {
  const card = host.firstElementChild;
  if (card?.matches(".kg-film-detail") && mountedFilms.get(card) === film) update(card, film, options);
  else host.replaceChildren(create(film, options));
  window.KGSeriesDetail?.enhance(host.firstElementChild,film);
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
  if(card.matches(".kg-series-detail")){film._seriesTrailerOpen=true;card.querySelector('[data-film-part="trailer"]').hidden=false;}
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
    window.KGReleaseFollow?.observe(model);
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
async function openDialog(film, opener, {autoplayTrailer = false, showEpisodes = false} = {}) {
  const id = Number(film?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return;
  if (apiKey && !movieCatalog.allows(film)) {
    try {
      const details = await filmDetails(id);
      if (!movieCatalog.allows(film)) {
        if (opener && !opener.isConnected) return;
        film = {...details, id, release_date:details.release, original_title:details.originalTitle,
          poster_path:details.posterPath, _cc:film._cc || film.cc, _kgGlobalRelated:true};
      }
    } catch (error) {
      if (error.code === "CATALOG_RESTRICTED" || !movieCatalog.allows(film)) return;
    }
  }
  if (!movieCatalog.allows(film)) return;
  stopTrailers();
  const dialog = document.createElement("dialog");
  dialog.className="kg-film-dialog";
  dialog.setAttribute("aria-label",uiText(window.KGSeries?.isSeriesId(id)?"Сериал":"Фильм"));
  dialog.innerHTML=`<header class="kg-film-dialog-header"><button type="button" autofocus data-kg-film-back><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>${uiText("Назад")}</button></header><div data-kg-film-dialog-content></div>`;
  const host=dialog.querySelector("[data-kg-film-dialog-content]");
  const relatedPool=film._kgRelatedPool;
  const key=relatedPool?.length ? `film-dialog-${++dialogSequence}` : "";
  if (key) window.KGFilmInteractions?.registerPool(key,relatedPool);
  dialog.__kgPoolKeys=key?[key]:[];
  const model=createModel(film,{_kgRelatedContext:key, _kgGlobalRelated:film._kgGlobalRelated ?? !key});
  let activeModel=model;
  dialog.__kgSetActiveModel=value=>{activeModel=value;};
  dialog.__kgCurrentModel=model;
  dialog.__kgRelatedHistory=[];
  const refresh=forModel=>()=>{if(activeModel===forModel)mount(host,forModel,{closable:false});};
  refresh(model)();
  document.body.append(dialog);
  dialog.showModal();
  dialog.scrollTop=0;
  if(showEpisodes) requestAnimationFrame(()=>host.querySelector('[data-film-part="episodes"]')?.scrollIntoView({block:"start"}));
  dialog.addEventListener("click",event=>{
    if (event.target===dialog || event.target.closest("[data-kg-film-back]")) {
      if(event.target.closest("[data-kg-film-back]") && dialog.__kgRelatedHistory.length){
        event.preventDefault();
        stopTrailers(dialog);
        const previous=dialog.__kgRelatedHistory.pop();
        activeModel=dialog.__kgCurrentModel=previous.model;
        host.replaceChildren(previous.node);
        hydrate(previous.model,previous.source,refresh(previous.model),()=>dialog.open&&activeModel===previous.model);
        requestAnimationFrame(()=>dialog.scrollTo({top:previous.scrollTop,behavior:"smooth"}));
      }else{
        stopTrailers(dialog);
        dialog.close();
      }
    }
  });
  dialog.addEventListener("close",()=>{
    dialog.remove();
    dialog.__kgPoolKeys.forEach(poolKey=>window.KGFilmInteractions?.registerPool(poolKey,null));
    if (opener?.isConnected) opener.focus({preventScroll:true});
  },{once:true});
  hydrate(model,film,refresh(model),()=>dialog.open&&activeModel===model,()=>{
    if (autoplayTrailer && [...document.querySelectorAll("dialog[open]")].at(-1) === dialog) playTrailer(host.firstElementChild,model,false);
  });
}

function modelFor(card){return mountedFilms.get(card)||window.KGInlineFilmModel?.(card)||window.KGGlobeFilmModel?.(card)||null;}

function openInlineRelated(film,current,opener,pool=[],oscar=false){
  if(window.KGSeries?.isSeriesId(current?.id)&&opener?.closest?.("dialog.kg-film-dialog"))return false;
  const id=Number(film?.id),parentCard=opener?.closest?.(".kg-film-detail");
  if(!parentCard||modelFor(parentCard)!==current||!Number.isSafeInteger(id)||id<=0||!movieCatalog.allows(film))return false;
  const related=parentCard.querySelector(":scope > [data-film-part=related]");
  if(!related)return false;
  let stack=related.querySelector(":scope > [data-kg-related-inline-stack]");
  if(!stack){stack=document.createElement("div");stack.dataset.kgRelatedInlineStack="";stack.className="flex flex-col gap-4 pt-3";related.append(stack);}
  stopTrailers(stack);
  [...stack.querySelectorAll("[data-kg-related-inline-branch]")].forEach(branch=>{
    const branches=[branch,...branch.querySelectorAll("[data-kg-related-inline-branch]")];
    branches.forEach(node=>{if(node.dataset.kgRelatedPoolKey)window.KGFilmInteractions?.registerPool(node.dataset.kgRelatedPoolKey,null);});
  });
  stack.replaceChildren();
  const key=pool.length?`kg-inline-related-${++dialogSequence}`:"";
  if(key)window.KGFilmInteractions?.registerPool(key,pool);
  const branch=document.createElement("div");
  branch.dataset.kgRelatedInlineBranch="";
  if(key)branch.dataset.kgRelatedPoolKey=key;
  stack.append(branch);
  const model=createModel(film,{_kgRelatedContext:key,_kgGlobalRelated:film._kgGlobalRelated??!key,
    _kgRelatedPool:pool,_oscarContext:!!oscar,_relatedPrevious:current,_relatedBranch:branch});
  const refresh=()=>{if(branch.isConnected)mount(branch,model,{closable:true});};
  refresh();
  hydrate(model,film,refresh,()=>branch.isConnected&&modelFor(branch.firstElementChild)===model);
  requestAnimationFrame(()=>{
    const card=branch.firstElementChild,description=card?.querySelector("[data-kg-film-description]");
    if(!description)return;
    const dialog=card.closest("dialog.kg-film-dialog");
    if(dialog){
      const header=dialog.querySelector(".kg-film-dialog-header");
      const top=dialog.scrollTop+description.getBoundingClientRect().top-dialog.getBoundingClientRect().top-(header?.getBoundingClientRect().height||0)-12;
      dialog.scrollTo({top:Math.max(0,top),behavior:"smooth"});
    }else if(window.KGScrollToFilmStart){
      window.KGScrollToFilmStart(card,620,{target:()=>card.querySelector("[data-kg-film-description]"),downOnly:true});
    }else description.scrollIntoView({behavior:"smooth",block:"start"});
  });
  return true;
}

async function navigateDialogRelated(film,dialog,opener,pool=[],oscar=false){
  if(!dialog?.open||!dialog.__kgCurrentModel)return false;
  const id=Number(film?.id);
  if(!Number.isSafeInteger(id)||id<=0||!movieCatalog.allows(film))return false;
  stopTrailers(dialog);
  const host=dialog.querySelector("[data-kg-film-dialog-content]");
  const current=dialog.__kgCurrentModel;
  dialog.__kgRelatedHistory.push({node:host.firstElementChild,model:current,source:current,scrollTop:dialog.scrollTop});
  const key=pool?.length?`film-dialog-${++dialogSequence}`:"";
  if(key){window.KGFilmInteractions?.registerPool(key,pool);dialog.__kgPoolKeys.push(key);}
  const model=createModel(film,{_kgRelatedContext:key,_kgGlobalRelated:film._kgGlobalRelated??!key,
    _kgRelatedPool:pool,_oscarContext:!!oscar,_relatedPrevious:current});
  dialog.__kgCurrentModel=model;
  dialog.__kgSetActiveModel?.(model);
  host.replaceChildren();
  const refresh=()=>{if(dialog.open&&dialog.__kgCurrentModel===model)mount(host,model,{closable:false});};
  refresh();
  hydrate(model,film,refresh,()=>dialog.open&&dialog.__kgCurrentModel===model);
  requestAnimationFrame(()=>dialog.scrollTo({top:0,behavior:"smooth"}));
  return true;
}

document.addEventListener("click",event=>{
  const button=event.target.closest("[data-kg-related-back]");
  if(!button)return;
  const card=button.closest(".kg-film-detail");
  const model=mountedFilms.get(card)||window.KGInlineFilmModel?.(card)||window.KGGlobeFilmModel?.(card);
  if(!model?._relatedPrevious)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(model._relatedBranch){
    const branch=model._relatedBranch;
    stopTrailers(branch);
    const branches=[branch,...branch.querySelectorAll("[data-kg-related-inline-branch]")];
    branches.forEach(node=>{if(node.dataset.kgRelatedPoolKey)window.KGFilmInteractions?.registerPool(node.dataset.kgRelatedPoolKey,null);});
    const parentSection=branch.parentElement;
    branch.remove();
    if(parentSection?.isConnected){
      const dialog=parentSection.closest("dialog.kg-film-dialog");
      if(dialog)parentSection.scrollIntoView({behavior:"smooth",block:"nearest"});
      else window.KGScrollToFilmStart?.(parentSection,450,{target:()=>parentSection,downOnly:false});
    }
    return;
  }
  if(model._globeRelated)window.KGBackFromGlobeFilm?.(model);
  else window.KGCloseFilmFromRelated?.(model._detailTarget||null,false);
},true);

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

document.addEventListener("click", event=>{
  const button=event.target.closest("[data-kg-film-country]");
  if(!button || !button.closest(".kg-film-detail"))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.KGOpenCountryPassport?.(button.dataset.kgFilmCountry);
},true);

document.addEventListener("click", async event=>{
  const button=event.target.closest("[data-film-watched], [data-kg-film-note], [data-review-action], [data-trailer-action]");
  const card=button?.closest(".kg-film-detail");
  if (!card) return;
  const film=mountedFilms.get(card) || window.KGInlineFilmModel?.(card);
  if (!film) return;
  event.preventDefault();
  if (button.hasAttribute("data-review-action")) {
    stopTrailers();
    window.KGReviews?.open(film,{opener:button});
  } else if (button.hasAttribute("data-kg-film-note")) {
    stopTrailers();
    window.KGOpenCinemaDiaryNote?.(film);
  } else if (button.dataset.trailerAction==="play") {
    playTrailer(card,film);
  } else if (button.dataset.trailerAction==="close") {
    closeTrailer(card,true);
  } else if (window.KGToggleWatched && !pendingWatched.has(film.id)) {
    pendingWatched.add(film.id);
    try { await window.KGToggleWatched(film); }
    catch (error) { console.warn("[Moven] Не удалось обновить просмотр:",error); }
    finally { pendingWatched.delete(film.id); paintWatched(); }
  }
});

function paintWatched() {
  document.querySelectorAll(".kg-film-detail [data-film-watched]").forEach(button=>
    window.KGPaintWatchedButton?.(button,!!window.KGIsFilmWatched?.(button.dataset.filmWatched)));
  document.querySelectorAll(".kg-film-detail [data-review-action]").forEach(button=>{
    const card=button.closest(".kg-film-detail"),film=mountedFilms.get(card)||window.KGInlineFilmModel?.(card);
    if(film)window.KGReviews?.paintAction(button,film,null,!!window.KGIsFilmWatched?.(film.id));
  });
}
document.addEventListener("kg:watched-change",paintWatched);
document.addEventListener("kg:review-change",paintWatched);
document.addEventListener("kg:diary-note-change", event => {
  paintWatched();
  document.querySelectorAll(".kg-film-detail [data-kg-film-note]").forEach(button => {
    const id = button.closest("[data-selected-film]").dataset.selectedFilm;
    if (id !== String(event.detail.id)) return;
    const label = noteLabel(id);
    button.setAttribute("aria-label", label);
    button.title = label;
  });
});
// Full cast, stills/posters/logos and the lazy "Видео" tab. State lives on the film model; the parts repaint from it.
function repaintPart(card,model,name){
  const current=card.querySelector(`[data-film-part="${name}"]`);
  if(!current)return null;
  const template=document.createElement("template");
  template.innerHTML=name==="cast"?castPart(model):extrasPart(model);
  const next=template.content.firstElementChild;
  if(current.outerHTML!==next.outerHTML)current.replaceWith(next);
  return next;
}
async function loadExtraVideos(model){
  model._extraVideos="loading";
  try{
    const response=await movieCatalog.request(`https://api.themoviedb.org/3/movie/${encodeURIComponent(model.id)}/videos?`+new URLSearchParams({api_key:apiKey,include_video_language:"ru,en,null"}));
    if(!response.ok)throw new Error(`TMDB videos: ${response.status}`);
    const main=model._trailer?.key,seen=new Set();
    const lang=v=>v.iso_639_1==="ru"?0:v.iso_639_1==="en"?1:2;
    const rows=((await response.json()).results||[])
      .filter(v=>v&&v.key&&(v.site==="YouTube"||v.site==="Vimeo")&&VIDEO_TYPES.includes(v.type)&&movieCatalog.allowsTrailer(v)&&v.key!==main&&!seen.has(v.key)&&seen.add(v.key))
      .sort((a,b)=>VIDEO_TYPES.indexOf(a.type)-VIDEO_TYPES.indexOf(b.type)||lang(a)-lang(b)||(b.official===true)-(a.official===true));
    model._extraVideos=rows.slice(0,18).map(v=>({key:v.key,site:v.site,name:v.name||"",type:v.type}));
  }catch(error){
    console.warn("[Moven: Extras] Не удалось загрузить видео TMDB:",error);
    model._extraVideos=[];
  }
}
// items: [{img}] or [{video,name}]. Shared by the film/series "Материалы" block and the person page photos.
function openLightbox(items,start=0){
  if(!items||!items[start])return;
  stopTrailers();
  let index=start;
  const dialog=document.createElement("dialog");
  dialog.className="kg-extras-lightbox";
  dialog.setAttribute("aria-label",uiText("Материалы"));
  const paint=()=>{
    const x=items[index];
    const media=x.video
      ?`<iframe src="${esc(x.video)}" allow="${trailerFramePermissions}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="${esc(x.name||"")}"></iframe>`
      :`<img alt="" src="${esc(x.img)}">`;
    const nav=items.length>1?`<button type="button" data-lb-prev aria-label="${esc(uiText("Назад"))}"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button><button type="button" data-lb-next aria-label="${esc(uiText("Далее"))}"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>`:"";
    dialog.innerHTML=`<button type="button" data-lb-close aria-label="${esc(uiText("Закрыть"))}"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>${nav}<div class="kg-extras-stage">${media}</div><div class="kg-extras-count">${index+1} / ${items.length}</div>`;
  };
  const step=delta=>{index=(index+delta+items.length)%items.length;paint();dialog.querySelector(delta<0?"[data-lb-prev]":"[data-lb-next]")?.focus({preventScroll:true});};
  dialog.addEventListener("click",event=>{
    if(event.target===dialog||event.target.closest("[data-lb-close]"))dialog.close();
    else if(event.target.closest("[data-lb-prev]"))step(-1);
    else if(event.target.closest("[data-lb-next]"))step(1);
  });
  dialog.addEventListener("keydown",event=>{
    if(items.length<2||event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;
    event.preventDefault();step(event.key==="ArrowLeft"?-1:1);
  });
  dialog.addEventListener("close",()=>dialog.remove(),{once:true});
  paint();
  document.body.append(dialog);
  dialog.showModal();
}
function openExtra(model,tab,start){
  const list=extraItems(model,tab);
  openLightbox(list.map(x=>tab==="videos"?{video:embedSrc(x,true),name:x.name}:{img:P(x.p,tab==="shots"?"w1280":tab==="posters"?"w780":"w500")}),start);
}
document.addEventListener("click",event=>{
  const control=event.target.closest("[data-kg-cast-toggle],[data-kg-extras-tab],[data-kg-extras-open]");
  if(!control)return;
  const card=control.closest(".kg-film-detail"),model=card&&modelFor(card);
  if(!model)return;
  if(control.matches("[data-kg-cast-toggle]")){
    model._castExpanded=!model._castExpanded;
    repaintPart(card,model,"cast")?.querySelector("[data-kg-cast-toggle]")?.focus({preventScroll:true});
  }else if(control.matches("[data-kg-extras-tab]")){
    const tab=control.dataset.kgExtrasTab;
    model._extrasTab=tab;
    if(tab==="videos"&&model._extraVideos===undefined){
      loadExtraVideos(model).then(()=>{if(card.isConnected)repaintPart(card,model,"extras");});
    }
    repaintPart(card,model,"extras")?.querySelector(`[data-kg-extras-tab="${tab}"]`)?.focus({preventScroll:true});
  }else{
    const part=control.closest('[data-film-part="extras"]');
    openExtra(model,part?.dataset.kgExtrasActive||"shots",Number(control.dataset.kgExtrasOpen));
  }
});

window.KGFilmCard={castPart, extrasPart, openLightbox, markup, createModel, hydrate, mount, update, playTrailer, stopTrailers, openDialog, savedFilm, modelFor, navigateDialogRelated, openInlineRelated};
})();
