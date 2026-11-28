"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {loadCatalog} = require("./helpers/tmdb-mock.cjs");

const c = loadCatalog();

const series = c.getEntities("tv");
const seasons = c.getEntities("season");
const episodes = c.getEntities("episode");

for (const tv of series) {
    test(`Season list: TV ${tv.id}`, () => {
        const expected = seasons
            .filter(s => s.tvId === tv.id)
            .sort((a, b) => a.seasonNumber - b.seasonNumber)
            .map(s => s.summary);

        assert.deepEqual(
            c.getSeasons(tv.id),
            expected
        );
    });
}

for (const season of seasons) {
    test(`Season details and episodes: ${season.id}`, () => {
        for (const language of ["ru-RU", "en-US"]) {
            const options = {language};

            const expectedEpisodes = episodes
                .filter(e => e.seasonId === season.id)
                .sort((a, b) => a.episodeNumber - b.episodeNumber)
                .map(e => ({
                    ...e.summary,
                    ...e.localized[language]
                }));

            const actual = c.getSeasonDetails(
                season.tvId,
                season.seasonNumber,
                options
            );

            assert.deepEqual(actual, {
                ...season.details,
                ...season.localized[language],
                episodes: expectedEpisodes
            });

            assert.deepEqual(
                c.getEpisodes(
                    season.tvId,
                    season.seasonNumber,
                    options
                ),
                expectedEpisodes
            );

            assert.equal(
                actual.episodes.length,
                season.episodeCount
            );
        }
    });
}

for (const episode of episodes) {
    test(`Episode details: ${episode.id}`, () => {
        for (const language of ["ru-RU", "en-US"]) {
            const actual = c.getEpisodeDetails(
                episode.tvId,
                episode.seasonNumber,
                episode.episodeNumber,
                {language}
            );

            const {
                credits, crew, guest_stars,
                ...scalarDetails
            } = actual;

            const {
                credits: fixtureCredits,
                crew: fixtureCrew,
                guest_stars: fixtureGuests,
                ...fixtureDetails
            } = episode.details;

            assert.deepEqual(scalarDetails, {
                ...fixtureDetails,
                ...episode.localized[language]
            });

            const separate = c.getEpisodeCredits(
                episode.tvId,
                episode.seasonNumber,
                episode.episodeNumber,
                {language}
            );

            assert.deepEqual(credits, {
                cast: separate.cast,
                crew: separate.crew,
                guest_stars: separate.guest_stars
            });

            assert.deepEqual(crew, separate.crew);
            assert.deepEqual(guest_stars, separate.guest_stars);
        }
    });
}

test("Default locale is ru-RU", () => {
    assert.deepEqual(
        c.getSeasonDetails(920001, 0),
        c.getSeasonDetails(920001, 0, {language: "ru-RU"})
    );

    assert.deepEqual(
        c.getEpisodes(920001, 0),
        c.getEpisodes(920001, 0, {language: "ru-RU"})
    );

    assert.deepEqual(
        c.getEpisodeDetails(920001, 0, 1),
        c.getEpisodeDetails(
            920001, 0, 1, {language: "ru-RU"}
        )
    );
});

test("Missing series, season and episode", () => {
    const missing = Number.MAX_SAFE_INTEGER;

    assert.equal(c.getSeasons(missing), null);
    assert.equal(c.getSeasonDetails(missing, 0), null);
    assert.equal(c.getSeasonDetails(920001, missing), null);
    assert.equal(c.getEpisodes(920001, missing), null);
    assert.equal(c.getEpisodeDetails(920001, missing, 1), null);
    assert.equal(c.getEpisodeDetails(920001, 1, missing), null);
});

test("Invalid TV identifiers", () => {
    for (const id of [
        0, -1, 1.5, NaN, Infinity,
        "920001", null, undefined,
        Object.create(null)
    ]) {
        assert.throws(() => c.getSeasons(id), TypeError);
        assert.throws(() => c.getSeasonDetails(id, 0), TypeError);
        assert.throws(() => c.getEpisodes(id, 0), TypeError);
        assert.throws(() => c.getEpisodeDetails(id, 0, 1), TypeError);
    }
});

test("Invalid season numbers", () => {
    for (const n of [
        -1, 1.5, NaN, Infinity, "0",
        null, undefined, Object.create(null)
    ]) {
        assert.throws(() => c.getSeasonDetails(920001, n), TypeError);
        assert.throws(() => c.getEpisodes(920001, n), TypeError);
        assert.throws(() => c.getEpisodeDetails(920001, n, 1), TypeError);
    }
});

test("Invalid episode numbers", () => {
    for (const n of [
        0, -1, 1.5, NaN, Infinity,
        "1", null, undefined, Object.create(null)
    ]) {
        assert.throws(
            () => c.getEpisodeDetails(920001, 0, n),
            TypeError
        );
    }
});

