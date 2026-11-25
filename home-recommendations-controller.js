/* Automatic personal recommendations loading. */

(() => {
  "use strict";

  if (window.KGHomeRecommendationsController) return;

  const CACHE_KEY = "kgHomePersonalMovieCache";
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
      .buildPreferenceProfile(preferences, "movie");

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
        item.id > 0
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
    const allowed = items.filter(film =>
      movieCatalog.allows(film) &&
      (!context.hideWatched ||
        !KGIsFilmWatched(film.id))
    );

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
        KGHomeRecommendations.showMovie(allowed);
      } else {
        KGHomeRecommendations.hideMovie();
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
    KGHomeRecommendations.hideMovie();
  }

  function hide() {
    cancelScheduledRefresh();
    generation++;
    pending = null;
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

    const token = ++generation;
    pending = null;

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

    function ensureCurrentRequest() {
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
            context.preferences,
            "movie",
            {
              language: filmLocale,

              request: async (endpoint, params) => {
                ensureCurrentRequest();
                return requestTmdb(endpoint, params);
              },

              normalize: localizeFilmListItem,

              allows: film =>
                movieCatalog.allows(film),

              loadCountries: async id => {
                ensureCurrentRequest();
                return KGHomeMetadata.loadCountries(id);
              },

              getFranchise: id =>
                KGHomeMetadata.getFranchise(id),

              hideWatched: false,

              isWatched: id =>
                KGIsFilmWatched(id)
            }
          );

        const currentContext = getContext();

        if (token !== generation ||
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
      promise: task
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

  window.KGHomeRecommendationsController =
    Object.freeze({
      refresh,
      redisplay,
      hide
    });


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
      generation++;
      pending = null;
    }

    if (displayedSource &&
        !sameDataContext(
          displayedSource.context, context
        )) {
      clearDisplay();
    }

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
      if (event.detail?.mediaType === "tv") return;

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

  refreshAutomatically();

  console.info(
    "[Moven] Recommendations controller ready"
  );

})();
