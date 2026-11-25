(() => {
  "use strict";

  const keys = Object.freeze({
    recommendations: "kgHideWatchedRecommendations",
    collections: "kgHideWatchedCollections",
    roulette: "kgHideWatchedRoulette"
  });

  function get(scope) {
    if (!Object.hasOwn(keys, scope)) return false;

    try {
      return localStorage.getItem(keys[scope]) === "true";
    } catch {
      return false;
    }
  }

  function set(scope, enabled) {
    if (!Object.hasOwn(keys, scope)) {
      throw new Error("Unknown viewing preference");
    }

    if (typeof enabled !== "boolean") {
      throw new TypeError("Expected boolean");
    }

    localStorage.setItem(keys[scope], JSON.stringify(enabled));

    window.dispatchEvent(new CustomEvent(
      "kg:viewing-preferences-changed",
      { detail: { scope, enabled } }
    ));

    return enabled;
  }

  function allows(scope, film) {
    if (!get(scope)) return true;

    return !window.KGIsFilmWatched?.(film?.id);
  }

  function filter(scope, films) {
    if (!Array.isArray(films)) return [];

    return films.filter(film => allows(scope, film));
  }

  window.KGViewingPreferences = Object.freeze({
    get,
    set,
    allows,
    filter
  });
})();
