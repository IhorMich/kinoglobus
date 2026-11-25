/* Personal recommendations on the home screens. */
(() => {
  "use strict";

  if (window.KGHomeRecommendations) return;

  const PAGE_SIZE = 12;

  const escape = value => String(value ?? "")
    .replace(/[&<>"']/g, char =>
      ({"&":"&amp;", "<":"&lt;", ">":"&gt;",
        '"':"&quot;", "'":"&#39;"})[char]
    );

  const copy = source => escape(uiText(source));

  const railClass =
    "flex gap-3.5 overflow-x-auto " +
    "-mx-margin-mobile px-margin-mobile py-1";

  const states = new Map();

  function posterCard(film) {
    const title = film.title ||
      film.original_title || film.name ||
      uiText("Фильм");

    const year = (
      film.release_date ||
      film.first_air_date || ""
    ).slice(0,4);

    const rating = Number(film.vote_average);

    const poster = filmPosterMarkup({
      ...film,
      localizedPoster: {
        path: film.localizedPoster?.path ||
          film.poster_path,
        showTitle: false
      }
    }, "w342");

    return `<div class="kg-bookmark-card kg-home-release-card w-40 shrink-0">
      <button type="button"
        data-recommendation-action="film"
        data-id="${escape(film.id)}"
        class="group w-full flex flex-col gap-1.5 text-left">

        <span class="relative block w-full aspect-[2/3] overflow-hidden rounded-xl bg-surface-container-high shadow-md">
          ${poster}
          ${rating > 0 ? `
            <span class="absolute top-1.5 left-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm whitespace-nowrap">
              ★ ${rating.toFixed(1)}
            </span>` : ""}
        </span>

        <span class="font-label-md text-label-md text-on-surface group-hover:text-primary leading-snug line-clamp-2">
          ${escape(title)}
        </span>

        <span class="font-micro-caption text-micro-caption text-text-muted">
          ${escape(year)}
        </span>
      </button>
    </div>`;
  }

  function moreCard(state) {
    if (state.visible >= state.items.length) return "";

    return `<button type="button"
      data-recommendation-action="more"
      class="grid w-40 shrink-0 self-start aspect-[2/3] place-items-center rounded-xl bg-surface-container-lowest border border-surface-border-subtle text-primary font-label-md text-label-md hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      ${copy("Ещё")}
    </button>`;
  }

  function closeDetails(state, restoreFocus = false) {
    window.KGCloseFilmFromRelated?.(
      state.detailId, restoreFocus
    );
  }

  function closeAllDetails(state) {
    if (!window.KGCloseRecommendationDetail?.(
      state.detailId
    )) {
      closeDetails(state);
    }
  }

  function render(state) {
    state.feed.innerHTML =
      `<div class="${railClass}">
        ${state.items.slice(0,state.visible)
          .map(posterCard).join("")}
        ${moreCard(state)}
      </div>`;
  }

  function expand(state, button) {
    const start = state.visible;
    const rail = button.parentElement;
    const scrollLeft = rail.scrollLeft;

    state.visible = Math.min(
      start + PAGE_SIZE,
      state.items.length
    );

    button.insertAdjacentHTML(
      "beforebegin",
      state.items.slice(start,state.visible)
        .map(posterCard).join("")
    );

    const firstAdded = rail.children[start];

    button.insertAdjacentHTML(
      "afterend", moreCard(state)
    );

    button.remove();

    firstAdded?.querySelector("button")
      ?.focus({preventScroll:true});

    rail.scrollLeft = scrollLeft;

  }

  function mountMovie() {
    if (states.has("movie")) {
      return states.get("movie");
    }

    const anchor = document
      .getElementById("kg-release-digital-title")
      ?.closest("section");

    if (!anchor) {
      throw new Error("Digital releases anchor missing");
    }

    const element = document.createElement("section");

    element.id = "kg-home-personal-movie";
    element.className = "flex flex-col gap-3.5";
    element.hidden = true;
    element.style.display = "none";

    element.setAttribute(
      "aria-labelledby",
      "kg-home-personal-movie-title"
    );

    element.innerHTML = `
      <div class="min-w-0">
        <div class="flex items-center gap-1.5 text-primary-container">
          <span class="material-symbols-outlined text-[18px]"
            aria-hidden="true">auto_awesome</span>

          <h2 id="kg-home-personal-movie-title"
            class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            ${copy("Рекомендации для вас")}
          </h2>
        </div>

        <p class="font-body-sm text-body-sm text-on-surface-variant">
          ${copy("На основе ваших предпочтений")}
        </p>
      </div>

      <div>
        <div data-recommendation-feed></div>

        <div id="kg-home-personal-movie-detail"
          class="w-full mt-2"
          data-home-inline-film hidden></div>
      </div>`;

    anchor.after(element);

    const state = {
      type: "movie",
      element,
      feed: element.querySelector(
        "[data-recommendation-feed]"
      ),
      detailId: "kg-home-personal-movie-detail",
      items: [],
      visible: PAGE_SIZE
    };

    states.set("movie",state);

    element.addEventListener("click",event => {
      const button = event.target.closest(
        "[data-recommendation-action], " +
        "[data-act=close-film]"
      );

      if (!button) return;

      if (button.dataset.act === "close-film") {
        closeDetails(state,true);
        return;
      }

      const action =
        button.dataset.recommendationAction;

      if (action === "more") {
        expand(state,button);
      }

      if (action === "film") {
        const film = state.items.find(item =>
          String(item.id) === button.dataset.id
        );

        if (!film) return;

        window.KGOpenFilmFromRelated(
          {...film, _kgGlobalRelated:true},
          "related",
          state.detailId,
          {opener:button}
        );
      }
    });

    return state;
  }

  function showMovie(items) {
    const state = mountMovie();

    const preserveState =
      !state.element.hidden &&
      state.items.length > 0;

    const previousVisible = state.visible;

    const scrollLeft =
      state.feed.firstElementChild?.scrollLeft || 0;

    const focused = document.activeElement;

    const focusedId =
      state.feed.contains(focused)
        ? focused.dataset.id || null
        : null;

    const focusedMore =
      state.feed.contains(focused) &&
      focused.dataset.recommendationAction === "more";

    const detail =
      window.KGGetRecommendationDetail?.(
        state.detailId
      );

    const unique = new Map();

    for (const film of items || []) {
      if (!film?.id) continue;
      const key = String(film.id);

      if (!unique.has(key)) {
        unique.set(key,film);
      }
    }

    state.items = [...unique.values()];

    const rootIndex = detail
      ? state.items.findIndex(
          film => String(film.id) === detail.rootId
        )
      : -1;

    if (rootIndex < 0) {
      closeAllDetails(state);
    }

    const requiredVisible = rootIndex >= 0
      ? Math.ceil((rootIndex + 1) / PAGE_SIZE) * PAGE_SIZE
      : PAGE_SIZE;

    state.visible = Math.min(
      Math.max(
        preserveState ? previousVisible : PAGE_SIZE,
        requiredVisible
      ),
      state.items.length
    );

    if (!state.items.length) {
      hideMovie();
      return;
    }

    render(state);
    state.element.hidden = false;
    state.element.style.display = "";

    if (detail && rootIndex >= 0) {
      const opener = [...state.feed.querySelectorAll(
        '[data-recommendation-action="film"]'
      )].find(
        button => button.dataset.id === detail.rootId
      );

      const updated =
        window.KGUpdateRecommendationOpener?.(
          state.detailId, opener
        );

      if (!updated) {
        closeAllDetails(state);
      }
    }

    if (preserveState) {
      const rail = state.feed.firstElementChild;

      if (focusedId) {
        const button = [...state.feed.querySelectorAll(
          '[data-recommendation-action="film"]'
        )].find(
          item => item.dataset.id === focusedId
        );

        button?.focus({preventScroll:true});
      } else if (focusedMore) {
        state.feed.querySelector(
          '[data-recommendation-action="more"]'
        )?.focus({preventScroll:true});
      }

      if (rail) {
        rail.scrollLeft = scrollLeft;
      }
    }
  }

  function hideMovie() {
    const state = states.get("movie");
    if (!state) return;
    closeAllDetails(state);

    state.element.hidden = true;
    state.element.style.display = "none";
    state.feed.replaceChildren();
    state.items = [];
    state.visible = PAGE_SIZE;
  }

  window.KGHomeRecommendations = Object.freeze({
    mountMovie,
    showMovie,
    hideMovie
  });

  mountMovie();

  console.info("[Moven] Personal recommendations UI ready");
})();
