"use strict";

const fs = require("node:fs");
const path = require("node:path");

const FIXTURE_DIR = path.resolve(
    __dirname, "../fixtures/tmdb"
);

const DATASETS = Object.freeze({
    movies: "movies.json",
    series: "series.json",
    seasons: "seasons.json",
    episodes: "episodes.json",
    people: "people.json",
    providers: "providers.json",
    lists: "lists.json",
    scenarios: "scenarios.json"
});

function invariant(condition, message) {
    if (!condition) {
        throw new Error("TMDB fixture: " + message);
    }
}

function readJSON(name) {
    const file = path.join(FIXTURE_DIR, name);

    invariant(
        fs.lstatSync(file).isFile(),
        "invalid fixture file " + name
    );

    return JSON.parse(
        fs.readFileSync(file, "utf8")
    );
}

function clone(value) {
    return value === undefined
        ? null
        : structuredClone(value);
}

function array(value, label) {
    invariant(Array.isArray(value), label + " must be an array");
    return value;
}

function uniqueIndex(rows, key, label) {
    const result = new Map();

    for (const row of array(rows, label)) {
        const id = key(row);

        invariant(
            id !== undefined && id !== null && id !== "",
            label + ": missing key"
        );

        invariant(
            !result.has(id),
            label + ": duplicate key " + id
        );

        result.set(id, row);
    }

    return result;
}

function groupIndex(rows, key) {
    const result = new Map();

    for (const row of rows) {
        const id = key(row);

        if (!result.has(id)) {
            result.set(id, []);
        }

        result.get(id).push(row);
    }

    return result;
}

