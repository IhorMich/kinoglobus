/* Digital and theatrical releases on the Globe screen. */
(() => {
  const root = document.getElementById("kg-home-releases");
  const sections = [
    {id: "digital", icon: "high_quality", title: "Новинки в качестве", subtitle: "Уже в цифровом релизе", more: "Все новинки", type: "4", from: -60, to: 0, limit: 6},
    {id: "cinema", icon: "theaters", title: "Сейчас в кинотеатрах", subtitle: "Недавние премьеры на большом экране", theatrical: true, type: "3|2", from: -21, to: 0, limit: 7},
    {id: "upcoming", icon: "theaters", title: "Скоро в кинотеатрах", subtitle: "Премьеры на ближайшие 30 дней", theatrical: true, type: "3|2", from: 1, to: 30, limit: 7}
  ].map(section => ({...section, films: [], expanded: false}));
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char]
  );
  const copy = (source, params) => escape(uiText(source, params));
  const icon = name => `<span class="material-symbols-outlined text-[18px]" aria-hidden="true">${name}</span>`;
  const title = film => film.title || film.original_title || uiText("Фильм");
  const day = (today, offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
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
  function closeDetails(restoreFocus = false) {
    if (activeDetail) window.KGCloseFilmFromRelated(activeDetail,restoreFocus);
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
        ${section.more ? `<button type="button" class="shrink-0 text-right font-label-sm text-label-sm text-primary hover:underline" data-release-action="expand" aria-expanded="false" aria-controls="kg-release-${section.id}-feed" hidden></button>` : ""}
      </div>
      <div>
        <div id="kg-release-${section.id}-feed"></div>
        <div id="kg-release-${section.id}-detail" class="w-full mt-2" data-home-inline-film hidden></div>
      </div>`;
    if (section.id === "upcoming") {
      document.getElementById("kg-home-feature").after(element);
    } else {
      root.appendChild(element);
    }
    section.element = element;
    section.feed = element.querySelector(`#kg-release-${section.id}-feed`);
    section.moreButton = element.querySelector("[data-release-action=expand]");
    section.detailId = `kg-release-${section.id}-detail`;
    element.addEventListener("click", event => {
      const button = event.target.closest("[data-release-action], [data-act=close-film]");
      if (!button) return;
      const action = button.dataset.releaseAction;
      if (button.dataset.act === "close-film") { closeDetails(true); return; }
      if (action === "key") {
        document.getElementById("tmdb-key-input").focus();
      } else if (action === "retry") {
        loadSection(section, context);
      } else if (action === "expand") {
        if (section.theatrical) {
          expandTheatrical(section, button);
        } else {
          section.expanded = !section.expanded;
          render(section);
        }
      } else if (action === "film") {
        const film = section.films.find(item => String(item.id) === button.dataset.id);
        if (!film) return;
        if (activeDetail !== section.detailId) closeDetails();
        activeDetail = section.detailId;
        window.KGOpenFilmFromRelated({...film, _kgGlobalRelated:true}, "related", activeDetail,{opener:button});
      }
    });
  }

  function posterCard(film, digital) {
    const localizedPoster = film.localizedPoster || {path:film.poster_path, showTitle:true};
    const poster = digital
      ? filmPosterMarkup({...film, localizedPoster}, "w342")
      : filmPosterMarkup({...film, localizedPoster:{path:localizedPoster.path || film.poster_path, showTitle:false}}, "w342");
    return `<div class="kg-bookmark-card w-40 shrink-0 snap-start"><button type="button" data-release-action="film" data-id="${film.id}" class="group w-full flex flex-col gap-1.5 text-left">
      <span class="relative block w-full aspect-[2/3] overflow-hidden rounded-xl bg-surface-container-high shadow-md">
        ${digital ? poster : `<span aria-hidden="true">${poster || '<span class="material-symbols-outlined absolute inset-0 grid place-items-center text-primary-container">movie</span>'}</span>`}
        <span class="absolute inset-x-1.5 top-1.5 flex flex-wrap justify-between gap-0.5">
          ${digital ? `<span class="px-1.5 py-1 rounded bg-surface-container-lowest/90 text-secondary font-label-sm text-label-sm">${copy("Цифровой релиз")}</span>` : ""}
          ${rating(film)}
        </span>
      </span>
      <span class="font-label-md text-label-md text-on-surface group-hover:text-primary leading-snug line-clamp-2">${escape(title(film))}</span>
      <span class="font-micro-caption text-micro-caption text-text-muted">${escape(releaseDate(film))}</span>
    </button></div>`;
  }

  const railClass = "flex gap-3.5 overflow-x-auto snap-x -mx-margin-mobile px-margin-mobile py-1";

  function theatricalMore(section) {
    if (section.visible >= section.films.length && section.page >= section.totalPages) return "";
    return `<button type="button" data-release-action="expand"
      class="grid w-40 shrink-0 snap-start self-start aspect-[2/3] place-items-center rounded-xl bg-surface-container-lowest border border-surface-border-subtle text-primary font-label-md text-label-md hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      ${copy("Ещё")}
    </button>`;
  }

  async function expandTheatrical(section, button) {
    const current = context;
    const start = section.visible;
    const rail = button.parentElement;
    if (start >= section.films.length) {
      button.disabled = true;
      button.textContent = uiText("Загружаем фильмы…");
      try {
        const page = section.page + 1;
        const result = await requestTmdb("discover/movie", {...section.params, page});
        if (context !== current || !button.isConnected) return;
        const known = new Set(section.films.map(film => film.id));
        for (const film of releaseFilms(result)) {
          if (known.has(film.id)) continue;
          section.films.push(film);
          known.add(film.id);
        }
        section.page = page;
        section.totalPages = Math.min(result.total_pages || page, 500);
      } catch {
        if (button.isConnected) {
          button.disabled = false;
          button.textContent = uiText("Повторить загрузку");
        }
        return;
      }
    }
    section.visible = section.films.length;
    const previous = button.previousElementSibling;
    button.insertAdjacentHTML("beforebegin", section.films.slice(start).map(film => posterCard(film, false)).join(""));
    const firstAdded = previous?.nextElementSibling;
    button.insertAdjacentHTML("afterend", theatricalMore(section));
    const nextButton = button.nextElementSibling;
    button.remove();
    const next = firstAdded && firstAdded !== button ? firstAdded : nextButton;
    const target = next?.matches("button") ? next : next?.querySelector("button");
    if (target) {
      target.focus({preventScroll: true});
      const offset = next.getBoundingClientRect().left - rail.getBoundingClientRect().left;
      rail.scrollBy({left: offset - parseFloat(getComputedStyle(rail).paddingLeft), behavior: "auto"});
    }
  }

  function message(section, text, action, label) {
    if (section.moreButton) section.moreButton.hidden = true;
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
    if (section.theatrical) {
      feed.innerHTML = `<div class="${railClass}">${films.slice(0, section.visible).map(film => posterCard(film, false)).join("")}${theatricalMore(section)}</div>`;
      return;
    }
    moreButton.hidden = films.length <= limit;
    moreButton.textContent = uiText(expanded ? "Свернуть" : section.more) + (expanded ? " ↑" : " →");
    moreButton.setAttribute("aria-expanded", String(expanded));
    const filmsToShow = expanded ? films : films.slice(0, limit);
    feed.innerHTML = `<div class="${expanded ? "grid grid-cols-2 sm:grid-cols-3 gap-3 [&>div]:w-full" : railClass}">${filmsToShow.map(film => posterCard(film, true)).join("")}</div>`;
  }

  const releaseFilms = result => (result.results || [])
    .filter(film => Number.isSafeInteger(film.id))
    .map(localizeFilmListItem);

  async function loadSection(section, current) {
    if (!current.key) {
      message(section, "Добавьте ключ TMDB, чтобы загрузить релизы.", "key", "Добавить ключ TMDB");
      return;
    }
    message(section, "Загружаем фильмы…");
    try {
      const params = {
        language: filmLocale, include_adult: "false",
        with_release_type: section.type, "release_date.gte": day(current.today, section.from),
        "release_date.lte": day(current.today, section.to), sort_by: "popularity.desc"
      };
      if (current.region) params.region = current.region;
      const result = await requestTmdb("discover/movie", params);
      if (context !== current) return;
      section.films = releaseFilms(result);
      section.params = params;
      section.page = 1;
      section.totalPages = Math.min(result.total_pages || 1, 500);
      section.visible = section.limit;
      render(section);
      const featured = section.films.slice(0, section.theatrical ? 1 : 3);
      await Promise.allSettled(featured.map(async film => {
        const details = await filmDetails(film.id);
        if (context !== current) return;
        Object.assign(film, {title:details.title || film.title, localizedPoster:details.localizedPoster});
        if (section.theatrical) {
          const card = section.feed.querySelector(`[data-release-action="film"][data-id="${film.id}"]`)?.parentElement;
          if (card && !card.contains(document.activeElement)) card.outerHTML = posterCard(film, false);
        }
      }));
      if (context === current && section.id === "digital" && section.films.length) {
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
    const today = new Date();
    const dateKey = day(today, 0);
    if (context?.key === apiKey && context.region === region && context.dateKey === dateKey) return;
    closeDetails();
    context = {key:apiKey, region, regionName:region ? interfaceRegionNames.of(region) : "", today, dateKey};
    for (const section of sections) {
      section.expanded = false;
      section.films = [];
      section.element.querySelector("[data-release-subtitle]").textContent = context.regionName
        ? uiText("{subtitle} · {region}", {subtitle:uiText(section.subtitle), region:context.regionName})
        : uiText(section.subtitle);
      loadSection(section, context);
    }
  }

  document.getElementById("tmdb-key-save").addEventListener("click", refresh);
  document.getElementById("settings").addEventListener("close", refresh);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
  refresh();
})();
