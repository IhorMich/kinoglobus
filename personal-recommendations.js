(function () {
  "use strict";

  const MODELS = Object.freeze({
    balanced: Object.freeze({
      genres: 50,
      countries: 30,
      decades: 20
    }),
    genreFirst: Object.freeze({
      genres: 60,
      countries: 25,
      decades: 15
    }),
    discovery: Object.freeze({
      genres: 45,
      countries: 35,
      decades: 20
    })
  });

  const DEFAULT_MODEL = "genreFirst";

  const QUALITY_CONFIG = Object.freeze({
    movie: Object.freeze({
      baseline: 6.5,
      confidence: 100
    }),
    tv: Object.freeze({
      baseline: 7.0,
      confidence: 50
    })
  });

  function evaluateQuality(item, type = "movie") {
    const config = QUALITY_CONFIG[type];

    if (!config) {
      throw new Error("Unknown media type");
    }

    const rawRating = Number(item?.vote_average);
    const rawVotes = Number(item?.vote_count);

    const validRating =
      Number.isFinite(rawRating) &&
      rawRating > 0 &&
      rawRating <= 10;

    const rating = validRating
      ? rawRating
      : config.baseline;

    const votes =
      validRating &&
      Number.isFinite(rawVotes) &&
      rawVotes > 0
        ? Math.floor(rawVotes)
        : 0;

    const adjustedRating =
      (votes * rating +
       config.confidence * config.baseline) /
      (votes + config.confidence);

    return {
      rating,
      votes,
      adjustedRating,
      score: adjustedRating * 10,
      confidence:
        votes / (votes + config.confidence)
    };
  }


  const POPULARITY_CONFIG = Object.freeze({
    movie: 500,
    tv: 500
  });

  function evaluatePopularity(item, type = "movie") {
    const cap = POPULARITY_CONFIG[type];

    if (!Number.isFinite(cap) || cap <= 0) {
      throw new Error("Unknown media type");
    }

    const raw = Number(item?.popularity);

    const popularity =
      Number.isFinite(raw) && raw > 0
        ? raw
        : 0;

    const score = Math.min(
      100,
      Math.log1p(popularity) /
      Math.log1p(cap) * 100
    );

    return {
      popularity,
      score
    };
  }

  const TV_GENRE_MAP = Object.freeze({
    28: [10759],
    12: [10759],
    878: [10765],
    14: [10765],
    10752: [10768]
  });

  const TV_GENRE_IDS = Object.freeze([
    10759, 16, 35, 80, 99, 18, 10751,
    10762, 9648, 10763, 10764, 10765,
    10766, 10767, 10768, 37
  ]);

  function unique(values) {
    return [...new Set(values)];
  }

  function normalizeGenres(item) {
    return unique([
      ...(Array.isArray(item.genre_ids)
        ? item.genre_ids : []),
      ...(Array.isArray(item.genres)
        ? item.genres.map(g => g?.id) : [])
    ].map(Number).filter(n =>
      Number.isInteger(n) && n > 0
    ));
  }

  function normalizeCountries(item) {
    const production = unique([
      ...(Array.isArray(item.production_countries)
        ? item.production_countries.map(
            c => c?.iso_3166_1
          ) : []),
      ...(Array.isArray(item._homeProductionCountries)
        ? item._homeProductionCountries : [])
    ].filter(c => typeof c === "string" && c)
      .map(c => c.toUpperCase()));

    if (production.length) return production;

    return unique([
      ...(Array.isArray(item.origin_country)
        ? item.origin_country : []),
      item._cc
    ].filter(c => typeof c === "string" && c)
      .map(c => c.toUpperCase()));
  }

  function normalizeDecade(item, type) {
    const date = type === "tv"
      ? item.first_air_date
      : item.release_date;

    const match = String(date || "").match(
      /^(\d{4})-\d{2}-\d{2}$/
    );

    if (!match) return null;

    const year = Number(match[1]);

    if (year <= 0) return null;

    return year < 1950
      ? 0
      : Math.floor(year / 10) * 10;
  }

  function selectedGenres(genres, type) {
    const ids = unique(genres.map(Number));

    if (type !== "tv") return ids;

    return unique(ids.flatMap(id =>
      TV_GENRE_MAP[id] || [id]
    )).filter(id => TV_GENRE_IDS.includes(id));
  }

  function isActive(preferences) {
    return !!(
      preferences?.enabled &&
      ["genres", "countries", "decades"].some(
        key => Array.isArray(preferences[key]) &&
               preferences[key].length > 0
      )
    );
  }

  function isActiveForType(
    preferences,
    type = "movie"
  ) {
    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    if (!isActive(preferences)) return false;

    if (type === "movie") return true;

    return (
      selectedGenres(
        preferences.genres || [], type
      ).length > 0 ||
      (preferences.countries || []).length > 0 ||
      (preferences.decades || []).length > 0
    );
  }

  const ADAPTIVE_CONFIG = Object.freeze({
    minPersonalWeight: 0.35,
    maxPersonalWeight: 0.70
  });

  function calculateSelectivity(selected, available) {
    const allowed = unique(available);
    const chosen = unique(selected).filter(
      value => allowed.includes(value)
    );

    const total = allowed.length;
    const count = chosen.length;

    if (total === 0 || count === 0) return 0;
    if (count >= total) return 0;

    return (total - count) / (total - 1);
  }

  function buildPreferenceProfile(
    preferences,
    type = "movie",
    model = DEFAULT_MODEL,
    availableOptions
  ) {
    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    const baseWeights = MODELS[model];

    if (!baseWeights) {
      throw new Error("Unknown recommendation model");
    }

    const options = availableOptions ||
      window.KGPersonalPreferences?.getOptions?.();

    if (!options) {
      throw new Error("Missing preference options");
    }

    const available = {
      genres: selectedGenres(options.genres, type),
      countries: unique(options.countries),
      decades: unique(options.decades)
    };

    const selected = {
      genres: selectedGenres(
        preferences?.genres || [], type
      ),
      countries: unique(
        preferences?.countries || []
      ),
      decades: unique(
        preferences?.decades || []
      )
    };

    const effective = {
      enabled: !!preferences?.enabled,
      genres: [],
      countries: [],
      decades: []
    };

    const selectivity = {};
    const rawWeights = {};
    const normalizedWeights = {};

    let totalWeight = 0;
    let totalBaseWeight = 0;

    for (const key of Object.keys(baseWeights)) {
      selected[key] = selected[key].filter(
        value => available[key].includes(value)
      );

      const coefficient = effective.enabled
        ? calculateSelectivity(
            selected[key], available[key]
          )
        : 0;

      selectivity[key] = coefficient;

      rawWeights[key] =
        baseWeights[key] * coefficient;

      if (coefficient > 0) {
        effective[key] = selected[key].slice();

        totalWeight += rawWeights[key];
        totalBaseWeight += baseWeights[key];
      }
    }

    for (const key of Object.keys(baseWeights)) {
      normalizedWeights[key] = totalWeight > 0
        ? rawWeights[key] / totalWeight * 100
        : 0;
    }

    const active = totalWeight > 0;

    const strength = active
      ? totalWeight / totalBaseWeight
      : 0;

    const personalWeight = active
      ? ADAPTIVE_CONFIG.minPersonalWeight +
        (
          ADAPTIVE_CONFIG.maxPersonalWeight -
          ADAPTIVE_CONFIG.minPersonalWeight
        ) * strength
      : 0;

    const remaining = 1 - personalWeight;

    return {
      active,
      type,
      model,
      available,
      selected,
      effective,
      selectivity,
      rawWeights,
      normalizedWeights,
      strength,
      scoreWeights: {
        preferences: personalWeight,
        quality: remaining * 2 / 3,
        popularity: remaining / 3
      }
    };
  }

  function resolvePreferenceProfile(
    preferences,
    type,
    model,
    profile
  ) {
    if (profile) {
      if (profile.type !== type ||
          profile.model !== model) {
        throw new Error("Preference profile mismatch");
      }

      return profile;
    }

    return buildPreferenceProfile(
      preferences, type, model
    );
  }

  function evaluatePreferences(
    item,
    preferences,
    type = "movie",
    model = DEFAULT_MODEL,
    profile
  ) {
    const adaptive = resolvePreferenceProfile(
      preferences, type, model, profile
    );

    const weights = adaptive.normalizedWeights;

    preferences = adaptive.effective;

    if (!weights) {
      throw new Error("Unknown recommendation model");
    }

    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    if (!item || !adaptive.active) {
      return {
        active: false,
        eligible: false,
        score: 0,
        matched: {
          genres: false,
          countries: false,
          decades: false
        }
      };
    }

    const genres = selectedGenres(
      preferences.genres || [], type
    );

    const countries = preferences.countries || [];
    const decades = preferences.decades || [];

    const itemGenres = normalizeGenres(item);
    const itemCountries = normalizeCountries(item);
    const itemDecade = normalizeDecade(item, type);

    const matched = {
      genres: genres.some(
        id => itemGenres.includes(id)
      ),
      countries: countries.some(
        code => itemCountries.includes(code)
      ),
      decades: itemDecade !== null &&
        decades.includes(itemDecade)
    };

    const selected = {
      genres: genres.length > 0,
      countries: countries.length > 0,
      decades: decades.length > 0
    };

    let availableWeight = 0;
    let matchedWeight = 0;

    for (const key of Object.keys(weights)) {
      if (!selected[key]) continue;

      availableWeight += weights[key];

      if (matched[key]) {
        matchedWeight += weights[key];
      }
    }

    const score = availableWeight
      ? matchedWeight / availableWeight * 100
      : 0;

    return {
      active: true,
      eligible: matchedWeight > 0,
      score,
      matched
    };
  }

  const SCORE_WEIGHTS = Object.freeze({
    preferences: 0.70,
    quality: 0.20,
    popularity: 0.10
  });

  function evaluate(
    item,
    preferences,
    type = "movie",
    model = DEFAULT_MODEL,
    profile
  ) {
    const adaptive = resolvePreferenceProfile(
      preferences, type, model, profile
    );

    const personal = evaluatePreferences(
      item, preferences, type, model, adaptive
    );

    const quality = evaluateQuality(item, type);
    const popularity = evaluatePopularity(item, type);

    const components = {
      preferences:
        personal.score * adaptive.scoreWeights.preferences,
      quality:
        quality.score * adaptive.scoreWeights.quality,
      popularity:
        popularity.score * adaptive.scoreWeights.popularity
    };

    const total = personal.eligible
      ? Math.min(100, Math.max(0,
          components.preferences +
          components.quality +
          components.popularity
        ))
      : 0;

    return {
      active: personal.active,
      eligible: personal.eligible,
      score: total,
      model,
      type,
      personal,
      quality,
      popularity,
      components,
      scoreWeights: adaptive.scoreWeights
    };
  }

  function rank(
    items,
    preferences,
    type = "movie",
    model = DEFAULT_MODEL,
    profile
  ) {
    const adaptive = resolvePreferenceProfile(
      preferences, type, model, profile
    );

    if (!Array.isArray(items) ||
        !adaptive.active) {
      return [];
    }

    return items
      .map((item, index) => ({
        item,
        index,
        evaluation: evaluate(
          item, preferences, type, model, adaptive
        )
      }))
      .filter(row => row.evaluation.eligible)
      .sort((a, b) =>
        b.evaluation.score - a.evaluation.score ||
        b.evaluation.personal.score -
          a.evaluation.personal.score ||
        b.evaluation.quality.score -
          a.evaluation.quality.score ||
        a.index - b.index
      )
      .map(row => ({
        item: row.item,
        evaluation: row.evaluation
      }));
  }

  const SEARCH_CONFIG = Object.freeze({
    movie: Object.freeze({
      minRating: 6.5,
      minVotes: 30
    }),
    tv: Object.freeze({
      minRating: 6.5,
      minVotes: 20
    }),
    maxQueries: 12,
    concurrency: 4
  });

  function decadeRange(decade, today) {
    if (decade === 0) {
      return {
        from: "0001-01-01",
        to: "1949-12-31"
      };
    }

    const from = String(decade) + "-01-01";
    const end = String(decade + 9) + "-12-31";

    if (from > today) return null;

    return {
      from,
      to: end < today ? end : today
    };
  }

  function buildQueries(
    preferences,
    type = "movie",
    today = new Date().toISOString().slice(0, 10),
    profile
  ) {
    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    const adaptive = resolvePreferenceProfile(
      preferences, type,
      profile?.model || DEFAULT_MODEL,
      profile
    );

    if (!adaptive.active) return [];

    preferences = adaptive.effective;

    const config = SEARCH_CONFIG[type];

    const genres = selectedGenres(
      preferences.genres || [], type
    );

    const usableGenres = genres;

    const countries = unique(
      preferences.countries || []
    );

    const decades = unique(
      preferences.decades || []
    ).filter(value =>
      value === 0 ||
      (
        Number.isInteger(value) &&
        value >= 1950 &&
        value % 10 === 0
      )
    );

    const ranges = decades
      .map(value => decadeRange(value, today))
      .filter(Boolean);

    const dateField = type === "tv"
      ? "first_air_date"
      : "primary_release_date";

    const base = {
      include_adult: "false",
      sort_by: "popularity.desc",
      "vote_average.gte": config.minRating,
      "vote_count.gte": config.minVotes,
      [dateField + ".lte"]: today,
      page: 1
    };

    if (type === "tv") {
      base.include_null_first_air_dates = "false";
    }

    const combinations = [
      ["genres", "countries", "decades"],
      ["genres", "countries"],
      ["genres", "decades"],
      ["countries", "decades"],
      ["genres"],
      ["countries"],
      ["decades"]
    ];

    const available = {
      genres: usableGenres.length > 0,
      countries: countries.length > 0,
      decades: ranges.length > 0
    };

    const groups = [];

    for (const combination of combinations) {
      if (!combination.every(key => available[key])) {
        continue;
      }

      const params = {...base};

      if (combination.includes("genres")) {
        params.with_genres = usableGenres.join("|");
      }

      if (combination.includes("countries")) {
        params.with_origin_country = countries.join("|");
      }

      const group = [];

      if (combination.includes("decades")) {
        for (const range of ranges) {
          group.push({
            ...params,
            [dateField + ".gte"]: range.from,
            [dateField + ".lte"]: range.to
          });
        }
      } else {
        group.push(params);
      }

      groups.push(group);
    }

    const queries = [];
    const seen = new Set();

    let round = 0;

    while (queries.length < SEARCH_CONFIG.maxQueries) {
      let found = false;

      for (const group of groups) {
        const params = group[round];

        if (!params) continue;

        found = true;

        const key = JSON.stringify(params);

        if (seen.has(key)) continue;

        seen.add(key);

        queries.push({
          endpoint: "discover/" + type,
          params
        });

        if (queries.length >= SEARCH_CONFIG.maxQueries) {
          break;
        }
      }

      if (!found) break;

      round++;
    }

    return queries;
  }

  async function fetchCandidates(
    preferences,
    type = "movie",
    options = {}
  ) {
    const queries = buildQueries(
      preferences, type,
      options.today, options.profile
    );

    if (!queries.length) {
      return {
        items: [],
        errors: [],
        requested: 0,
        succeeded: 0,
        received: 0,
        duplicates: 0,
        rejected: 0
      };
    }

    if (typeof options.request !== "function") {
      throw new Error("Missing TMDB request function");
    }

    const responses = new Array(queries.length);

    let cursor = 0;

    async function worker() {
      while (cursor < queries.length) {
        const index = cursor++;
        const query = queries[index];

        try {
          const result = await options.request(
            query.endpoint,
            {
              ...query.params,
              language: options.language || "ru-RU"
            }
          );

          if (!Array.isArray(result?.results)) {
            throw new Error("Invalid TMDB results");
          }

          responses[index] = {
            items: result.results
          };

        } catch (error) {
          responses[index] = {
            error: String(
              error?.message || error
            )
          };
        }
      }
    }

    await Promise.all(
      Array.from(
        {
          length: Math.min(
            SEARCH_CONFIG.concurrency,
            queries.length
          )
        },
        () => worker()
      )
    );

    const candidates = new Map();
    const errors = [];

    let succeeded = 0;
    let received = 0;
    let duplicates = 0;
    let rejected = 0;

    for (let index = 0;
         index < responses.length;
         index++) {

      const response = responses[index];

      if (response.error) {
        errors.push({
          index,
          query: queries[index],
          message: response.error
        });

        continue;
      }

      succeeded++;

      for (const raw of response.items) {
        received++;

        if (!raw ||
            !Number.isSafeInteger(Number(raw.id)) ||
            Number(raw.id) <= 0 ||
            raw.adult === true) {
          rejected++;
          continue;
        }

        let item;

        try {
          item = typeof options.normalize === "function"
            ? options.normalize({...raw}, type)
            : {...raw};

          if (!item ||
              !Number.isSafeInteger(Number(item.id)) ||
              Number(item.id) <= 0 ||
              item.adult === true ||
              (
                typeof options.allows === "function" &&
                !options.allows(item)
              )) {
            rejected++;
            continue;
          }

        } catch (error) {
          rejected++;
          continue;
        }

        const key = String(item.id);

        const params = queries[index].params;

        const source = {
          genres: Boolean(params.with_genres),
          countries: Boolean(params.with_origin_country),
          decades: Boolean(
            params["primary_release_date.gte"] ||
            params["first_air_date.gte"]
          )
        };

        source.fullMatch =
          source.genres &&
          source.countries &&
          source.decades;

        if (candidates.has(key)) {
          duplicates++;

          const existing = candidates.get(key);
          const previous = existing._kgRecommendationSource;

          existing._kgRecommendationSource = {
            genres: previous.genres || source.genres,
            countries: previous.countries || source.countries,
            decades: previous.decades || source.decades,
            fullMatch: previous.fullMatch || source.fullMatch
          };

          continue;
        }

        candidates.set(key, {
          ...item,
          _kgRecommendationSource: source
        });
      }
    }

    return {
      items: [...candidates.values()],
      errors,
      requested: queries.length,
      succeeded,
      received,
      duplicates,
      rejected
    };
  }

  const COUNTRY_CONFIG = Object.freeze({
    maxCandidates: 40,
    concurrency: 4
  });

  async function enrichCountries(
    items,
    preferences,
    type = "movie",
    options = {}
  ) {
    const source = Array.isArray(items)
      ? items
      : [];

    const result = {
      items: source.map(item => ({...item})),
      requested: 0,
      succeeded: 0,
      failed: 0,
      known: 0,
      remaining: 0,
      errors: []
    };

    const model = options.model || DEFAULT_MODEL;

    const adaptive = resolvePreferenceProfile(
      preferences, type, model, options.profile
    );

    preferences = adaptive.effective;

    if (!adaptive.active ||
        type !== "movie" ||
        !preferences.countries?.length) {
      return result;
    }

    const country = preferences.countries[0];

    const candidates = [];

    for (let index = 0;
         index < result.items.length;
         index++) {

      const item = result.items[index];

      if (!Number.isSafeInteger(Number(item.id)) ||
          Number(item.id) <= 0) {
        continue;
      }

      if (normalizeCountries(item).length) {
        result.known++;
        continue;
      }

      const potential = evaluate(
        {
          ...item,
          _homeProductionCountries: [country]
        },
        preferences,
        type,
        model,
        adaptive
      );

      candidates.push({
        index,
        score: potential.score
      });
    }

    candidates.sort((a, b) =>
      b.score - a.score ||
      a.index - b.index
    );

    const limit = COUNTRY_CONFIG.maxCandidates;
    const fullQuota = Math.floor(limit * 0.30);
    const countryQuota = Math.floor(limit * 0.30);

    const selected = [];
    const selectedIndexes = new Set();

    function takeCandidates(predicate, quota) {
      let added = 0;

      for (const candidate of candidates) {
        if (added >= quota ||
            selected.length >= limit) {
          break;
        }

        if (selectedIndexes.has(candidate.index)) {
          continue;
        }

        const item = result.items[candidate.index];
        const source = item._kgRecommendationSource;

        if (!predicate(source)) {
          continue;
        }

        selected.push(candidate);
        selectedIndexes.add(candidate.index);
        added++;
      }

      return added;
    }

    const fullAdded = takeCandidates(
      source => source?.fullMatch === true,
      fullQuota
    );

    takeCandidates(
      source => source?.countries === true,
      countryQuota + fullQuota - fullAdded
    );

    takeCandidates(
      () => true,
      limit - selected.length
    );

    result.remaining =
      candidates.length - selected.length;

    if (!selected.length) return result;

    if (typeof options.loadCountries !== "function") {
      throw new Error("Missing country loader");
    }

    let cursor = 0;

    async function worker() {
      while (cursor < selected.length) {
        const position = cursor++;
        const candidate = selected[position];
        const item = result.items[candidate.index];

        result.requested++;

        try {
          const countries =
            await options.loadCountries(item.id);

          if (!Array.isArray(countries)) {
            throw new Error("Invalid country metadata");
          }

          const normalized = unique(
            countries
              .filter(code =>
                typeof code === "string" &&
                /^[a-z]{2}$/i.test(code)
              )
              .map(code => code.toUpperCase())
          );

          result.items[candidate.index] = {
            ...item,
            _homeProductionCountries: normalized
          };

          result.succeeded++;

        } catch (error) {
          result.failed++;

          result.errors.push({
            id: item.id,
            message: String(
              error?.message || error
            )
          });
        }
      }
    }

    await Promise.all(
      Array.from(
        {
          length: Math.min(
            COUNTRY_CONFIG.concurrency,
            selected.length
          )
        },
        () => worker()
      )
    );

    return result;
  }

  function isValidReleaseDate(value) {
    if (typeof value !== "string" ||
        !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
      return false;
    }

    if (value.startsWith("0000")) {
      return false;
    }

    const date = new Date(value + "T00:00:00Z");

    return Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;
  }

  function filterCandidates(
    items,
    type = "movie",
    options = {}
  ) {
    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    const today = options.today ||
      new Date().toISOString().slice(0, 10);

    if (!isValidReleaseDate(today)) {
      throw new Error("Invalid current date");
    }

    const config = SEARCH_CONFIG[type];

    const result = {
      items: [],
      received: 0,
      accepted: 0,
      rejected: {
        invalid: 0,
        restricted: 0,
        invalidDate: 0,
        future: 0,
        lowRating: 0,
        lowVotes: 0,
        watched: 0
      }
    };

    if (!Array.isArray(items)) {
      return result;
    }

    if (options.hideWatched === true &&
        typeof options.isWatched !== "function") {
      throw new Error("Missing watched checker");
    }

    for (const item of items) {
      result.received++;

      if (!item ||
          !Number.isSafeInteger(Number(item.id)) ||
          Number(item.id) <= 0) {
        result.rejected.invalid++;
        continue;
      }

      if (item.adult === true ||
          (
            typeof options.allows === "function" &&
            !options.allows(item)
          )) {
        result.rejected.restricted++;
        continue;
      }

      const date = type === "tv"
        ? item.first_air_date
        : item.release_date;

      if (!isValidReleaseDate(date)) {
        result.rejected.invalidDate++;
        continue;
      }

      if (date > today) {
        result.rejected.future++;
        continue;
      }

      const rating = Number(item.vote_average);
      const votes = Number(item.vote_count);

      if (!Number.isFinite(rating) ||
          rating < config.minRating ||
          rating > 10) {
        result.rejected.lowRating++;
        continue;
      }

      if (!Number.isSafeInteger(votes) ||
          votes < config.minVotes) {
        result.rejected.lowVotes++;
        continue;
      }

      if (options.hideWatched === true &&
          options.isWatched(item.id)) {
        result.rejected.watched++;
        continue;
      }

      result.items.push(item);
      result.accepted++;
    }

    return result;
  }

  async function getRecommendations(
    preferences,
    type = "movie",
    options = {}
  ) {
    if (type !== "movie" && type !== "tv") {
      throw new Error("Unknown media type");
    }

    const model = options.model || DEFAULT_MODEL;

    if (!MODELS[model]) {
      throw new Error("Unknown recommendation model");
    }

    const profile = buildPreferenceProfile(
      preferences,
      type,
      model,
      options.availableOptions
    );

    const result = {
      active: profile.active,
      type,
      model,
      status: "inactive",
      items: [],
      ranked: [],
      diversified: [],
      stats: {
        personalization: {
          strength: profile.strength,
          selectivity: profile.selectivity,
          categoryWeights: profile.normalizedWeights,
          scoreWeights: profile.scoreWeights
        },
        loading: null,
        filtering: null,
        countries: null,
        ranked: 0,
        unmatched: 0,
        diversity: {
          enabled: options.diversity !== false,
          applied: false,
          reordered: 0
        }
      }
    };

    if (!result.active) {
      return result;
    }

    const today = options.today ||
      new Date().toISOString().slice(0, 10);

    if (!isValidReleaseDate(today)) {
      throw new Error("Invalid current date");
    }

    if (options.hideWatched === true &&
        typeof options.isWatched !== "function") {
      throw new Error("Missing watched checker");
    }

    const snapshot = profile.effective;

    const loaded = await fetchCandidates(
      snapshot,
      type,
      {
        today,
        profile,
        language: options.language,
        request: options.request,
        normalize: options.normalize,
        allows: options.allows
      }
    );

    const {
      items: loadedItems,
      ...loadingStats
    } = loaded;

    result.stats.loading = loadingStats;

    if (loaded.requested > 0 &&
        loaded.succeeded === 0) {
      result.status = "unavailable";
      return result;
    }

    const filtered = filterCandidates(
      loadedItems,
      type,
      {
        today,
        hideWatched: options.hideWatched,
        isWatched: options.isWatched,
        allows: options.allows
      }
    );

    const {
      items: filteredItems,
      ...filteringStats
    } = filtered;

    result.stats.filtering = filteringStats;

    const enriched = await enrichCountries(
      filteredItems,
      snapshot,
      type,
      {
        model,
        profile,
        loadCountries: options.loadCountries
      }
    );

    const {
      items: enrichedItems,
      ...countryStats
    } = enriched;

    result.stats.countries = countryStats;

    const ranked = rank(
      enrichedItems,
      snapshot,
      type,
      model,
      profile
    );

    const diversityEnabled =
      options.diversity !== false;

    const diversified = diversityEnabled
      ? diversify(
          ranked,
          snapshot,
          type,
          {
            profile,
            getFranchise: options.getFranchise
          }
        )
      : ranked.slice();

    result.ranked = ranked;
    result.diversified = diversified;

    result.items = diversified.map(
      row => row.item
    );

    result.stats.diversity = {
      enabled: diversityEnabled,
      applied: diversityEnabled &&
        ranked.length > 1,
      reordered: diversified.reduce(
        (count, row, index) =>
          count + (row !== ranked[index] ? 1 : 0),
        0
      )
    };

    result.stats.ranked = ranked.length;

    result.stats.unmatched =
      enrichedItems.length - ranked.length;

    const incomplete =
      loaded.errors.length > 0 ||
      enriched.failed > 0 ||
      enriched.remaining > 0;

    if (incomplete) {
      result.status = "partial";
    } else if (result.items.length === 0) {
      result.status = "empty";
    } else {
      result.status = "ready";
    }

    return result;
  }

  const DIVERSITY_CONFIG = Object.freeze({
    windowSize: 12,
    maxPerFranchise: 2,
    franchisePenalty: 8,
    genrePenalty: 3,
    countryPenalty: 2,
    decadePenalty: 1,
    maxScoreGap: 10
  });

  function diversify(
    ranked,
    preferences,
    type = "movie",
    options = {}
  ) {
    if (!Array.isArray(ranked)) return [];

    const adaptive = resolvePreferenceProfile(
      preferences, type,
      options.profile?.model || DEFAULT_MODEL,
      options.profile
    );

    preferences = adaptive.effective;

    if (!adaptive.active ||
        ranked.length < 2) {
      return ranked.slice();
    }

    const config = DIVERSITY_CONFIG;

    const genres = selectedGenres(
      preferences.genres || [], type
    );

    const countries = unique(
      preferences.countries || []
    );

    const decades = unique(
      preferences.decades || []
    );

    const counts = {
      franchises: new Map(),
      genres: new Map(),
      countries: new Map(),
      decades: new Map()
    };

    function franchiseOf(item) {
      if (type !== "movie") return null;

      let value = item.belongs_to_collection?.id;

      if (value == null &&
          typeof options.getFranchise === "function") {
        value = options.getFranchise(item.id);
      }

      const id = Number(value);

      return Number.isSafeInteger(id) && id > 0
        ? id
        : null;
    }

    function increment(map, key) {
      map.set(key, (map.get(key) || 0) + 1);
    }

    function repetition(map, values, weight) {
      if (!values.length) return 0;

      const minimum = Math.min(
        ...values.map(value => map.get(value) || 0)
      );

      return Math.min(1, minimum) * weight;
    }

    const remaining = ranked.map((row, index) => ({
      row,
      index,
      franchise: franchiseOf(row.item),
      genres: normalizeGenres(row.item)
        .filter(id => genres.includes(id)),
      countries: normalizeCountries(row.item)
        .filter(code => countries.includes(code)),
      decades: [normalizeDecade(row.item, type)]
        .filter(value =>
          value !== null && decades.includes(value)
        )
    }));

    const output = [];

    function select(index) {
      const candidate = remaining.splice(index, 1)[0];

      output.push(candidate.row);

      if (candidate.franchise !== null) {
        increment(
          counts.franchises,
          candidate.franchise
        );
      }

      for (const key of [
        "genres", "countries", "decades"
      ]) {
        for (const value of candidate[key]) {
          increment(counts[key], value);
        }
      }
    }

    function adjusted(candidate) {
      let penalty = 0;

      if (candidate.franchise !== null &&
          counts.franchises.get(candidate.franchise)) {
        penalty += config.franchisePenalty;
      }

      if (genres.length > 1) {
        penalty += repetition(
          counts.genres,
          candidate.genres,
          config.genrePenalty
        );
      }

      if (countries.length > 1) {
        penalty += repetition(
          counts.countries,
          candidate.countries,
          config.countryPenalty
        );
      }

      if (decades.length > 1) {
        penalty += repetition(
          counts.decades,
          candidate.decades,
          config.decadePenalty
        );
      }

      return candidate.row.evaluation.score - penalty;
    }

    // Preserve the highest-ranked recommendation.
    select(0);

    while (remaining.length &&
           output.length < config.windowSize) {

      const bestScore = Math.max(
        ...remaining.map(
          candidate => candidate.row.evaluation.score
        )
      );

      const competitive = remaining.filter(
        candidate =>
          candidate.row.evaluation.score >=
          bestScore - config.maxScoreGap
      );

      const preferred = competitive.filter(
        candidate =>
          candidate.franchise === null ||
          (counts.franchises.get(
            candidate.franchise
          ) || 0) < config.maxPerFranchise
      );

      // Relax franchise limits if no competitive
      // alternatives remain.
      const pool = preferred.length
        ? preferred
        : competitive;

      let best = pool[0];

      for (const candidate of pool) {
        const score = adjusted(candidate);
        const bestAdjusted = adjusted(best);

        if (score > bestAdjusted ||
            (
              score === bestAdjusted &&
              candidate.index < best.index
            )) {
          best = candidate;
        }
      }

      select(remaining.indexOf(best));
    }

    // Preserve the original order outside the
    // first recommendation window.
    return [
      ...output,
      ...remaining.map(candidate => candidate.row)
    ];
  }

  window.KGPersonalRecommendations = Object.freeze({
    MODELS,
    DEFAULT_MODEL,
    isActive,
    isActiveForType,
    TV_GENRE_IDS,
    selectedGenres,
    ADAPTIVE_CONFIG,
    calculateSelectivity,
    buildPreferenceProfile,
    evaluatePreferences,
    QUALITY_CONFIG,
    evaluateQuality,
    POPULARITY_CONFIG,
    evaluatePopularity,
    SCORE_WEIGHTS,
    evaluate,
    rank,
    SEARCH_CONFIG,
    buildQueries,
    fetchCandidates,
    COUNTRY_CONFIG,
    enrichCountries,
    isValidReleaseDate,
    filterCandidates,
    getRecommendations,
    DIVERSITY_CONFIG,
    diversify
  });
})();
