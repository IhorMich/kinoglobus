/* Automatic personal recommendations loading. */

(() => {
  "use strict";

  if (window.KGHomeRecommendationsController) return;

  function createController(mediaType) {
    const isTV = mediaType === "tv";

    const CACHE_KEY = isTV
      ? "kgHomePersonalTvCache"
      : "kgHomePersonalMovieCache";

    function canLoad() {
      if (!isTV) return true;

      const page = document.getElementById("view-series");

      return Boolean(
        page &&
        !page.hidden &&
        window.KGSeries?.active
      );
    }

    function showItems(items) {
      if (isTV) {
        KGHomeRecommendations.showSeries(items);
      } else {
        KGHomeRecommendations.showMovie(items);
      }
    }

    function hideItems() {
      if (isTV) {
        KGHomeRecommendations.hideSeries();
      } else {
        KGHomeRecommendations.hideMovie();
      }
    }
    const CACHE_VERSION = 1;
    const CACHE_TTL = 24 * 60 * 60 * 1000;

    let generation = 0;
    let pending = null;
    let displayedKey = null;
    let displayedItems = null;
    let displayedSource = null;
    let memoryCache = null;
    let memoryOnly = false;

    const PREFERENCE_DEBOUNCE = 500;
    let preferenceTimer = null;
    let scheduledContext = null;

    function cancelScheduledRefresh() {
      if (preferenceTimer !== null) {
        clearTimeout(preferenceTimer);
      }

      preferenceTimer = null;
      scheduledContext = null;
    }

    function getContext() {
      const preferences = KGPersonalPreferences.get();

      const profile = KGPersonalRecommendations
        .buildPreferenceProfile(preferences, mediaType);

      const hideWatched =
        KGViewingPreferences.get("recommendations");

      const key = JSON.stringify({
        genres: [...profile.effective.genres].sort(),
        countries: [...profile.effective.countries].sort(),
        decades: [...profile.effective.decades].sort(),
        language: filmLocale
      });

      return {
        preferences,
        active: profile.active && Boolean(apiKey),
        apiKey,
        hideWatched,
        key
      };
    }

    function sameDataContext(a, b) {
      return a.key === b.key &&
        a.apiKey === b.apiKey &&
        a.active === b.active;
    }

    function sameDisplayContext(a, b) {
      return sameDataContext(a, b) &&
        a.hideWatched === b.hideWatched;
    }

    function validCache(entry, context) {
      return Boolean(
        entry &&
        entry.version === CACHE_VERSION &&
        entry.key === context.key &&
        ["ready", "partial"].includes(entry.status) &&
        Number.isFinite(entry.savedAt) &&
        entry.savedAt <= Date.now() &&
        Date.now() - entry.savedAt < CACHE_TTL &&
        Array.isArray(entry.items) &&
        entry.items.length &&
        entry.items.every(item =>
          item &&
          Number.isSafeInteger(item.id) &&
          item.id > 0 &&
          (!isTV || (
            KGSeries.isSeriesId(item.id) &&
            item.media_type === "tv"
          ))
        )
      );
    }

    function readCache(context) {
      let raw;

      try {
        raw = localStorage.getItem(CACHE_KEY);
      } catch {
        return validCache(memoryCache, context)
          ? memoryCache
          : null;
      }

      if (raw === null) {
        return validCache(memoryCache, context)
          ? memoryCache
          : null;
      }

      try {
        const entry = JSON.parse(raw);

        if (memoryOnly &&
            validCache(memoryCache, context) &&
            (!validCache(entry, context) ||
              memoryCache.savedAt >= entry.savedAt)) {
          return memoryCache;
        }

        if (!validCache(entry, context)) return null;

        memoryCache = entry;
        memoryOnly = false;
        return entry;
      } catch {
        return null;
      }
    }

    function writeCache(context, result) {
      const cacheable =
        ["ready", "partial"].includes(result.status) &&
        result.items.length > 0 &&
        result.stats.loading?.errors?.length === 0 &&
        result.stats.countries?.failed === 0;

      if (!cacheable) return null;

      const entry = {
        version: CACHE_VERSION,
        key: context.key,
        savedAt: Date.now(),
        status: result.status,
        items: result.items
      };

      memoryCache = entry;

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify(entry)
        );

        memoryOnly = false;
      } catch {
        memoryOnly = true;
      }

      return entry;
    }

    function display(
      context, items, savedAt,
      status = "ready", cacheable = true
    ) {
      const watchedChecker =
        isTV && context.hideWatched
          ? window.KGSeries?.createWatchedChecker?.()
          : null;

      const allowed =
        window.KGPersonalRecommendations.filterCandidates(
          items,
          isTV ? "tv" : "movie",
          {
            allows: film => movieCatalog.allows(film),

            hideWatched: Boolean(context.hideWatched),

            isWatched: id =>
              watchedChecker &&
              window.KGSeries.isSeriesId(id)
                ? watchedChecker(id)
                : KGIsFilmWatched(id)
          }
        ).items;

      const unchanged =
        displayedItems !== null &&
        displayedItems.length === allowed.length &&
        displayedItems.every(
          (film, index) =>
            film === allowed[index] ||
            JSON.stringify(film) ===
              JSON.stringify(allowed[index])
        );

      if (!unchanged) {
        if (allowed.length) {
          showItems(allowed);
        } else {
          hideItems();
        }
      }

      displayedItems = allowed;

      displayedSource = {
        context,
        items,
        savedAt,
        status,
        cacheable
      };

      displayedKey = cacheable
        ? {...context, savedAt}
        : null;

      return allowed;
    }

    function clearDisplay() {
      displayedKey = null;
      displayedItems = null;
      displayedSource = null;
      hideItems();
    }

    function invalidatePending() {
      const previous = pending;

      generation++;
      pending = null;

      previous?.controller?.abort();

      return generation;
    }

    function hide() {
      cancelScheduledRefresh();
      invalidatePending();
      clearDisplay();
    }

    function restoreDisplayed(context) {
      const source = displayedSource;

      if (!source ||
          !sameDataContext(source.context, context)) {
        return null;
      }

      const items = display(
        context,
        source.items,
        source.savedAt,
        source.status,
        source.cacheable
      );

      return {
        active: true,
        status: source.status,
        source: "displayed",
        items
      };
    }

    async function refresh(force = false) {
      const context = getContext();

      if (!context.active) {
        hide();
        return;
      }

      if (!canLoad()) {
        cancelScheduledRefresh();

        if (pending &&
            !sameDataContext(pending.context, context)) {
          invalidatePending();
        }

        if (displayedSource &&
            !sameDataContext(displayedSource.context, context)) {
          clearDisplay();
        }

        return;
      }

      if (!force && scheduledContext &&
          sameDataContext(scheduledContext, context)) {
        return;
      }

      cancelScheduledRefresh();

      if (!force && pending &&
          sameDataContext(pending.context, context)) {
        return pending.promise;
      }

      if (!force && displayedKey &&
          sameDisplayContext(displayedKey, context) &&
          Date.now() - displayedKey.savedAt < CACHE_TTL) {
        return;
      }

      const token = invalidatePending();

      const preserveDisplay =
        displayedSource &&
        sameDataContext(
          displayedSource.context, context
        );

      if (!preserveDisplay) {
        clearDisplay();
      } else {
        restoreDisplayed(context);
      }

      if (!force) {
        const cached = readCache(context);

        if (cached) {
          const items = display(
            context,
            cached.items,
            cached.savedAt,
            cached.status
          );

          return {
            active: true,
            status: cached.status,
            source: "cache",
            items
          };
        }
      }

      const controller = new AbortController();

      function ensureCurrentRequest() {
        if (controller.signal.aborted) {
          throw new DOMException(
            "Request aborted", "AbortError"
          );
        }

        if (token !== generation ||
            !sameDataContext(context, getContext())) {
          throw new Error(
            "Obsolete recommendation request"
          );
        }
      }

      const task = (async () => {
        try {
          const result = await KGPersonalRecommendations
            .getRecommendations(
              context.preferences, mediaType,
              {
                language: filmLocale,
                signal: controller.signal,

                request: async (endpoint, params) => {
                  ensureCurrentRequest();
                  return requestTmdb(endpoint, params, {
                    signal: controller.signal
                  });
                },

                normalize: isTV
                  ? item => localizeFilmListItem(
                      KGSeries.normalize(item)
                    )
                  : localizeFilmListItem,

                allows: film =>
                  movieCatalog.allows(film),

                loadCountries: async id => {
                  ensureCurrentRequest();
                  return isTV
                    ? []
                    : KGHomeMetadata.loadCountries(id);
                },

                getFranchise: id =>
                  isTV
                  ? null
                  : KGHomeMetadata.getFranchise(id),

                hideWatched: false,

                isWatched: id =>
                  KGIsFilmWatched(id)
              }
            );

          const currentContext = getContext();

          if (controller.signal.aborted ||
              token !== generation ||
              !sameDataContext(context, currentContext)) {
            return;
          }

          const cached = writeCache(context, result);

          if (!cached) {
            const fallback = readCache(context);

            if (fallback) {
              const items = display(
                currentContext,
                fallback.items,
                fallback.savedAt,
                fallback.status
              );

              return {
                active: true,
                status: fallback.status,
                source: "cache",
                fallback: true,
                items
              };
            }
          }

          if (result.items.length) {
            const items = display(
              currentContext,
              result.items,
              cached?.savedAt || Date.now(),
              result.status,
              Boolean(cached)
            );

            return {
              ...result,
              source: "network",
              items
            };
          }

          if (result.status === "unavailable") {
            const restored =
              restoreDisplayed(currentContext);

            if (restored) {
              return {
                ...restored,
                fallback: true
              };
            }
          }

          clearDisplay();

          return {
            ...result,
            source: "network"
          };

        } catch (error) {
          if (controller.signal.aborted) return;

          const currentContext = getContext();

          if (token === generation &&
              sameDataContext(context, currentContext)) {
            const fallback = readCache(context);

            if (fallback) {
              const items = display(
                currentContext,
                fallback.items,
                fallback.savedAt,
                fallback.status
              );

              return {
                active: true,
                status: fallback.status,
                source: "cache",
                fallback: true,
                items
              };
            }

            const restored =
              restoreDisplayed(currentContext);

            if (restored) {
              return {
                ...restored,
                fallback: true
              };
            }

            clearDisplay();

            console.warn(
              "[Moven] Recommendations unavailable",
              error
            );
          }
        } finally {
          if (token === generation) {
            pending = null;
          }
        }
      })();

      pending = {
        context,
        promise: task,
        controller
      };

      return task;
    }

    async function redisplay() {
      const context = getContext();

      if (!context.active) {
        hide();
        return;
      }

      const restored = restoreDisplayed(context);

      if (restored) return restored;

      if (pending &&
          sameDataContext(pending.context, context)) {
        return pending.promise;
      }

      if (displayedSource &&
          !sameDataContext(
            displayedSource.context, context
          )) {
        clearDisplay();
      }

      const cached = readCache(context);

      if (!cached) return;

      const items = display(
        context,
        cached.items,
        cached.savedAt,
        cached.status
      );

      return {
        active: true,
        status: cached.status,
        source: "cache",
        items
      };
    }

    /* Controller API is exposed below. */


    function refreshAutomatically() {
      refresh().catch(error => {
        console.warn(
          "[Moven] Automatic recommendations refresh failed",
          error
        );
      });
    }

    function redisplayAutomatically() {
      redisplay().catch(error => {
        console.warn(
          "[Moven] Automatic recommendations redisplay failed",
          error
        );
      });
    }

    function preferencesChanged() {
      const context = getContext();

      if (!context.active) {
        hide();
        return;
      }

      if (scheduledContext &&
          sameDataContext(scheduledContext, context)) {
        return;
      }

      cancelScheduledRefresh();

      if (pending &&
          !sameDataContext(pending.context, context)) {
        invalidatePending();
      }

      if (displayedSource &&
          !sameDataContext(
            displayedSource.context, context
          )) {
        clearDisplay();
      }

      if (!canLoad()) return;

      if (
        (pending &&
          sameDataContext(pending.context, context)) ||
        (displayedKey &&
          sameDisplayContext(displayedKey, context) &&
          Date.now() - displayedKey.savedAt < CACHE_TTL) ||
        readCache(context)
      ) {
        refreshAutomatically();
        return;
      }

      scheduledContext = context;

      preferenceTimer = setTimeout(() => {
        preferenceTimer = null;
        scheduledContext = null;

        refreshAutomatically();
      }, PREFERENCE_DEBOUNCE);
    }

    window.addEventListener(
      "kg:personal-preferences-changed",
      preferencesChanged
    );

    window.addEventListener(
      "kg:viewing-preferences-changed",
      event => {
        if (event.detail?.scope === "recommendations") {
          redisplayAutomatically();
        }
      }
    );

    document.addEventListener(
      "kg:watched-change",
      event => {
        if ((event.detail?.mediaType === "tv") !== isTV) {
          return;
        }

        if (KGViewingPreferences.get("recommendations")) {
          redisplayAutomatically();
        }
      }
    );



    document.getElementById("settings")
      ?.addEventListener("close", refreshAutomatically);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          refreshAutomatically();
        }
      }
    );

    return Object.freeze({
      refresh,
      redisplay,
      hide
    });
  }

  const movie = createController("movie");
  const tv = createController("tv");

  window.KGHomeRecommendationsController =
    Object.freeze({
      refresh: movie.refresh,
      redisplay: movie.redisplay,
      hide: movie.hide,
      series: tv
    });

  movie.refresh().catch(error => {
    console.warn(
      "[Moven] Movie recommendations startup failed",
      error
    );
  });

  tv.refresh().catch(error => {
    console.warn(
      "[Moven] TV recommendations startup failed",
      error
    );
  });

  console.info(
    "[Moven] Recommendations controller v4 ready"
  );

})();