test("Unsupported localization", () => {
    const options = {language: "fr-FR"};

    assert.throws(
        () => c.getSeasonDetails(920001, 0, options),
        RangeError
    );

    assert.throws(
        () => c.getEpisodes(920001, 0, options),
        RangeError
    );

    assert.throws(
        () => c.getEpisodeDetails(920001, 0, 1, options),
        RangeError
    );
});

test("Returned data is isolated", () => {
    const calls = [
        () => c.getSeasons(920001),
        () => c.getEpisodes(920001, 0),
        () => c.getSeasonDetails(920001, 0),
        () => c.getEpisodeDetails(920001, 0, 1)
    ];

    for (const call of calls) {
        const expected = call();
        const modified = call();

        if (Array.isArray(modified)) {
            modified[0].name = "MODIFIED";
            modified.length = 0;
        } else {
            modified.name = "MODIFIED";

            if (modified.episodes) {
                modified.episodes[0].name = "MODIFIED";
                modified.episodes.length = 0;
            }
        }

        assert.deepEqual(call(), expected);
    }
});


for (const tv of series) {
    test(`Air episode references: ${tv.id}`, () => {
        const methods = [
            ["last_episode_to_air", "getLastEpisodeToAir"],
            ["next_episode_to_air", "getNextEpisodeToAir"]
        ];

        for (const [field, method] of methods) {
            const ref = tv.details[field];

            for (const language of ["ru-RU", "en-US"]) {
                const actual = c[method](tv.id, {language});

                if (ref == null) {
                    assert.equal(actual, null);
                    continue;
                }

                const episode = episodes.find(
                    e => e.id === ref.id
                );

                assert.ok(episode);
                assert.equal(episode.tvId, tv.id);

                for (const key of [
                    "id", "air_date", "season_number",
                    "episode_number", "show_id"
                ]) {
                    assert.equal(ref[key], episode.summary[key]);
                }

                assert.deepEqual(actual, {
                    ...ref,
                    name: episode.localized[language].name,
                    overview: episode.localized[language].overview
                });
            }
        }
    });
}

test("Air episode validation and isolation", () => {
    for (const method of [
        "getLastEpisodeToAir",
        "getNextEpisodeToAir"
    ]) {
        assert.equal(
            c[method](Number.MAX_SAFE_INTEGER),
            null
        );

        assert.throws(
            () => c[method](-1),
            TypeError
        );

        assert.throws(
            () => c[method](920021, {language: "fr-FR"}),
            RangeError
        );

        const expected = c[method](920021);
        const modified = c[method](920021);

        assert.ok(expected);
        modified.name = "MODIFIED";

        assert.deepEqual(c[method](920021), expected);

        assert.deepEqual(
            c[method](920021),
            c[method](920021, {language: "ru-RU"})
        );
    }
});


const people = c.getEntities("person");

for (const person of people) {
    test(`Person details: ${person.id}`, () => {
        for (const language of ["ru-RU", "en-US"]) {
            const expected = structuredClone(person.details);

            for (const key of [
                "name", "biography", "place_of_birth"
            ]) {
                if (Object.hasOwn(person.localized[language], key)) {
                    expected[key] = person.localized[language][key];
                }
            }

            assert.deepEqual(
                c.getPersonDetails(person.id, {language}),
                expected
            );
        }
    });

    test(`Person filmography: ${person.id}`, () => {
        for (const language of ["ru-RU", "en-US"]) {
            for (const [method, type] of [
                ["getPersonMovieCredits", "movie"],
                ["getPersonTvCredits", "tv"],
                ["getPersonCombinedCredits", null]
            ]) {
                const actual = c[method](
                    person.id, {language}
                );

                assert.equal(actual.id, person.id);

                const records = person.credits.filter(
                    r => r.kind !== "creator" &&
                        (!type || r.mediaType === type)
                );

                const returned = [
                    ...actual.cast,
                    ...actual.crew
                ];

                assert.deepEqual(
                    returned.map(r => r.credit_id).sort(),
                    records.map(r => r.creditId).sort()
                );

                assert.equal(
                    new Set(
                        returned.map(r => r.credit_id)
                    ).size,
                    returned.length
                );

                for (const record of records) {
                    const isCast = [
                        "cast", "guest"
                    ].includes(record.kind);

                    const group = isCast
                        ? actual.cast
                        : actual.crew;

                    const item = group.find(
                        r => r.credit_id === record.creditId
                    );

                    assert.ok(item);
                    assert.equal(item.id, record.mediaId);

                    if (!type) {
                        assert.equal(
                            item.media_type,
                            record.mediaType
                        );
                    }

                    const media = c.getEntity(
                        record.mediaType,
                        record.mediaId
                    );

                    const nameKey =
                        record.mediaType === "movie"
                            ? "title"
                            : "name";

                    const details = c.getDetails(
                        record.mediaType,
                        record.mediaId,
                        {language}
                    );

                    assert.equal(
                        item[nameKey],
                        details[nameKey]
                    );

                    assert.equal(
                        item.overview,
                        details.overview
                    );

                    for (const key of [
                        "poster_path",
                        "backdrop_path",
                        "vote_average",
                        "vote_count"
                    ]) {
                        assert.equal(
                            item[key],
                            media.list[key]
                        );
                    }

                    if (isCast) {
                        assert.equal(
                            item.character,
                            language === "en-US"
                                ? record.characterEn
                                : record.character
                        );
                    } else {
                        assert.equal(
                            item.job, record.job
                        );

                        assert.equal(
                            item.department,
                            record.department
                        );
                    }

                    if (
                        Object.hasOwn(
                            record, "episodeCount"
                        )
                    ) {
                        assert.equal(
                            item.episode_count,
                            record.episodeCount
                        );
                    }

                    if (record.episodeId) {
                        assert.equal(
                            item.episode_count, 1
                        );
                    }
                }
            }
        }
    });
}

