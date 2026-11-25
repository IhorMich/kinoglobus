(() => {
  "use strict";

  const STORAGE_KEY = "kgPersonalPreferences";

  const validGenres = new Set(
    Object.keys(GENRES).filter(Boolean).map(Number)
  );

  const validCountries = new Set([
    ...COUNTRIES, "SU", "YU", "DD"
  ]);

  const validDecades = new Set([
    0, 1950, 1960, 1970, 1980,
    1990, 2000, 2010, 2020
  ]);

  function defaults() {
    return {
      enabled: false,
      genres: [],
      countries: [],
      decades: []
    };
  }

  function validateList(value, allowed, field) {
    if (!Array.isArray(value)) {
      throw new TypeError("Invalid preference: " + field);
    }

    if (value.some(item => !allowed.has(item))) {
      throw new TypeError("Invalid value: " + field);
    }

    return [...new Set(value)];
  }

  function validate(value) {
    if (!value ||
        typeof value !== "object" ||
        Array.isArray(value)) {
      throw new TypeError("Invalid personal preferences");
    }

    const fields = [
      "enabled", "genres", "countries", "decades"
    ];

    if (Object.keys(value).length !== fields.length ||
        fields.some(field => !Object.hasOwn(value, field))) {
      throw new TypeError("Invalid preference fields");
    }

    if (typeof value.enabled !== "boolean") {
      throw new TypeError("Invalid preference: enabled");
    }

    return {
      enabled: value.enabled,
      genres: validateList(
        value.genres, validGenres, "genres"
      ),
      countries: validateList(
        value.countries, validCountries, "countries"
      ),
      decades: validateList(
        value.decades, validDecades, "decades"
      )
    };
  }

  function get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw === null) return defaults();

      return validate(JSON.parse(raw));
    } catch {
      return defaults();
    }
  }

  function save(value) {
    const next = validate(value);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(new CustomEvent(
      "kg:personal-preferences-changed",
      {detail: structuredClone(next)}
    ));

    return next;
  }

  function setEnabled(enabled) {
    return save({...get(), enabled});
  }

  function setGenres(genres) {
    return save({...get(), genres});
  }

  function setCountries(countries) {
    return save({...get(), countries});
  }

  function setDecades(decades) {
    return save({...get(), decades});
  }

  function reset() {
    return save(defaults());
  }


  // Personal recommendation weights

  const WEIGHTS = Object.freeze({
    genres: 50,
    countries: 30,
    decades: 20
  });

  function isActive(preferences = get()) {
    return preferences.enabled && (
      preferences.genres.length > 0 ||
      preferences.countries.length > 0 ||
      preferences.decades.length > 0
    );
  }

  function filmGenres(film) {
    return [...new Set([
      ...(Array.isArray(film.genre_ids)
        ? film.genre_ids : []),
      ...(Array.isArray(film.genres)
        ? film.genres.map(genre => genre?.id) : [])
    ].map(Number).filter(id => validGenres.has(id)))];
  }

  function filmCountries(film) {
    const production = [
      ...(Array.isArray(film.production_countries)
        ? film.production_countries.map(country =>
            country?.iso_3166_1
          ) : []),
      ...(Array.isArray(film._homeProductionCountries)
        ? film._homeProductionCountries : [])
    ].filter(Boolean);

    if (production.length) {
      return [...new Set(production)];
    }

    return [...new Set([
      ...(Array.isArray(film.origin_country)
        ? film.origin_country : []),
      film._cc
    ].filter(Boolean))];
  }

  function filmDecade(film) {
    const date = String(film.release_date || "");
    const match = date.match(/^([0-9]{4})(?:-|$)/);

    if (!match) return null;

    const year = Number(match[1]);

    if (year <= 0) return null;
    if (year < 1950) return 0;

    return Math.floor(year / 10) * 10;
  }

  function score(film, preferences = get()) {
    if (!film || !isActive(preferences)) return 0;

    let matched = 0;
    let total = 0;

    if (preferences.genres.length) {
      total += WEIGHTS.genres;

      if (filmGenres(film).some(id =>
        preferences.genres.includes(id)
      )) {
        matched += WEIGHTS.genres;
      }
    }

    if (preferences.countries.length) {
      total += WEIGHTS.countries;

      if (filmCountries(film).some(code =>
        preferences.countries.includes(code)
      )) {
        matched += WEIGHTS.countries;
      }
    }

    if (preferences.decades.length) {
      total += WEIGHTS.decades;

      if (preferences.decades.includes(filmDecade(film))) {
        matched += WEIGHTS.decades;
      }
    }

    return total
      ? Math.round(matched / total * 100)
      : 0;
  }

  function rank(films, preferences = get()) {
    if (!Array.isArray(films)) return [];

    if (!isActive(preferences)) {
      return films.slice();
    }

    return films
      .map((film, index) => ({
        film,
        index,
        score: score(film, preferences)
      }))
      .sort((a, b) =>
        b.score - a.score || a.index - b.index
      )
      .map(item => item.film);
  }

  window.KGPersonalPreferences = Object.freeze({
    get,
    setEnabled,
    setGenres,
    setCountries,
    setDecades,
    reset,
    validate,
    isActive,
    score,
    rank
  });

})();
