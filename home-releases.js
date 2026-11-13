/* Digital and theatrical releases on the Globe screen. */
(() => {
  const root = document.getElementById("kg-home-releases");
  const sections = [
    {id: "digital", icon: "high_quality", title: "Новинки в качестве", subtitle: "Уже в цифровом релизе", more: "Все новинки", type: "4", days: 60, limit: 6},
    {id: "cinema", icon: "theaters", title: "Сейчас в кинотеатрах", subtitle: "Недавние премьеры на большом экране", more: "Афиша залов", type: "3|2", days: 21, limit: 4}
  ].map(section => ({...section, films: [], expanded: false}));
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char]
  );
  const copy = (source, params) => escape(uiText(source, params));
  const icon = name => `<span class="material-symbols-outlined text-[18px]" aria-hidden="true">${name}</span>`;
  const image = (path, size) => /^\/[a-z0-9_.-]+$/i.test(path || "")
    ? `<img class="absolute inset-0 w-full h-full object-cover" src="https://image.tmdb.org/t/p/${size}${path}" alt="" loading="lazy">`
    : "";
  const title = film => film.title || film.original_title || uiText("Фильм");
  const day = daysAgo => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const month = String(date.getMonth()+1).padStart(2,"0");
    return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2,"0")}`;
  };
  const releaseDate = film => {
    const date = new Date(film.release_date + "T12:00:00");
    return Number.isNaN(+date) ? "" : date.toLocaleDateString(interfaceLanguage, {day:"numeric", month:"short"});
  };
  const rating = film => Number(film.vote_average) > 0
    ? `<span class="px-2 py-1 rounded-full bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm whitespace-nowrap">★ ${Number(film.vote_average).toFixed(1)}</span>`
    : "";

  let activeDetail = "";
  let context;
  function closeDetails() {
    if (activeDetail) window.KGCloseFilmFromRelated(activeDetail);
    activeDetail = "";
  }

  for (const section of sections) {
    const element = document.createElement("section");
    element.className = "flex flex-col gap-3.5";
    element.setAttribute("aria-labelledby", `kg-release-${section.id}-title`);
    element.innerHTML = `
      <div class="flex items-end justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 ${section.id==="digital"?"text-primary-container":"text-secondary"}">
            ${icon(section.icon)}<h2 id="kg-release-${section.id}-title" class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">${copy(section.title)}</h2>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant" data-release-subtitle></p>
        </div>
        <button type="button" class="shrink-0 text-right font-label-sm text-label-sm text-primary hover:underline" data-release-action="expand" aria-expanded="false" aria-controls="kg-release-${section.id}-feed" hidden></button>
      </div>
      <div id="kg-release-${section.id}-feed"></div>
      <div id="kg-release-${section.id}-detail"></div>`;
    root.appendChild(element);
    section.element = element;
    section.feed = element.querySelector(`#kg-release-${section.id}-feed`);
    section.moreButton = element.querySelector("[data-release-action=expand]");
    section.detailId = `kg-release-${section.id}-detail`;
    element.addEventListener("click", event => {
      const button = event.target.closest("[data-release-action], [data-act=close-film]");
      if (!button) return;
      const action = button.dataset.releaseAction;
      if (button.dataset.act === "close-film") { closeDetails(); return; }
      if (action === "key") {
        document.getElementById("tmdb-key-input").focus();
      } else if (action === "retry") {
        loadSection(section, context);
      } else if (action === "expand") {
        section.expanded = !section.expanded;
        render(section);
      } else if (action === "film") {
        const film = section.films.find(item => String(item.id) === button.dataset.id);
        if (!film) return;
        if (activeDetail !== section.detailId) closeDetails();
        activeDetail = section.detailId;
        window.KGOpenFilmFromRelated({...film, _kgGlobalRelated:true}, "related", activeDetail);
        const card = document.getElementById(activeDetail)?.firstElementChild;
        if (card) window.KGScrollToFilmDescription?.(card);
      }
    });
  }

  function posterCard(film, digital) {
    return `<button type="button" data-release-action="film" data-id="${film.id}" class="${digital ? "w-40 shrink-0 snap-start" : "min-w-0 p-2 rounded-xl bg-surface-container-low shadow-sm"} group flex flex-col gap-1.5 text-left">
      <span class="relative block w-full aspect-[2/3] overflow-hidden rounded-xl bg-surface-container-high shadow-md">
        ${filmPosterMarkup({...film, localizedPoster:film.localizedPoster || {path:film.poster_path, showTitle:true}}, "w342")}
        <span class="absolute inset-x-1.5 top-1.5 flex flex-wrap justify-between gap-0.5">
          ${digital ? `<span class="px-1.5 py-1 rounded bg-surface-container-lowest/90 text-secondary font-label-sm text-label-sm">${copy("Цифровой релиз")}</span>` : ""}
          ${rating(film)}
        </span>
      </span>
      <span class="font-label-md text-label-md text-on-surface group-hover:text-primary leading-snug line-clamp-2">${escape(title(film))}</span>
      <span class="font-micro-caption text-micro-caption text-text-muted">${escape(releaseDate(film))}</span>
    </button>`;
  }

  function cinemaHero(film) {
    const label = film.release_date >= day(6) ? "Премьера недели" : "В кинотеатрах";
    const runtime = film.runtime ? copy("{minutes} мин", {minutes:film.runtime}) : "";
    const director = film.dirs?.[0] ? copy("Реж. {name}", {name:film.dirs[0]}) : "";
    return `<button type="button" data-release-action="film" data-id="${film.id}" aria-label="${copy("Открыть фильм {title}", {title:title(film)})}" class="group block w-full text-left cursor-pointer rounded-2xl overflow-hidden bg-surface-container-low shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <span class="relative block h-52">
        ${image(film.backdrop_path || film.poster_path, "w780")}
        <span class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/30 to-transparent"></span>
        <span class="absolute inset-x-3 top-3 flex flex-wrap justify-between gap-1">
          <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold uppercase">${icon("local_fire_department")}${copy(label)}</span>
          ${runtime ? `<span class="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-lowest/85 font-label-sm text-label-sm">${icon("schedule")}${runtime}</span>` : ""}
        </span>
      </span>
      <span class="flex items-start justify-between gap-2 p-4 pt-1">
        <span class="min-w-0">
          <span class="block font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary">${escape(title(film))}</span>
          <span class="block font-body-sm text-body-sm text-on-surface-variant">${[escape(releaseDate(film)),director].filter(Boolean).join(" · ")}</span>
        </span>
        ${rating(film)}
      </span>
    </button>`;
  }

  function message(section, text, action, label) {
    section.moreButton.hidden = true;
    section.feed.innerHTML = `<div class="rounded-xl bg-surface-panel p-3">
      <p role="status" class="font-body-sm text-body-sm text-text-muted">${copy(text)}</p>
      ${action ? `<button type="button" data-release-action="${action}" class="mt-2 rounded-lg bg-surface-container-high px-3 py-2 font-label-sm text-label-sm text-primary">${copy(label)}</button>` : ""}
    </div>`;
  }

  function render(section) {
    const {films, expanded, limit, moreButton, feed} = section;
    if (!films.length) {
      message(section, "За этот период в выбранном регионе релизов нет.");
      return;
    }
    moreButton.hidden = films.length <= limit;
    moreButton.textContent = uiText(expanded ? "Свернуть" : section.more) + (expanded ? " ↑" : " →");
    moreButton.setAttribute("aria-expanded", String(expanded));
    const filmsToShow = expanded ? films : films.slice(0, limit);
    if (section.id === "digital") {
      feed.innerHTML = `<div class="${expanded ? "grid grid-cols-2 sm:grid-cols-3 gap-3 [&>button]:w-full" : "flex gap-3.5 overflow-x-auto snap-x -mx-margin-mobile px-margin-mobile py-1"}">${filmsToShow.map(film => posterCard(film,true)).join("")}</div>`;
    } else {
      feed.innerHTML = `<div class="flex flex-col gap-3.5">${cinemaHero(filmsToShow[0])}<div class="grid grid-cols-3 gap-2.5">${filmsToShow.slice(1).map(film => posterCard(film,false)).join("")}</div></div>`;
    }
  }

  async function loadSection(section, current) {
    if (!current.key) {
      message(section, "Добавьте ключ TMDB, чтобы загрузить релизы.", "key", "Добавить ключ TMDB");
      return;
    }
    message(section, "Загружаем фильмы…");
    try {
      const params = {
        language: filmLocale, region: current.region, include_adult: "false",
        with_release_type: section.type, "release_date.gte": day(section.days),
        "release_date.lte": day(0), sort_by: "popularity.desc"
      };
      const result = await requestTmdb("discover/movie", params);
      if (context !== current) return;
      section.films = (result.results || []).filter(film => Number.isSafeInteger(film.id)).map(localizeFilmListItem);
      render(section);
      const featured = section.id === "cinema" ? section.films.slice(0, 1) : section.films.slice(0, 3);
      await Promise.allSettled(featured.map(async film => {
        const details = await filmDetails(film.id);
        if (context !== current) return;
        Object.assign(film, {title:details.title || film.title, localizedPoster:details.localizedPoster, runtime:details.runtime, dirs:details.dirs});
      }));
      if (context === current && section.films.length) {
        const carousel = section.feed.firstElementChild;
        const left = carousel?.scrollLeft || 0;
        render(section);
        if (section.feed.firstElementChild) section.feed.firstElementChild.scrollLeft = left;
      }
    } catch {
      if (context === current) message(section, "Не удалось загрузить релизы.", "retry", "Повторить загрузку");
    }
  }

  function refresh() {
    const region = window.KGLegalWatch.getEffectiveRegion();
    if (context?.key === apiKey && context.region === region) return;
    closeDetails();
    context = {key:apiKey, region, regionName:interfaceRegionNames.of(region)};
    for (const section of sections) {
      section.expanded = false;
      section.films = [];
      section.element.querySelector("[data-release-subtitle]").textContent = uiText("{subtitle} · {region}", {
        subtitle:uiText(section.subtitle), region:context.regionName
      });
      loadSection(section, context);
    }
  }

  document.getElementById("tmdb-key-save").addEventListener("click", refresh);
  document.getElementById("settings").addEventListener("close", refresh);
  refresh();
})();