function loadCatalog() {
    const manifest = readJSON("manifest.json");

    invariant(
        manifest.schemaVersion === 1,
        "unsupported schema version"
    );

    invariant(
        manifest.synthetic === true,
        "catalog must be synthetic"
    );

    invariant(
        manifest.networkPolicy?.allowRealTMDB === false
        && manifest.networkPolicy?.allowExternalNetwork === false
        && manifest.networkPolicy?.unknownEndpoint === "fail",
        "invalid network policy"
    );

    invariant(
        Object.keys(manifest.datasets || {}).length
            === Object.keys(DATASETS).length,
        "unexpected dataset count"
    );

    const data = {};

    for (const [key, file] of Object.entries(DATASETS)) {
        invariant(
            manifest.datasets[key] === file,
            "invalid dataset path " + key
        );

        const item = readJSON(file);

        invariant(
            item.schemaVersion === manifest.schemaVersion,
            "schema mismatch " + key
        );

        invariant(
            item.synthetic === true,
            "non-synthetic dataset " + key
        );

        invariant(
            item.referenceDate === manifest.referenceDate,
            "reference date mismatch " + key
        );

        data[key] = item;
    }

    const entities = {
        movie: data.movies.movies,
        tv: data.series.series,
        season: data.seasons.seasons,
        episode: data.episodes.episodes,
        person: data.people.people
    };

    const entityIndexes = new Map();

    for (const [kind, rows] of Object.entries(entities)) {
        const index = uniqueIndex(
            rows, row => row.id, kind
        );

        for (const row of rows) {
            invariant(
                Number.isSafeInteger(row.id) && row.id > 0,
                kind + ": invalid ID"
            );

            invariant(
                row.details?.id === row.id,
                kind + ": detail ID mismatch"
            );

            invariant(
                row.localized?.[manifest.defaultLocale]
                && row.localized?.[manifest.fallbackLocale],
                kind + ": missing localization"
            );
        }

        entityIndexes.set(kind, index);
    }

    function entityExists(kind, id) {
        return entityIndexes.get(kind)?.has(id) === true;
    }

    const tvByAppId = uniqueIndex(
        entities.tv, row => row.appId, "application TV IDs"
    );

    const seasonByNumber = uniqueIndex(
        entities.season,
        row => `${row.tvId}:${row.seasonNumber}`,
        "TV season numbers"
    );

    const episodeByNumber = uniqueIndex(
        entities.episode,
        row => `${row.tvId}:${row.seasonNumber}:${row.episodeNumber}`,
        "TV episode numbers"
    );

    const seasonsByTv = groupIndex(
        entities.season, row => row.tvId
    );

    const episodesBySeason = groupIndex(
        entities.episode, row => row.seasonId
    );

    for (const row of entities.tv) {
        invariant(
            row.appId === manifest.seriesIdOffset + row.id,
            "invalid application TV ID"
        );
    }

    for (const row of entities.season) {
        invariant(
            entityExists("tv", row.tvId),
            "unknown season parent"
        );

        invariant(
            row.appTvId === manifest.seriesIdOffset + row.tvId,
            "invalid season application TV ID"
        );

        const episodes = episodesBySeason.get(row.id) || [];

        invariant(
            episodes.length === row.episodeCount,
            "season episode count mismatch"
        );

        const ids = new Set(episodes.map(e => e.id));

        invariant(
            row.episodeRefs.length === ids.size
            && new Set(row.episodeRefs.map(r => r.id)).size === ids.size
            && row.episodeRefs.every(r =>
                ids.has(r.id)
                && entityIndexes.get("episode").get(r.id)
                    .episodeNumber === r.episode_number
            ),
            "invalid season episode references"
        );
    }

    for (const row of entities.episode) {
        const parent = entityIndexes.get("season")
            .get(row.seasonId);

        invariant(
            parent
            && parent.tvId === row.tvId
            && parent.seasonNumber === row.seasonNumber,
            "invalid episode parent"
        );

        invariant(
            row.appTvId === manifest.seriesIdOffset + row.tvId,
            "invalid episode application TV ID"
        );
    }

    const credits = [];

    for (const person of entities.person) {
        for (const credit of array(person.credits, "credits")) {
            invariant(
                ["movie", "tv"].includes(credit.mediaType)
                && entityExists(credit.mediaType, credit.mediaId),
                "unknown credit media"
            );

            if (["guest", "episodeCrew"].includes(credit.kind)) {
                const episode = entityIndexes.get("episode")
                    .get(credit.episodeId);

                invariant(
                    episode
                    && episode.tvId === credit.mediaId
                    && episode.seasonNumber === credit.seasonNumber
                    && episode.episodeNumber === credit.episodeNumber,
                    "invalid episode credit"
                );
            }

            credits.push({
                ...credit,
                personId: person.id
            });
        }
    }

    const creditById = uniqueIndex(
        credits, row => row.creditId, "credit IDs"
    );

    const creditsByPerson = groupIndex(
        credits, row => row.personId
    );

    const creditsByMedia = groupIndex(
        credits, row => `${row.mediaType}:${row.mediaId}`
    );

    const creditsByEpisode = groupIndex(
        credits.filter(row => row.episodeId !== undefined),
        row => row.episodeId
    );

    const providerData = data.providers;

    const regions = uniqueIndex(
        providerData.regions,
        row => row.iso_3166_1,
        "regions"
    );

    const networks = uniqueIndex(
        providerData.networks,
        row => row.details.id,
        "networks"
    );

    const providers = uniqueIndex(
        providerData.providers,
        row => row.details.provider_id,
        "providers"
    );

    const networksByTv = uniqueIndex(
        providerData.networkRelationships,
        row => row.tvId,
        "TV network relationships"
    );

    const availability = uniqueIndex(
        providerData.availability,
        row => `${row.mediaType}:${row.mediaId}`,
        "availability"
    );

    invariant(
        regions.has(manifest.defaultRegion),
        "unknown default region"
    );

    invariant(
        networksByTv.size === entities.tv.length,
        "incomplete network relationships"
    );

    for (const row of networksByTv.values()) {
        invariant(
            entityExists("tv", row.tvId)
            && row.networkIds.every(id => networks.has(id)),
            "invalid network relationship"
        );
    }

    invariant(
        availability.size
            === entities.movie.length + entities.tv.length,
        "incomplete availability"
    );

    for (const row of availability.values()) {
        invariant(
            ["movie", "tv"].includes(row.mediaType)
            && entityExists(row.mediaType, row.mediaId),
            "invalid availability media"
        );

        for (const [region, groups] of Object.entries(row.regions)) {
            invariant(regions.has(region), "unknown region");

            for (const [type, ids] of Object.entries(groups)) {
                invariant(
                    providerData.monetizationTypes.includes(type),
                    "unknown monetization type"
                );

                for (const id of array(ids, "provider references")) {
                    const provider = providers.get(id);

                    invariant(
                        provider
                        && provider.regions.includes(region)
                        && provider.mediaTypes.includes(row.mediaType),
                        "invalid provider relationship"
                    );
                }
            }
        }
    }

    const lists = uniqueIndex(
        data.lists.lists, row => row.id, "API lists"
    );

    const localGroups = uniqueIndex(
        data.lists.localGroups, row => row.id, "local groups"
    );

    const aliases = uniqueIndex(
        data.lists.oscarFallbackAliases,
        row => row.requestedId,
        "Oscar aliases"
    );

    for (const row of [...lists.values(), ...localGroups.values()]) {
        invariant(
            row.items.every(ref =>
                entityExists(ref.media_type, ref.id)
            ),
            "invalid list reference"
        );
    }

    for (const row of aliases.values()) {
        invariant(
            entityExists(row.media_type, row.fixtureId),
            "invalid Oscar alias"
        );
    }

    const scenarios = uniqueIndex(
        data.scenarios.scenarios,
        row => row.id,
        "scenarios"
    );

    for (const row of scenarios.values()) {
        invariant(
            row.references.every(ref =>
                entityExists(ref.media_type, ref.id)
            ),
            "invalid scenario reference"
        );
    }

    const indexes = new Map([
        ["tvByAppId", tvByAppId],
        ["seasonByNumber", seasonByNumber],
        ["episodeByNumber", episodeByNumber],
        ["seasonsByTv", seasonsByTv],
        ["episodesBySeason", episodesBySeason],
        ["creditById", creditById],
        ["creditsByPerson", creditsByPerson],
        ["creditsByMedia", creditsByMedia],
        ["creditsByEpisode", creditsByEpisode],
        ["regions", regions],
        ["networks", networks],
        ["providers", providers],
        ["networksByTv", networksByTv],
        ["availability", availability],
        ["lists", lists],
        ["localGroups", localGroups],
        ["oscarAliases", aliases],
        ["scenarios", scenarios]
    ]);

    function getEntity(kind, id) {
        return clone(entityIndexes.get(kind)?.get(id));
    }


    function describeInvalidArgument(value) {
        try {
            return String(value);
        } catch {
            return "<unprintable>";
        }
    }

    function resolveDetailsLanguage(options) {
        if (options === undefined) return "ru-RU";

        if (
            options === null ||
            typeof options !== "object" ||
            Array.isArray(options) ||
            (Object.getPrototypeOf(options) !== Object.prototype &&
             Object.getPrototypeOf(options) !== null)
        ) {
            throw new TypeError("Invalid details options");
        }

        const keys = Reflect.ownKeys(options);

        if (keys.some(key => key !== "language")) {
            throw new TypeError("Unsupported details option");
        }

        if (!Object.hasOwn(options, "language")) {
            return "ru-RU";
        }

        const language = options.language;

        if (
            typeof language !== "string" ||
            language.length !== 5 ||
            !/^[A-Za-z]{2}-[A-Za-z]{2}$/.test(language)
        ) {
            throw new TypeError("Invalid details language");
        }

        const [lang, region] = language.split("-");
        const normalized =
            lang.toLowerCase() + "-" + region.toUpperCase();

        if (normalized !== "ru-RU" && normalized !== "en-US") {
            throw new RangeError("Unsupported details language: " + normalized);
        }

        return normalized;
    }


    const movieNested = readJSON(
        "localization/nested.json"
    );

    invariant(
        movieNested.schemaVersion === 1 &&
        movieNested.synthetic === true &&
        movieNested.kind === "nested-localization",
        "invalid nested localization dataset"
    );

    const nestedIndexes = new Map();

    for (const mediaType of ["movie", "tv"]) {
        const indexes = new Map();

        for (const group of [
            "genreCountry",
            "companyLanguage",
            "collectionNetwork",
            "credits"
        ]) {
            const rows = array(
                movieNested.groups[group],
                "nested " + group
            ).filter(row => row.mediaType === mediaType);

            const index = uniqueIndex(
                rows, row => row.id,
                mediaType + " nested " + group
            );

            invariant(
                index.size === entities[mediaType].length &&
                entities[mediaType].every(
                    row => index.has(row.id)
                ),
                "incomplete " + mediaType + " nested " + group
            );

            indexes.set(group, index);
        }

        nestedIndexes.set(mediaType, indexes);
    }

    function applyDetailsNested(mediaType, details, id, language) {
        const specs = [
            ["genreCountry", "genres", "id", ["name"]],
            ["genreCountry", "production_countries",
                "iso_3166_1", ["name"]],
            ["companyLanguage", "production_companies",
                "id", ["name"]],
            ["companyLanguage", "spoken_languages",
                "iso_639_1", ["name"]],
            mediaType === "movie"
                ? ["collectionNetwork", "belongs_to_collection",
                    "id", ["name", "poster_path", "backdrop_path"]]
                : ["collectionNetwork", "networks",
                    "id", ["name"]]
        ];

        function object(value) {
            return value !== null &&
                typeof value === "object" &&
                !Array.isArray(value);
        }

        function applyRow(source, patch, key, allowed, label) {
            invariant(
                object(source) &&
                object(patch) &&
                object(patch.identity) &&
                object(patch.values),
                label + ": invalid patch"
            );

            invariant(
                Object.keys(patch.identity).length === 1 &&
                Object.hasOwn(patch.identity, key) &&
                Object.hasOwn(source, key) &&
                patch.identity[key] === source[key],
                label + ": identity mismatch"
            );

            const result = clone(source);

            for (const [field, value] of
                Object.entries(patch.values)) {

                invariant(
                    allowed.includes(field),
                    label + ": protected field " + field
                );

                invariant(
                    Object.hasOwn(source, field),
                    label + ": missing source field " + field
                );

                invariant(
                    typeof value === "string" ||
                    (
                        value === null &&
                        (
                            field === "poster_path" ||
                            field === "backdrop_path"
                        )
                    ),
                    label + ": invalid value " + field
                );

                result[field] = clone(value);
            }

            invariant(
                allowed.every(field =>
                    Object.hasOwn(patch.values, field)
                ),
                label + ": incomplete patch"
            );

            return result;
        }

        for (const [group, field, key, allowed] of specs) {
            const label = id + " " + language + " " + field;

            const row = nestedIndexes
                .get(mediaType).get(group).get(id);

            const localized = row.localized?.[language];

            invariant(
                object(localized),
                label + ": missing locale"
            );

            const source = group === "genreCountry"
                ? details
                : row.source;

            invariant(
                object(source),
                label + ": missing source"
            );

            if (!Object.hasOwn(source, field)) {
                invariant(
                    !Object.hasOwn(localized, field),
                    label + ": unexpected patch"
                );

                continue;
            }

            invariant(
                Object.hasOwn(localized, field),
                label + ": missing patch"
            );

            const base = source[field];
            const patches = localized[field];

            if (field === "belongs_to_collection") {
                if (base === null) {
                    invariant(
                        patches === null,
                        label + ": invalid null patch"
                    );

                    details[field] = null;
                } else {
                    details[field] = applyRow(
                        base, patches, key, allowed, label
                    );
                }

                continue;
            }

            invariant(
                Array.isArray(base) &&
                Array.isArray(patches),
                label + ": invalid arrays"
            );

            const sourceIndex = uniqueIndex(
                base, item => item[key],
                label + " source"
            );

            const patchIndex = uniqueIndex(
                patches, item => item.identity?.[key],
                label + " patches"
            );

            invariant(
                sourceIndex.size === patchIndex.size,
                label + ": membership mismatch"
            );

            for (const identity of patchIndex.keys()) {
                invariant(
                    sourceIndex.has(identity),
                    label + ": unknown identity"
                );
            }

            details[field] = base.map(item => applyRow(
                item,
                patchIndex.get(item[key]),
                key,
                allowed,
                label
            ));
        }

        return details;
    }


    function resolveMovieAppendOptions(options) {
        if (
            options === undefined ||
            options === null ||
            typeof options !== "object" ||
            Array.isArray(options) ||
            (Object.getPrototypeOf(options) !== Object.prototype &&
             Object.getPrototypeOf(options) !== null)
        ) {
            return {
                language: resolveDetailsLanguage(options),
                languageOptions: options,
                blocks: []
            };
        }

        if (!Object.hasOwn(options, "append_to_response")) {
            return {
                language: resolveDetailsLanguage(options),
                languageOptions: options,
                blocks: []
            };
        }

        if (Reflect.ownKeys(options).some(
            key => key !== "language" &&
                   key !== "append_to_response"
        )) {
            throw new TypeError("Unsupported details option");
        }

        const languageOptions = Object.hasOwn(options, "language")
            ? {language: options.language}
            : undefined;

        const language = resolveDetailsLanguage(languageOptions);

        const raw = options.append_to_response;

        if (typeof raw !== "string") {
            throw new TypeError("Invalid append_to_response");
        }

        if (raw === "") {
            return {language, languageOptions, blocks: []};
        }

        const tokens = raw.split(",");

        if (tokens.length > 20) {
            throw new RangeError("Too many append blocks");
        }

        const allowed = new Set([
            "credits",
            "translations",
            "images",
            "videos",
            "keywords",
            "release_dates"
        ]);

        const blocks = [];

        for (const token of tokens) {
            const block = token.trim();

            if (!block) {
                throw new TypeError("Empty append block");
            }

            if (!allowed.has(block)) {
                throw new RangeError("Unsupported append block: " + block);
            }

            if (!blocks.includes(block)) {
                blocks.push(block);
            }
        }

        return {language, languageOptions, blocks};
    }

    function applyMovieAppend(details, id, append) {
        for (const block of append.blocks) {
            if (block === "credits") {
                const credits = getCredits(
                    "movie", id, append.languageOptions
                );

                delete credits.id;
                details.credits = credits;
            } else if (block === "translations") {
                const dataset = readJSON(
                    "localization/translations.json"
                );

                const row = dataset.entities.find(
                    row => row.mediaType === "movie" &&
                           row.id === id
                );

                invariant(
                    row && Array.isArray(row.translations),
                    "Missing Movie translation source: " + id
                );

                details.translations = {
                    translations: clone(row.translations)
                };
            }
        }

        return details;
    }

    function resolveTVAppendOptions(options) {
        if (
            options === undefined ||
            options === null ||
            typeof options !== "object" ||
            Array.isArray(options) ||
            (Object.getPrototypeOf(options) !== Object.prototype &&
             Object.getPrototypeOf(options) !== null)
        ) {
            return {
                language: resolveDetailsLanguage(options),
                languageOptions: options,
                blocks: []
            };
        }

        if (!Object.hasOwn(options, "append_to_response")) {
            return {
                language: resolveDetailsLanguage(options),
                languageOptions: options,
                blocks: []
            };
        }

        if (Reflect.ownKeys(options).some(
            key => key !== "language" &&
                   key !== "append_to_response"
        )) {
            throw new TypeError("Unsupported details option");
        }

        const languageOptions = Object.hasOwn(options, "language")
            ? {language: options.language}
            : undefined;

        const language = resolveDetailsLanguage(languageOptions);

        const raw = options.append_to_response;

        if (typeof raw !== "string") {
            throw new TypeError("Invalid append_to_response");
        }

        if (raw === "") {
            return {language, languageOptions, blocks: []};
        }

        const tokens = raw.split(",");

        if (tokens.length > 20) {
            throw new RangeError("Too many append blocks");
        }

        const allowed = new Set([
            "credits",
            "translations",
            "images",
            "videos",
            "keywords",
            "aggregate_credits",
            "content_ratings"
        ]);

        const blocks = [];

        for (const token of tokens) {
            const block = token.trim();

            if (!block) {
                throw new TypeError("Empty append block");
            }

            if (!allowed.has(block)) {
                throw new RangeError("Unsupported append block: " + block);
            }

            if (!blocks.includes(block)) {
                blocks.push(block);
            }
        }

        return {language, languageOptions, blocks};
    }

    function applyTVAppend(details, id, append) {
        for (const block of append.blocks) {
            if (block === "credits") {
                const credits = getCredits(
                    "tv", id, append.languageOptions
                );

                delete credits.id;
                details.credits = credits;
            } else if (block === "aggregate_credits") {
                const aggregate = getAggregateCredits(
                    id, append.languageOptions
                );

                delete aggregate.id;
                details.aggregate_credits = aggregate;
            } else if (block === "translations") {
                const dataset = readJSON(
                    "localization/translations.json"
                );

                const row = dataset.entities.find(
                    row => row.mediaType === "tv" &&
                           row.id === id
                );

                invariant(
                    row && Array.isArray(row.translations),
                    "Missing TV translation source: " + id
                );

                details.translations = {
                    translations: clone(row.translations)
                };
            }
        }

        return details;
    }

    function getDetails(mediaType, id, options) {
        if (mediaType !== "movie" && mediaType !== "tv") {
            throw new TypeError(
                "Unsupported details media type: " + describeInvalidArgument(mediaType)
            );
        }

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new TypeError(
                "Invalid details ID: " + describeInvalidArgument(id)
            );
        }

        const append = mediaType === "movie"
            ? resolveMovieAppendOptions(options)
            : resolveTVAppendOptions(options);

        const language = append.language;

        const explicitLanguage = mediaType === "movie" &&
            options !== undefined &&
            Object.hasOwn(options, "language");

        const row = getEntity(mediaType, id);

        if (!row) {
            return null;
        }

        const details = clone(row.details);

        if (explicitLanguage) {
            const localized = row.localized?.[language];

            if (!localized || typeof localized !== "object") {
                throw new Error("Missing movie locale: " + id + " " + language);
            }

            for (const field of [
                "title", "overview", "tagline",
                "homepage", "runtime",
                "poster_path", "backdrop_path"
            ]) {
                if (!Object.hasOwn(localized, field)) {
                    throw new Error("Missing movie localized field: " + id + " " + language + " " + field);
                }

                details[field] = clone(localized[field]);
            }
            applyDetailsNested("movie", details, id, language);
        }
        if (mediaType === "tv") {
          if (options !== undefined &&
              Object.hasOwn(options, "language")) {

            const localized = row.localized?.[language];

            invariant(
                localized &&
                typeof localized === "object" &&
                !Array.isArray(localized),
                "Missing TV locale: " + id + " " + language
            );

            const allowed = {
                name: ["string"],
                overview: ["string"],
                tagline: ["string"],
                homepage: ["string", "null"],
                poster_path: ["string", "null"],
                backdrop_path: ["string", "null"]
            };

            for (const field of Object.keys(localized)) {
                invariant(
                    Object.hasOwn(allowed, field),
                    "Unsupported TV localized field: " +
                        id + " " + language + " " + field
                );
            }

            for (const [field, types] of Object.entries(allowed)) {
                invariant(
                    Object.hasOwn(localized, field),
                    "Missing TV localized field: " +
                        id + " " + language + " " + field
                );

                const value = localized[field];
                const type = value === null ? "null" : typeof value;

                invariant(
                    types.includes(type),
                    "Invalid TV localized field type: " +
                        id + " " + language + " " + field
                );

                details[field] = clone(value);
            }
          }

          if (options !== undefined &&
              Object.hasOwn(options, "language")) {
            applyDetailsNested("tv", details, id, language);
          }
          details.created_by = getCreatedBy(id);
        }
        if (append.blocks.length) {
            return mediaType === "movie"
                ? applyMovieAppend(details, id, append)
                : applyTVAppend(details, id, append);
        }

        return details;
    }




    function applyAggregateCreditsLocalization(response, language) {
        const row = nestedIndexes
            .get("tv").get("credits").get(response.id);

        const label = "aggregate credits " +
            response.id + " " + language;

        function object(value) {
            return value !== null &&
                typeof value === "object" &&
                !Array.isArray(value);
        }

        function exactKeys(value, keys, context) {
            invariant(
                object(value) &&
                Reflect.ownKeys(value).length === keys.length &&
                keys.every(key => Object.hasOwn(value, key)),
                label + ": invalid keys " + context
            );
        }

        function identity(value, fields) {
            invariant(object(value), label + ": invalid identity");

            for (const field of fields) {
                invariant(
                    Object.hasOwn(value, field),
                    label + ": missing identity " + field
                );

                const item = value[field];

                invariant(
                    field === "id"
                        ? Number.isSafeInteger(item) && item > 0
                        : typeof item === "string" && item.length > 0,
                    label + ": invalid identity " + field
                );
            }

            return JSON.stringify(
                fields.map(field => value[field])
            );
        }

        function matched(source, patches, fields, payload, context) {
            const sourceIndex = uniqueIndex(
                source,
                item => identity(item, fields),
                label + " source " + context
            );

            const patchIndex = uniqueIndex(
                patches,
                patch => {
                    exactKeys(
                        patch, ["identity", payload], context
                    );

                    exactKeys(
                        patch.identity, fields, context + " identity"
                    );

                    return identity(patch.identity, fields);
                },
                label + " patches " + context
            );

            invariant(
                sourceIndex.size === patchIndex.size,
                label + ": incomplete coverage " + context
            );

            for (const key of patchIndex.keys()) {
                invariant(
                    sourceIndex.has(key),
                    label + ": unknown identity " + context
                );
            }

            return patchIndex;
        }

        function apply(source, patches, fields, allowed, context) {
            const index = matched(
                source, patches, fields, "values", context
            );

            for (const item of source) {
                const patch = index.get(identity(item, fields));

                invariant(
                    patch,
                    label + ": missing patch " + context
                );

                exactKeys(patch.values, allowed, context + " values");

                for (const field of allowed) {
                    const value = patch.values[field];

                    invariant(
                        Object.hasOwn(item, field),
                        label + ": missing source field " + field
                    );

                    invariant(
                        typeof value === "string" ||
                        (field === "profile_path" && value === null),
                        label + ": invalid localized field " + field
                    );

                    item[field] = clone(value);
                }
            }
        }

        const localized = row?.localized?.[language];

        invariant(
            object(localized),
            label + ": missing locale"
        );

        const aggregateKeys = Object.keys(localized)
            .filter(key => /aggregate/i.test(key));

        invariant(
            aggregateKeys.length === 1,
            label + ": invalid aggregate container"
        );

        const patches = localized[aggregateKeys[0]];

        exactKeys(
            patches,
            ["cast", "crew", "roles", "jobs"],
            "aggregate"
        );

        apply(
            response.cast, patches.cast,
            ["id"], ["name", "profile_path"], "cast"
        );

        apply(
            response.crew, patches.crew,
            ["id", "department"],
            ["name", "profile_path"], "crew"
        );

        for (const [parents, groups, fields, child] of [
            [response.cast, patches.roles, ["id"], "roles"],
            [response.crew, patches.jobs, ["id", "department"], "jobs"]
        ]) {
            const index = matched(
                parents, groups, fields, "patches", child
            );

            for (const parent of parents) {
                const group = index.get(identity(parent, fields));

                invariant(
                    group && Array.isArray(group.patches),
                    label + ": invalid nested patches " + child
                );

                uniqueIndex(
                    parent[child],
                    item => identity(item, ["credit_id"]),
                    label + " source " + child
                );

                if (child === "jobs") {
                    invariant(
                        group.patches.length === 0,
                        label + ": jobs are protected"
                    );
                } else {
                    apply(
                        parent.roles, group.patches,
                        ["credit_id"], ["character"], "roles"
                    );
                }
            }
        }

        return response;
    }

    function getAggregateCredits(id, options) {
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new Error("Invalid TV ID: " + describeInvalidArgument(id));
        }

        const row = getEntity("tv", id);

        if (!row) {
            return null;
        }

        const language = resolveDetailsLanguage(options);
        const explicitLanguage = options !== undefined &&
            Object.hasOwn(options, "language");

        const aggregate = row.aggregateCredits;

        function ensure(condition, message) {
            if (!condition) {
                throw new Error(
                    "Invalid aggregate credits for TV " +
                    id + ": " + message
                );
            }
        }

        ensure(
            aggregate &&
            Array.isArray(aggregate.cast) &&
            Array.isArray(aggregate.crew),
            "missing aggregate fixture"
        );

        const usedRefs = new Set();
        const actorKeys = new Set();
        const crewKeys = new Set();

        function common(personId) {
            const person = getEntity("person", personId);

            ensure(person && person.list, "missing person");

            const info = person.list;

            return {
                adult: info.adult,
                gender: info.gender,
                id: person.id,
                known_for_department: info.known_for_department,
                name: info.name,
                original_name: info.original_name,
                popularity: info.popularity,
                profile_path: info.profile_path
            };
        }

        function countValid(value) {
            return Number.isSafeInteger(value) && value >= 0;
        }

        function resolveEntry(entry, group, isCast) {
            ensure(
                entry &&
                Array.isArray(entry.creditRefs) &&
                entry.creditRefs.length > 0,
                "empty credit references"
            );

            const mainKind = isCast ? "cast" : "crew";
            const episodeKind = isCast ? "guest" : "episodeCrew";
            const labelKey = isCast ? "character" : "job";

            const records = entry.creditRefs.map(ref => {
                ensure(
                    typeof ref === "string" && !usedRefs.has(ref),
                    "invalid or duplicate credit reference"
                );

                const credit = getIndex("creditById", ref);

                ensure(
                    credit &&
                    credit.creditId === ref &&
                    credit.mediaType === "tv" &&
                    credit.mediaId === id &&
                    credit.personId === group.personId,
                    "credit ownership mismatch: " + ref
                );

                ensure(
                    credit.kind === mainKind ||
                    credit.kind === episodeKind,
                    "invalid credit kind: " + ref
                );

                if (!isCast) {
                    ensure(
                        credit.department === group.department,
                        "department mismatch: " + ref
                    );
                }

                ensure(
                    typeof credit[labelKey] === "string",
                    "missing role or job label: " + ref
                );

                usedRefs.add(ref);
                return credit;
            });

            const canonical = records[0];

            ensure(
                records.every(credit =>
                    credit[labelKey] === canonical[labelKey] &&
                    (!isCast ||
                        credit.characterEn === canonical.characterEn)
                ),
                "inconsistent role or job labels"
            );

            const main = records.filter(
                credit => credit.kind === mainKind
            );

            const episodic = records.filter(
                credit => credit.kind === episodeKind
            );

            ensure(main.length <= 1, "multiple main credits");

            const episodeIds = new Set();

            for (const credit of episodic) {
                const episode = getEntity("episode", credit.episodeId);

                ensure(
                    episode &&
                    episode.tvId === id &&
                    episode.seasonNumber === credit.seasonNumber &&
                    episode.episodeNumber === credit.episodeNumber,
                    "invalid episode reference: " + credit.creditId
                );

                episodeIds.add(credit.episodeId);
            }

            let count;

            if (main.length === 1) {
                ensure(
                    countValid(main[0].episodeCount),
                    "invalid main episode count"
                );

                // Main credit membership is not available.
                // Do not add episodic counts blindly.
                count = Math.max(
                    main[0].episodeCount,
                    episodeIds.size
                );
            } else {
                count = episodeIds.size;
            }

            return {
                credit_id: canonical.creditId,
                [labelKey]: canonical[labelKey],
                episode_count: count
            };
        }

        function validateGroup(group) {
            ensure(
                group &&
                Number.isSafeInteger(group.personId) &&
                group.personId > 0 &&
                countValid(group.total_episode_count),
                "invalid aggregate group"
            );
        }

        const cast = aggregate.cast.map(group => {
            validateGroup(group);

            ensure(
                !actorKeys.has(group.personId),
                "duplicate actor group"
            );

            actorKeys.add(group.personId);

            ensure(
                countValid(group.order) &&
                Array.isArray(group.roles) &&
                group.roles.length > 0,
                "invalid actor roles or order"
            );

            return {
                ...common(group.personId),
                roles: group.roles.map(entry =>
                    resolveEntry(entry, group, true)
                ),
                total_episode_count: group.total_episode_count,
                order: group.order
            };
        });

        const crew = aggregate.crew.map(group => {
            validateGroup(group);

            ensure(
                typeof group.department === "string" &&
                group.department.length > 0 &&
                Array.isArray(group.jobs) &&
                group.jobs.length > 0,
                "invalid crew department or jobs"
            );

            const key = JSON.stringify([
                group.personId,
                group.department
            ]);

            ensure(!crewKeys.has(key), "duplicate crew group");
            crewKeys.add(key);

            return {
                ...common(group.personId),
                department: group.department,
                jobs: group.jobs.map(entry =>
                    resolveEntry(entry, group, false)
                ),
                total_episode_count: group.total_episode_count
            };
        });

        const response = clone({ id, cast, crew });

        if (explicitLanguage) {
            applyAggregateCreditsLocalization(response, language);
        }

        return response;
    }



    function applyCreatedByLocalization(result, id, language) {
        const label = "created_by " + id + " " + language;

        const object = value =>
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value);

        function exactKeys(value, keys, context) {
            invariant(
                object(value) &&
                Reflect.ownKeys(value).length === keys.length &&
                keys.every(key => Object.hasOwn(value, key)),
                label + ": invalid keys " + context
            );
        }

        function identity(value) {
            invariant(
                object(value) &&
                Number.isSafeInteger(value.id) &&
                value.id > 0 &&
                typeof value.credit_id === "string" &&
                value.credit_id.length > 0,
                label + ": invalid creator identity"
            );

            return JSON.stringify([value.id, value.credit_id]);
        }

        const row = nestedIndexes
            .get("tv").get("credits").get(id);

        invariant(
            row &&
            object(row.localized) &&
            Object.hasOwn(row.localized, language),
            label + ": missing explicit locale"
        );

        const localized = row.localized[language];

        invariant(
            object(localized) &&
            Object.hasOwn(localized, "created_by") &&
            Array.isArray(localized.created_by),
            label + ": invalid created_by patches"
        );

        const patches = localized.created_by;
        const sources = new Map();
        const names = new Map();

        invariant(
            Array.isArray(result),
            label + ": invalid source array"
        );

        for (const creator of result) {
            const key = identity(creator);

            invariant(
                !sources.has(key),
                label + ": duplicate source identity " + key
            );

            invariant(
                Object.hasOwn(creator, "name") &&
                typeof creator.name === "string",
                label + ": invalid source name " + key
            );

            sources.set(key, creator);
        }

        for (const patch of patches) {
            exactKeys(patch, ["identity", "values"], "patch");

            exactKeys(
                patch.identity,
                ["id", "credit_id"],
                "identity"
            );

            exactKeys(patch.values, ["name"], "values");

            const key = identity(patch.identity);

            invariant(
                sources.has(key),
                label + ": unknown patch identity " + key
            );

            invariant(
                !names.has(key),
                label + ": duplicate patch identity " + key
            );

            invariant(
                typeof patch.values.name === "string",
                label + ": invalid localized name " + key
            );

            names.set(key, patch.values.name);
        }

        invariant(
            names.size === sources.size,
            label + ": incomplete patch coverage"
        );

        for (const [key, creator] of sources) {
            invariant(
                names.has(key),
                label + ": missing patch " + key
            );

            creator.name = names.get(key);
        }
    }

    function getCreatedBy(id, options) {
      if (!Number.isSafeInteger(id) || id <= 0) {
        throw new TypeError("Invalid TV id: " + describeInvalidArgument(id));
      }

      const row = getEntity("tv", id);
      if (!row) return null;

      const language = resolveDetailsLanguage(options);
      const explicitLanguage = options !== undefined &&
        Object.hasOwn(options, "language");

      const ensure = (condition, message) => {
        if (!condition) {
          throw new Error(
            "Invalid created_by for TV " + id + ": " + message
          );
        }
      };

      ensure(
        Array.isArray(row.creatorRefs),
        "creatorRefs must be an array"
      );

      const usedRefs = new Set();
      const usedPeople = new Set();

      const result = row.creatorRefs.map(ref => {
        ensure(
          typeof ref === "string" && ref.length > 0,
          "invalid credit reference"
        );

        ensure(
          !usedRefs.has(ref),
          "duplicate credit reference " + ref
        );

        const credit = getIndex("creditById", ref);

        ensure(!!credit, "unknown credit " + ref);

        ensure(
          credit.creditId === ref &&
          credit.mediaType === "tv" &&
          credit.mediaId === id &&
          credit.kind === "creator",
          "invalid creator ownership or kind " + ref
        );

        ensure(
          Number.isSafeInteger(credit.personId) &&
          credit.personId > 0,
          "invalid person id " + ref
        );

        ensure(
          !usedPeople.has(credit.personId),
          "duplicate creator person " + credit.personId
        );

        const person = getEntity("person", credit.personId);

        ensure(!!person, "unknown creator person " + ref);

        const info = person.list;

        ensure(
          info && typeof info === "object",
          "missing person information " + ref
        );

        ensure(
          typeof info.name === "string" &&
          typeof info.original_name === "string",
          "invalid creator name " + ref
        );

        ensure(
          Number.isInteger(info.gender) &&
          info.gender >= 0 &&
          info.gender <= 3,
          "invalid creator gender " + ref
        );

        ensure(
          info.profile_path === null ||
          typeof info.profile_path === "string",
          "invalid creator profile path " + ref
        );

        usedRefs.add(ref);
        usedPeople.add(credit.personId);

        return {
          id: person.id,
          credit_id: credit.creditId,
          name: info.name,
          original_name: info.original_name,
          gender: info.gender,
          profile_path: info.profile_path
        };
      });

      const indexed = (
        getIndex("creditsByMedia", "tv:" + id) || []
      ).filter(credit => credit.kind === "creator");

      ensure(
        indexed.length === usedRefs.size &&
        indexed.every(credit => usedRefs.has(credit.creditId)),
        "creator references do not match source credits"
      );

      const response = structuredClone(result);

      if (explicitLanguage) {
        applyCreatedByLocalization(response, id, language);
      }

      return response;
    }

    function applyCreditsLocalization(
        mediaType, response, language
    ) {
        const row = nestedIndexes
            .get(mediaType)
            .get("credits")
            .get(response.id);

        invariant(
            row && row.localized &&
            Object.hasOwn(row.localized, language),
            "missing credits locale " +
                mediaType + ":" + response.id + " " + language
        );

        const localized = row.localized[language].credits;

        invariant(
            localized &&
            typeof localized === "object" &&
            !Array.isArray(localized) &&
            Reflect.ownKeys(localized).length === 2 &&
            Object.hasOwn(localized, "cast") &&
            Object.hasOwn(localized, "crew"),
            "invalid localized credits structure"
        );

        function creditIdentity(record) {
            invariant(
                record &&
                typeof record === "object" &&
                !Array.isArray(record) &&
                Number.isSafeInteger(record.id) &&
                record.id > 0 &&
                typeof record.credit_id === "string" &&
                record.credit_id.length > 0,
                "invalid credit identity"
            );

            return JSON.stringify([
                record.id, record.credit_id
            ]);
        }

        for (const group of ["cast", "crew"]) {
            const allowed = group === "cast"
                ? ["name", "profile_path", "character"]
                : ["name", "profile_path"];

            const source = array(
                response[group],
                "source credits " + group
            );

            const patches = array(
                localized[group],
                "localized credits " + group
            );

            const sourceIndex = uniqueIndex(
                source,
                creditIdentity,
                "source credits " + group
            );

            invariant(
                patches.length === source.length,
                "credits membership mismatch " + group
            );

            const patchIndex = new Map();

            for (const patch of patches) {
                invariant(
                    patch &&
                    typeof patch === "object" &&
                    !Array.isArray(patch) &&
                    Reflect.ownKeys(patch).length === 2 &&
                    Object.hasOwn(patch, "identity") &&
                    Object.hasOwn(patch, "values"),
                    "invalid credit patch structure"
                );

                invariant(
                    patch.identity &&
                    typeof patch.identity === "object" &&
                    !Array.isArray(patch.identity) &&
                    Reflect.ownKeys(patch.identity).length === 2 &&
                    Object.hasOwn(patch.identity, "id") &&
                    Object.hasOwn(patch.identity, "credit_id"),
                    "invalid composite credit identity"
                );

                const key = creditIdentity(patch.identity);

                invariant(
                    sourceIndex.has(key),
                    "unknown credit patch identity " + key
                );

                invariant(
                    !patchIndex.has(key),
                    "duplicate credit patch identity " + key
                );

                const values = patch.values;

                invariant(
                    values &&
                    typeof values === "object" &&
                    !Array.isArray(values),
                    "invalid credit patch values " + key
                );

                for (const field of Reflect.ownKeys(values)) {
                    invariant(
                        allowed.includes(field),
                        "protected credit field " + String(field)
                    );
                }

                invariant(
                    Reflect.ownKeys(values).length === allowed.length,
                    "incomplete credit patch " + key
                );

                for (const field of allowed) {
                    invariant(
                        Object.hasOwn(values, field),
                        "missing localized credit field " + field
                    );

                    invariant(
                        Object.hasOwn(sourceIndex.get(key), field),
                        "missing source credit field " + field
                    );

                    const value = values[field];

                    invariant(
                        typeof value === "string" ||
                        (field === "profile_path" && value === null),
                        "invalid localized credit field " + field
                    );
                }

                patchIndex.set(key, values);
            }

            invariant(
                patchIndex.size === sourceIndex.size,
                "incomplete credit identity coverage " + group
            );

            for (const record of source) {
                const values = patchIndex.get(
                    creditIdentity(record)
                );

                invariant(values, "missing credit patch");

                for (const field of allowed) {
                    record[field] = clone(values[field]);
                }
            }
        }

        return response;
    }

    function getCredits(mediaType, id, options) {
        if (mediaType !== "movie" && mediaType !== "tv") {
            throw new TypeError(
                "Unsupported credits media type: " + describeInvalidArgument(mediaType)
            );
        }

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new TypeError(
                "Invalid credits ID: " + describeInvalidArgument(id)
            );
        }

        const row = getEntity(mediaType, id);

        if (!row) {
            return null;
        }

        const language = resolveDetailsLanguage(options);

        const explicitLanguage = options !== undefined &&
            Object.hasOwn(options, "language");

        const records =
            getIndex("creditsByMedia", mediaType + ":" + id) || [];

        const cast = [];
        const crew = [];

        for (const credit of records) {
            if (
                mediaType === "tv" &&
                credit.kind !== "cast" &&
                credit.kind !== "crew"
            ) {
                continue;
            }

            const person = getEntity("person", credit.personId);

            if (!person) {
                throw new Error(
                    "Missing credit person: " + credit.personId
                );
            }

            const info = person.list;

            const common = {
                adult: info.adult,
                gender: info.gender,
                id: person.id,
                known_for_department: info.known_for_department,
                name: info.name,
                original_name: info.original_name,
                popularity: info.popularity,
                profile_path: info.profile_path,
                credit_id: credit.creditId
            };

            if (credit.kind === "cast") {
                cast.push({
                    ...common,
                    character: credit.character,
                    order: credit.order
                });
            } else if (credit.kind === "crew") {
                crew.push({
                    ...common,
                    department: credit.department,
                    job: credit.job
                });
            } else {
                throw new Error(
                    "Unsupported movie credit kind: " + credit.kind
                );
            }
        }

        cast.sort((a, b) => a.order - b.order);

        const response = clone({ id, cast, crew });

        if (explicitLanguage) {
            applyCreditsLocalization(
                mediaType, response, language
            );
        }

        return response;
    }

    function getEntities(kind) {
        return clone(entities[kind] || []);
    }


    function validateSeasonAddress(tvId, seasonNumber) {
        if (!Number.isSafeInteger(tvId) || tvId <= 0) {
            throw new TypeError(
                "Invalid TV ID: " + describeInvalidArgument(tvId)
            );
        }

        if (!Number.isSafeInteger(seasonNumber) || seasonNumber < 0) {
            throw new TypeError(
                "Invalid season number: " +
                describeInvalidArgument(seasonNumber)
            );
        }
    }

    function localizeEpisodeRecord(row, language, field) {
        const result = clone(row[field]);
        const localized = row.localized[language];

        for (const key of ["name", "overview"]) {
            if (Object.hasOwn(localized, key)) {
                result[key] = localized[key];
            }
        }

        return result;
    }

    function getSeasons(tvId) {
        validateSeasonAddress(tvId, 0);

        if (!entityExists("tv", tvId)) {
            return null;
        }

        return (seasonsByTv.get(tvId) || [])
            .slice()
            .sort((a, b) => a.seasonNumber - b.seasonNumber)
            .map(row => clone(row.summary));
    }

    function getEpisodes(tvId, seasonNumber, options) {
        validateSeasonAddress(tvId, seasonNumber);

        const language = resolveDetailsLanguage(options);
        const season = seasonByNumber.get(
            `${tvId}:${seasonNumber}`
        );

        if (!season) {
            return null;
        }

        return (episodesBySeason.get(season.id) || [])
            .slice()
            .sort((a, b) => a.episodeNumber - b.episodeNumber)
            .map(row => localizeEpisodeRecord(
                row, language, "summary"
            ));
    }

    function getSeasonDetails(tvId, seasonNumber, options) {
        validateSeasonAddress(tvId, seasonNumber);

        const language = resolveDetailsLanguage(options);
        const row = seasonByNumber.get(
            `${tvId}:${seasonNumber}`
        );

        if (!row) {
            return null;
        }

        const result = localizeEpisodeRecord(
            row, language, "details"
        );

        result.episodes = getEpisodes(
            tvId, seasonNumber, {language}
        );

        return result;
    }

    function getEpisodeDetails(
        tvId, seasonNumber, episodeNumber, options
    ) {
        validateSeasonAddress(tvId, seasonNumber);

        if (!Number.isSafeInteger(episodeNumber) ||
            episodeNumber <= 0) {
            throw new TypeError(
                "Invalid episode number: " +
                describeInvalidArgument(episodeNumber)
            );
        }

        const language = resolveDetailsLanguage(options);
        const row = episodeByNumber.get(
            `${tvId}:${seasonNumber}:${episodeNumber}`
        );

        if (!row) {
            return null;
        }

        const result = localizeEpisodeRecord(
            row, language, "details"
        );

        const credits = getEpisodeCredits(
            tvId, seasonNumber, episodeNumber, {language}
        );

        result.credits = {
            cast: credits.cast,
            crew: credits.crew,
            guest_stars: credits.guest_stars
        };

        result.crew = clone(credits.crew);
        result.guest_stars = clone(credits.guest_stars);

        return result;
    }


    function getAirEpisode(tvId, field, options) {
        validateSeasonAddress(tvId, 0);

        const language = resolveDetailsLanguage(options);
        const tv = entityIndexes.get("tv").get(tvId);

        if (!tv || tv.details[field] == null) {
            return null;
        }

        const result = clone(tv.details[field]);

        const episode = entityIndexes.get("episode")
            .get(result.id);

        if (episode && episode.tvId === tvId) {
            const localized = episode.localized[language];

            for (const key of ["name", "overview"]) {
                if (Object.hasOwn(localized, key)) {
                    result[key] = localized[key];
                }
            }
        }

        return result;
    }

    function getLastEpisodeToAir(tvId, options) {
        return getAirEpisode(
            tvId, "last_episode_to_air", options
        );
    }

    function getNextEpisodeToAir(tvId, options) {
        return getAirEpisode(
            tvId, "next_episode_to_air", options
        );
    }


    function validatePersonId(id) {
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new TypeError(
                "Invalid person ID: " +
                describeInvalidArgument(id)
            );
        }
    }

    function getPersonDetails(id, options) {
        validatePersonId(id);

        const language = resolveDetailsLanguage(options);
        const person = getEntity("person", id);

        if (!person) {
            return null;
        }

        const result = clone(person.details);
        const localized = person.localized[language];

        for (const key of [
            "name", "biography", "place_of_birth"
        ]) {
            if (Object.hasOwn(localized, key)) {
                result[key] = clone(localized[key]);
            }
        }

        return result;
    }

    function episodeCreditPerson(credit, language) {
        const person = getEntity(
            "person", credit.personId
        );

        invariant(person, "Missing episode credit person");

        const info = person.list;

        return {
            adult: info.adult,
            gender: info.gender,
            id: person.id,
            known_for_department: info.known_for_department,
            name: person.localized[language].name,
            original_name: info.original_name,
            popularity: info.popularity,
            profile_path: info.profile_path,
            credit_id: credit.creditId
        };
    }

    function getEpisodeCredits(
        tvId, seasonNumber, episodeNumber, options
    ) {
        validateSeasonAddress(tvId, seasonNumber);

        if (!Number.isSafeInteger(episodeNumber) ||
            episodeNumber <= 0) {
            throw new TypeError(
                "Invalid episode number: " +
                describeInvalidArgument(episodeNumber)
            );
        }

        const language = resolveDetailsLanguage(options);

        const row = episodeByNumber.get(
            `${tvId}:${seasonNumber}:${episodeNumber}`
        );

        const episode = row
            ? localizeEpisodeRecord(row, language, "details")
            : null;

        if (!episode) {
            return null;
        }

        const records = getIndex(
            "creditsByEpisode", episode.id
        ) || [];

        const cast = clone(episode.credits?.cast || []);
        const crew = [];
        const guest_stars = [];

        for (const credit of records) {
            const common = episodeCreditPerson(
                credit, language
            );

            if (credit.kind === "guest") {
                guest_stars.push({
                    ...common,
                    character: language === "en-US"
                        ? credit.characterEn
                        : credit.character,
                    order: credit.order
                });
            } else if (credit.kind === "episodeCrew") {
                crew.push({
                    ...common,
                    department: credit.department,
                    job: credit.job
                });
            } else {
                throw new Error(
                    "Unsupported episode credit kind: " +
                    credit.kind
                );
            }
        }

        guest_stars.sort((a, b) => a.order - b.order);

        return clone({
            id: episode.id,
            cast,
            crew,
            guest_stars
        });
    }

    function buildPersonCredits(id, mediaType, options) {
        validatePersonId(id);

        const language = resolveDetailsLanguage(options);
        const person = getEntity("person", id);

        if (!person) {
            return null;
        }

        const records = getIndex(
            "creditsByPerson", id
        ) || [];

        const cast = [];
        const crew = [];
        const seen = new Set();

        for (const credit of records) {
            if (mediaType && credit.mediaType !== mediaType) {
                continue;
            }

            // Creator relationships belong to created_by.
            if (credit.kind === "creator") {
                continue;
            }

            invariant(
                !seen.has(credit.creditId),
                "Duplicate person credit: " + credit.creditId
            );

            seen.add(credit.creditId);

            const media = getEntity(
                credit.mediaType, credit.mediaId
            );

            invariant(media, "Missing person credit media");

            const item = clone(media.list);

            const details = getDetails(
                credit.mediaType,
                credit.mediaId,
                {language}
            );

            const fields = credit.mediaType === "movie"
                ? ["title", "overview"]
                : ["name", "overview"];

            for (const key of fields) {
                if (Object.hasOwn(details, key)) {
                    item[key] = clone(details[key]);
                }
            }

            item.id = credit.mediaId;
            item.credit_id = credit.creditId;

            if (!mediaType) {
                item.media_type = credit.mediaType;
            }

            if (Object.hasOwn(credit, "episodeCount")) {
                item.episode_count = credit.episodeCount;
            }

            if (Object.hasOwn(credit, "episodeId")) {
                item.episode_count = 1;
            }

            if (
                credit.kind === "cast" ||
                credit.kind === "guest"
            ) {
                item.character = language === "en-US"
                    ? credit.characterEn
                    : credit.character;

                cast.push(item);
            } else if (
                credit.kind === "crew" ||
                credit.kind === "episodeCrew"
            ) {
                item.department = credit.department;
                item.job = credit.job;

                crew.push(item);
            } else {
                throw new Error(
                    "Unsupported person credit kind: " +
                    credit.kind
                );
            }
        }

        return clone({id, cast, crew});
    }

    function getPersonMovieCredits(id, options) {
        return buildPersonCredits(id, "movie", options);
    }

    function getPersonTvCredits(id, options) {
        return buildPersonCredits(id, "tv", options);
    }

    function getPersonCombinedCredits(id, options) {
        return buildPersonCredits(id, null, options);
    }

    function getIndex(name, key) {
        invariant(indexes.has(name), "unknown index " + name);
        return clone(indexes.get(name).get(key));
    }

    function getDataset(name) {
        invariant(
            Object.hasOwn(DATASETS, name),
            "unknown dataset " + name
        );

        return clone(data[name]);
    }


    function filterDiscover(mediaType, params = {}) {
        invariant(
            ["movie", "tv"].includes(mediaType),
            "invalid discover media type"
        );

        const p = params instanceof URLSearchParams
            ? new URLSearchParams(params)
            : new URLSearchParams(params);

        const isTv = mediaType === "tv";

        const supported = new Set([
            "with_genres",
            "without_genres",
            "with_origin_country",
            "with_original_language",
            "vote_average.gte",
            "vote_average.lte",
            "vote_count.gte",
            "vote_count.lte",
            "primary_release_year",
            "first_air_date_year",
            "primary_release_date.gte",
            "primary_release_date.lte",
            "first_air_date.gte",
            "first_air_date.lte",
            "air_date.gte",
            "air_date.lte",
            "with_runtime.gte",
            "with_runtime.lte",
            "include_adult",
            "include_null_first_air_dates",
            "region",
            "with_release_type",
            "release_date.gte",
            "release_date.lte",
            "with_status",
            "with_type",
            "with_networks",
            "with_watch_providers",
            "watch_region",
            "with_watch_monetization_types"
        ]);

        for (const key of p.keys()) {
            invariant(
                supported.has(key),
                "unsupported basic discover parameter " + key
            );
            invariant(
                p.getAll(key).length === 1,
                "duplicate discover parameter " + key
            );
        }

        function value(key) {
            return p.has(key) ? p.get(key) : null;
        }

        function boolean(key, fallback) {
            const raw = value(key);
            if (raw === null) return fallback;

            invariant(
                raw === "true" || raw === "false",
                "invalid boolean " + key
            );

            return raw === "true";
        }

        function number(key, integer = false) {
            const raw = value(key);
            if (raw === null) return null;

            invariant(
                /^\d+(?:\.\d+)?$/.test(raw),
                "invalid number " + key
            );

            const n = Number(raw);

            invariant(
                Number.isFinite(n)
                && n >= 0
                && (!integer || Number.isSafeInteger(n)),
                "invalid numeric value " + key
            );

            return n;
        }

        function date(key) {
            const raw = value(key);
            if (raw === null) return null;

            const parsed = new Date(raw + "T00:00:00Z");

            invariant(
                /^\d{4}-\d{2}-\d{2}$/.test(raw)
                && Number.isFinite(parsed.getTime())
                && parsed.toISOString().slice(0, 10) === raw,
                "invalid date " + key
            );

            return raw;
        }

        function expression(key, pattern, normalize) {
            const raw = value(key);
            if (raw === null) return null;

            invariant(
                raw.length > 0,
                "empty expression " + key
            );

            return raw.split("|").map(group =>
                group.split(",").map(token => {
                    invariant(
                        pattern.test(token),
                        "invalid expression " + key
                    );
                    return normalize(token);
                })
            );
        }

        function matches(values, groups) {
            if (groups === null) return true;

            const set = new Set(values);

            return groups.some(group =>
                group.every(item => set.has(item))
            );
        }

        function range(n, min, max) {
            if (min === null && max === null) return true;
            if (typeof n !== "number"
                || !Number.isFinite(n)) return false;

            return (min === null || n >= min)
                && (max === null || n <= max);
        }

        function validateRange(min, max, key) {
            invariant(
                min === null || max === null || min <= max,
                "inverted range " + key
            );
        }

        const genres = expression(
            "with_genres", /^[1-9]\d*$/, Number
        );

        const excludedGenres = expression(
            "without_genres", /^[1-9]\d*$/, Number
        );

        const countries = expression(
            "with_origin_country",
            /^[A-Z]{2}$/,
            String
        );

        const languages = expression(
            "with_original_language",
            /^[a-z]{2,3}$/,
            String
        );

        const positiveId = /^[1-9]\d*$/;

        const normalizeId = token => {
            const id = Number(token);
            invariant(
                Number.isSafeInteger(id),
                "invalid discover ID"
            );
            return id;
        };

        const releaseRegionGroups = expression(
            "region",
            /^[A-Z]{2}$/,
            token => token
        );

        const releaseTypeGroups = expression(
            "with_release_type",
            /^[1-6]$/,
            token => Number(token)
        );

        const releaseFromGroups = expression(
            "release_date.gte",
            /^\d{4}-\d{2}-\d{2}$/,
            token => token
        );

        const releaseToGroups = expression(
            "release_date.lte",
            /^\d{4}-\d{2}-\d{2}$/,
            token => token
        );

        function singleReleaseValue(groups, key) {
            if (groups === null) return null;

            invariant(
                groups.length === 1 &&
                groups[0].length === 1,
                "invalid " + key
            );

            return groups[0][0];
        }

        const releaseRegion = singleReleaseValue(
            releaseRegionGroups, "region"
        );

        const releaseFrom = singleReleaseValue(
            releaseFromGroups, "release_date.gte"
        );

        const releaseTo = singleReleaseValue(
            releaseToGroups, "release_date.lte"
        );

        function validReleaseDate(value) {
            if (value === null) return true;

            const parsed = new Date(
                value + "T00:00:00.000Z"
            );

            return !Number.isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === value;
        }

        invariant(
            validReleaseDate(releaseFrom),
            "invalid release_date.gte"
        );

        invariant(
            validReleaseDate(releaseTo),
            "invalid release_date.lte"
        );

        invariant(
            releaseFrom === null ||
            releaseTo === null ||
            releaseFrom <= releaseTo,
            "invalid release_date range"
        );

        const hasReleaseFilter =
            releaseRegion !== null ||
            releaseTypeGroups !== null ||
            releaseFrom !== null ||
            releaseTo !== null;

        invariant(
            !isTv || !hasReleaseFilter,
            "regional release parameters require movie"
        );

        function matchesRegionalRelease(details) {
            if (!hasReleaseFilter) return true;

            const regions =
                details.release_dates?.results || [];

            return regions.some(region => {
                if (
                    releaseRegion !== null &&
                    region.iso_3166_1 !== releaseRegion
                ) return false;

                return (region.release_dates || [])
                    .some(release => {
                        if (!matches(
                            [release.type],
                            releaseTypeGroups
                        )) return false;

                        const date = String(
                            release.release_date || ""
                        ).slice(0, 10);

                        if (
                            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                            !validReleaseDate(date)
                        ) return false;

                        if (
                            releaseFrom !== null &&
                            date < releaseFrom
                        ) return false;

                        if (
                            releaseTo !== null &&
                            date > releaseTo
                        ) return false;

                        return true;
                    });
            });
        }

        const tvStatuses = [
            "Returning Series",
            "Planned",
            "In Production",
            "Ended",
            "Canceled",
            "Pilot"
        ];

        const tvTypes = [
            "Documentary",
            "News",
            "Miniseries",
            "Reality",
            "Scripted",
            "Talk Show",
            "Video"
        ];

        const statusGroups = expression(
            "with_status",
            /^[0-5]$/,
            token => tvStatuses[Number(token)]
        );

        const typeGroups = expression(
            "with_type",
            /^[0-6]$/,
            token => tvTypes[Number(token)]
        );

        invariant(
            isTv || statusGroups === null,
            "with_status requires tv"
        );

        invariant(
            isTv || typeGroups === null,
            "with_type requires tv"
        );

        const networkGroups = expression(
            "with_networks", positiveId, normalizeId
        );

        const providerGroups = expression(
            "with_watch_providers",
            positiveId,
            normalizeId
        );

        const monetizationGroups = expression(
            "with_watch_monetization_types",
            /^(flatrate|free|ads|rent|buy)$/,
            String
        );

        const watchRegion = value("watch_region");

        invariant(
            isTv || networkGroups === null,
            "with_networks requires tv"
        );

        invariant(
            watchRegion === null
            || /^[A-Z]{2}$/.test(watchRegion),
            "invalid watch_region"
        );

        invariant(
            (providerGroups === null
                && monetizationGroups === null)
            || watchRegion !== null,
            "watch_region required"
        );

        const providerData = getDataset("providers");

        const availabilityById = new Map(
            providerData.availability
                .filter(row => row.mediaType === mediaType)
                .map(row => [row.mediaId, row.regions])
        );

        const networksById = new Map(
            providerData.networkRelationships
                .map(row => [row.tvId, row.networkIds])
        );

        function matchesAvailability(id) {
            if (providerGroups === null
                && monetizationGroups === null) {
                return true;
            }

            const regional =
                availabilityById.get(id)?.[watchRegion];

            if (!regional) return false;

            const groups = monetizationGroups
                || providerData.monetizationTypes
                    .map(type => [type]);

            return groups.some(types => {
                if (!types.every(type =>
                    Array.isArray(regional[type])
                    && regional[type].length > 0
                )) return false;

                if (providerGroups === null) return true;

                const ids = types.flatMap(
                    type => regional[type]
                );

                return matches(ids, providerGroups);
            });
        }

        const ratingMin = number("vote_average.gte");
        const ratingMax = number("vote_average.lte");
        const votesMin = number("vote_count.gte", true);
        const votesMax = number("vote_count.lte", true);
        const runtimeMin = number("with_runtime.gte", true);
        const runtimeMax = number("with_runtime.lte", true);

        validateRange(ratingMin, ratingMax, "rating");
        validateRange(votesMin, votesMax, "votes");
        validateRange(runtimeMin, runtimeMax, "runtime");

        invariant(
            (ratingMin === null || ratingMin <= 10)
            && (ratingMax === null || ratingMax <= 10),
            "rating outside 0..10"
        );

        const datePrefix = isTv
            ? "first_air_date"
            : "primary_release_date";

        const yearKey = isTv
            ? "first_air_date_year"
            : "primary_release_year";

        const incompatible = isTv
            ? [
                "primary_release_year",
                "primary_release_date.gte",
                "primary_release_date.lte"
            ]
            : [
                "first_air_date_year",
                "first_air_date.gte",
                "first_air_date.lte",
                "include_null_first_air_dates"
            ];

        invariant(
            incompatible.every(key => !p.has(key)),
            "discover parameter incompatible with media type"
        );

        const year = number(yearKey, true);
        const dateMin = date(datePrefix + ".gte");
        const dateMax = date(datePrefix + ".lte");

        validateRange(dateMin, dateMax, "release date");

        invariant(
            year === null || (year >= 1 && year <= 9999),
            "invalid release year"
        );

        const includeAdult = boolean(
            "include_adult", false
        );

        const includeNullDates = isTv
            ? boolean("include_null_first_air_dates", false)
            : false;

        const airDateMin = date("air_date.gte");
        const airDateMax = date("air_date.lte");

        const hasAirDateFilter =
            airDateMin !== null ||
            airDateMax !== null;

        invariant(
            isTv || !hasAirDateFilter,
            "air_date parameters require tv"
        );

        validateRange(
            airDateMin, airDateMax, "air date"
        );

        function matchesEpisodeAirDate(tvId) {
            if (!hasAirDateFilter) return true;

            const seasons = seasonsByTv.get(tvId) || [];

            return seasons.some(season =>
                (episodesBySeason.get(season.id) || [])
                    .some(episode => {
                        const aired = episode.summary.air_date;

                        if (typeof aired !== "string" ||
                            !/^\d{4}-\d{2}-\d{2}$/.test(aired)) {
                            return false;
                        }

                        const parsed = new Date(
                            aired + "T00:00:00Z"
                        );

                        if (!Number.isFinite(parsed.getTime()) ||
                            parsed.toISOString().slice(0, 10) !== aired) {
                            return false;
                        }

                        return (airDateMin === null ||
                                aired >= airDateMin) &&
                               (airDateMax === null ||
                                aired <= airDateMax);
                    })
            );
        }

        return getEntities(mediaType).filter(row => {
            const item = row.list;
            const details = row.details;

            if (!includeAdult && item.adult === true) {
                return false;
            }

            if (!matches(
                networksById.get(row.id) || [],
                networkGroups
            )) return false;

            if (!matchesAvailability(row.id)) {
                return false;
            }

            if (!matchesRegionalRelease(details)) {
                return false;
            }

            if (!matchesEpisodeAirDate(row.id)) {
                return false;
            }

            if (!matches(
                [details.status], statusGroups
            )) return false;

            if (!matches(
                [details.type], typeGroups
            )) return false;

            const genreIds = item.genre_ids
                || (details.genres || []).map(g => g.id);

            const origin = isTv
                ? (item.origin_country
                    || details.origin_country
                    || row.originCountries || [])
                : (item.origin_country
                    || details.origin_country
                    || (details.production_countries || [])
                        .map(c => c.iso_3166_1));

            if (!matches(genreIds, genres)) return false;

            if (excludedGenres !== null
                && matches(genreIds, excludedGenres)) {
                return false;
            }

            if (!matches(origin, countries)) return false;

            if (!matches(
                [item.original_language], languages
            )) return false;

            if (!range(
                item.vote_average, ratingMin, ratingMax
            )) return false;

            if (!range(
                item.vote_count, votesMin, votesMax
            )) return false;

            const runtimes = isTv
                ? (details.episode_run_time || [])
                : [details.runtime];

            if ((runtimeMin !== null || runtimeMax !== null)
                && !runtimes.some(n =>
                    range(n, runtimeMin, runtimeMax)
                )) return false;

            const released = isTv
                ? item.first_air_date
                : item.release_date;

            if (!released) {
                if (year !== null) return false;

                if (isTv) return includeNullDates;

                return dateMin === null && dateMax === null;
            }

            if (year !== null
                && Number(released.slice(0, 4)) !== year) {
                return false;
            }

            if (dateMin !== null
                && released < dateMin) return false;

            if (dateMax !== null
                && released > dateMax) return false;

            return true;
        });
    }

    function getStats() {
        return {
            entities: Object.fromEntries(
                [...entityIndexes].map(([k, v]) => [k, v.size])
            ),
            indexes: Object.fromEntries(
                [...indexes].map(([k, v]) => [k, v.size])
            ),
            credits: credits.length
        };
    }

    return Object.freeze({
        getManifest: () => clone(manifest),
        getDataset,
        getEntity,
        getDetails,
        getCreatedBy,
        getCredits,
        getAggregateCredits,
        getSeasons,
        getSeasonDetails,
        getEpisodes,
        getEpisodeDetails,
        getLastEpisodeToAir,
        getNextEpisodeToAir,
        getEpisodeCredits,
        getPersonDetails,
        getPersonMovieCredits,
        getPersonTvCredits,
        getPersonCombinedCredits,
        getEntities,
        filterDiscover,
        getIndex,
        getStats
    });
}

module.exports = Object.freeze({
    loadCatalog
});