for (const episode of episodes) {
    test(`Episode credits: ${episode.id}`, () => {
        const records = people.flatMap(person =>
            person.credits
                .filter(r => r.episodeId === episode.id)
                .map(r => ({
                    ...r,
                    personId: person.id
                }))
        );

        for (const language of ["ru-RU", "en-US"]) {
            const actual = c.getEpisodeCredits(
                episode.tvId,
                episode.seasonNumber,
                episode.episodeNumber,
                {language}
            );

            assert.equal(actual.id, episode.id);

            assert.deepEqual(
                actual.cast,
                episode.details.credits?.cast || []
            );

            for (const [kind, group] of [
                ["guest", "guest_stars"],
                ["episodeCrew", "crew"]
            ]) {
                const expected = records.filter(
                    r => r.kind === kind
                );

                assert.deepEqual(
                    actual[group]
                        .map(r => r.credit_id).sort(),
                    expected
                        .map(r => r.creditId).sort()
                );

                for (const record of expected) {
                    const item = actual[group].find(
                        r => r.credit_id === record.creditId
                    );

                    const person = people.find(
                        p => p.id === record.personId
                    );

                    assert.ok(item);

                    assert.equal(item.id, person.id);

                    assert.equal(
                        item.name,
                        person.localized[language].name
                    );

                    assert.equal(
                        item.profile_path,
                        person.list.profile_path
                    );

                    if (kind === "guest") {
                        assert.equal(
                            item.character,
                            language === "en-US"
                                ? record.characterEn
                                : record.character
                        );

                        assert.equal(
                            item.order, record.order
                        );
                    } else {
                        assert.equal(
                            item.job, record.job
                        );

                        assert.equal(
                            item.department,
                            record.department
                        );
                    }
                }
            }

            const orders = actual.guest_stars.map(
                r => r.order
            );

            assert.deepEqual(
                orders,
                [...orders].sort((a, b) => a - b)
            );
        }
    });
}

test("Multiple roles remain distinct", () => {
    const credits = c.getPersonTvCredits(930001);

    const roles = credits.cast.filter(
        r => r.id === 920001
    );

    assert.ok(roles.some(
        r => r.character === "Герой 1"
    ));

    assert.ok(roles.some(
        r => r.character === "Второй персонаж"
    ));

    assert.equal(
        new Set(
            roles.map(r => r.credit_id)
        ).size,
        roles.length
    );
});

test("Person and episode credit validation", () => {
    for (const method of [
        "getPersonDetails",
        "getPersonMovieCredits",
        "getPersonTvCredits",
        "getPersonCombinedCredits"
    ]) {
        for (const id of [
            0, -1, 1.5, NaN, Infinity,
            "930001", null, undefined,
            Object.create(null)
        ]) {
            assert.throws(
                () => c[method](id),
                TypeError
            );
        }

        assert.equal(
            c[method](Number.MAX_SAFE_INTEGER),
            null
        );

        assert.throws(
            () => c[method](
                930001, {language: "fr-FR"}
            ),
            RangeError
        );
    }

    assert.equal(
        c.getEpisodeCredits(920001, 999, 1),
        null
    );

    assert.equal(
        c.getEpisodeCredits(920001, 1, 999),
        null
    );

    assert.throws(
        () => c.getEpisodeCredits(920001, -1, 1),
        TypeError
    );

    assert.throws(
        () => c.getEpisodeCredits(920001, 1, 0),
        TypeError
    );
});

test("Person and credit response isolation", () => {
    const calls = [
        () => c.getPersonDetails(930001),
        () => c.getPersonMovieCredits(930001),
        () => c.getPersonTvCredits(930001),
        () => c.getPersonCombinedCredits(930001),
        () => c.getEpisodeCredits(920001, 1, 1)
    ];

    for (const call of calls) {
        const expected = call();
        const modified = call();

        modified.id = -1;

        for (const group of [
            "cast", "crew", "guest_stars"
        ]) {
            if (modified[group]?.length) {
                modified[group][0].credit_id = "MODIFIED";
                modified[group].length = 0;
            }
        }

        assert.deepEqual(call(), expected);
    }
});
