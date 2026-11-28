"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const {loadCatalog} = require("./helpers/tmdb-mock.cjs");

const catalog = loadCatalog();

const BLOCKS = {
    movie: [
        "credits",
        "translations",
        "images",
        "videos",
        "keywords",
        "release_dates"
    ],
    tv: [
        "credits",
        "aggregate_credits",
        "translations",
        "images",
        "videos",
        "keywords",
        "content_ratings"
    ]
};

const LANGUAGES = [
    undefined,
    "ru-RU",
    "en-US"
];

const own = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

const options = language =>
    language === undefined ? {} : {language};

const baseDetails = (type, id, language) =>
    language === undefined
        ? catalog.getDetails(type, id)
        : catalog.getDetails(type, id, {language});

function withoutRootId(value) {
    const copy = structuredClone(value);
    delete copy.id;
    return copy;
}

function expectedBlock(type, id, language, block, base) {
    const args = language === undefined
        ? [type, id]
        : [type, id, {language}];

    if (block === "credits") {
        return withoutRootId(catalog.getCredits(...args));
    }

    if (block === "aggregate_credits") {
        return withoutRootId(
            language === undefined
                ? catalog.getAggregateCredits(id)
                : catalog.getAggregateCredits(id, {language})
        );
    }

    assert.ok(own(base, block));
    return structuredClone(base[block]);
}

test("Legacy public API and entity inventory", () => {
    assert.deepEqual(
        Object.keys(catalog)
            .filter(key => typeof catalog[key] === "function")
            .sort(),
        [
            "filterDiscover",
            "getAggregateCredits",
            "getCreatedBy",
            "getCredits",
            "getDataset",
            "getDetails",
            "getEntities",
            "getEntity",
            "getEpisodeCredits",
            "getEpisodeDetails",
            "getEpisodes",
            "getIndex",
            "getLastEpisodeToAir",
            "getManifest",
            "getNextEpisodeToAir",
            "getPersonCombinedCredits",
            "getPersonDetails",
            "getPersonMovieCredits",
            "getPersonTvCredits",
            "getSeasonDetails",
            "getSeasons",
            "getStats",
        ]
    );

    assert.equal(catalog.getEntities("movie").length, 36);
    assert.equal(catalog.getEntities("tv").length, 32);
});

for (const type of ["movie", "tv"]) {
    const entities = catalog.getEntities(type);

    for (const entity of entities) {
        const id = entity.id;

        for (const language of LANGUAGES) {
            const label = type + ":" + id + ":" +
                (language || "omitted");

            test("Legacy empty options " + label, () => {
                assert.deepEqual(
                    catalog.getDetails(
                        type, id, options(language)
                    ),
                    baseDetails(type, id, language)
                );
            });

            test("Empty append is no-op " + label, () => {
                assert.deepEqual(
                    catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response: ""
                    }),
                    baseDetails(type, id, language)
                );
            });

            for (const block of BLOCKS[type]) {
                test("Single block " + label + ":" + block, () => {
                    const base = baseDetails(type, id, language);

                    const actual = catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response: block
                    });

                    assert.ok(own(actual, block));

                    if (block === "translations") {
                        assert.deepEqual(
                            Object.keys(actual.translations),
                            ["translations"]
                        );

                        assert.ok(
                            Array.isArray(
                                actual.translations.translations
                            )
                        );
                    } else {
                        assert.deepEqual(
                            actual[block],
                            expectedBlock(
                                type, id, language, block, base
                            )
                        );
                    }

                    const expected = structuredClone(base);
                    expected[block] = actual[block];

                    assert.deepEqual(actual, expected);
                });
            }

            test("All blocks " + label, () => {
                const base = baseDetails(type, id, language);

                const actual = catalog.getDetails(type, id, {
                    ...options(language),
                    append_to_response: BLOCKS[type].join(",")
                });

                const expected = structuredClone(base);

                for (const block of BLOCKS[type]) {
                    assert.ok(own(actual, block));

                    if (block === "translations") {
                        assert.ok(
                            Array.isArray(
                                actual.translations.translations
                            )
                        );

                        expected[block] = actual[block];
                    } else {
                        expected[block] = expectedBlock(
                            type, id, language, block, base
                        );
                    }
                }

                assert.deepEqual(actual, expected);
            });

            test("Duplicate blocks " + label, () => {
                assert.deepEqual(
                    catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response:
                            "credits,credits,images,credits"
                    }),
                    catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response: "credits,images"
                    })
                );
            });

            test("Trim tokens " + label, () => {
                assert.deepEqual(
                    catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response: " credits , images "
                    }),
                    catalog.getDetails(type, id, {
                        ...options(language),
                        append_to_response: "credits,images"
                    })
                );
            });

            test("Response isolation " + label, () => {
                const opts = {
                    ...options(language),
                    append_to_response: BLOCKS[type].join(",")
                };

                const expected = catalog.getDetails(type, id, opts);
                const changed = catalog.getDetails(type, id, opts);

                changed.credits.cast.push({id: -1});
                changed.translations.translations.push({
                    iso_639_1: "zz"
                });
                changed.images.posters.push({
                    file_path: "/mutation.jpg"
                });

                assert.deepEqual(
                    catalog.getDetails(type, id, opts),
                    expected
                );
            });
        }
    }
}

for (const [type, id] of [
    ["movie", 910001],
    ["tv", 920001]
]) {
    for (const [index, value] of [
        null,
        1,
        true,
        false,
        [],
        {},
        ["credits"],
        new String("credits"),
        Symbol("credits"),
        () => "credits"
    ].entries()) {
        test("Invalid append type " + type + ":" + index, () => {
            assert.throws(
                () => catalog.getDetails(type, id, {
                    append_to_response: value
                }),
                TypeError
            );
        });
    }

    for (const value of [
        "unknown",
        "Credits",
        "watch/providers",
        "__proto__",
        "constructor",
        "credits,unknown",
        type === "movie" ? "aggregate_credits" : "release_dates",
        type === "movie" ? "content_ratings" : "release_dates"
    ]) {
        test("Unsupported block " + type + ":" + value, () => {
            assert.throws(
                () => catalog.getDetails(type, id, {
                    append_to_response: value
                }),
                RangeError
            );
        });
    }

    for (const value of [
        ",",
        "credits,",
        ",credits",
        "credits,,images",
        "credits, ,images"
    ]) {
        test("Empty token " + type + ":" + value, () => {
            assert.throws(
                () => catalog.getDetails(type, id, {
                    append_to_response: value
                })
            );
        });
    }

    test("20 raw tokens accepted " + type, () => {
        assert.deepEqual(
            catalog.getDetails(type, id, {
                append_to_response:
                    Array(20).fill("credits").join(",")
            }),
            catalog.getDetails(type, id, {
                append_to_response: "credits"
            })
        );
    });

    test("21 raw tokens rejected " + type, () => {
        assert.throws(
            () => catalog.getDetails(type, id, {
                append_to_response:
                    Array(21).fill("credits").join(",")
            })
        );
    });

    test("Invalid language remains rejected " + type, () => {
        assert.throws(
            () => catalog.getDetails(type, id, {
                language: "zz-ZZ",
                append_to_response: "credits"
            }),
            RangeError
        );
    });
}

for (const [type, id] of [
    ["movie", 910017],
    ["tv", 920017]
]) {
    test("Missing translations stay empty " + type, () => {
        for (const language of LANGUAGES) {
            const result = catalog.getDetails(type, id, {
                ...options(language),
                append_to_response: "translations"
            });

            assert.deepEqual(
                result.translations,
                {translations: []}
            );
        }
    });
}



// Independent reference data.
// No temporary files or network access required.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const referenceDir = path.join(
    __dirname,"fixtures/tmdb/localization"
);

const referenceTranslations = JSON.parse(
    fs.readFileSync(
        path.join(referenceDir,"translations.json"),
        "utf8"
    )
);

const referenceBaseline = JSON.parse(
    fs.readFileSync(
        path.join(referenceDir,"append-baseline.json"),
        "utf8"
    )
);

const referenceDigest = value =>
    crypto.createHash("sha256")
        .update(JSON.stringify(value))
        .digest("hex");

test("Independent reference integrity", () => {
    assert.equal(
        referenceDigest(referenceBaseline.records),
        "e86c7eb9c6fa2f2569346488b5d4e92b8385e8757d93cbd4c451d185d5742974"
    );

    assert.equal(referenceBaseline.records.length,745);
    assert.equal(referenceBaseline.protectedDetails.length,204);
    assert.equal(referenceTranslations.entities.length,68);

    assert.equal(
        crypto.createHash("sha256").update(
            fs.readFileSync(
                path.join(referenceDir,"translations.json")
            )
        ).digest("hex"),
        "d1725c0e48048322d76a8019f4b821f1e1e89096c315cdb535c638b4df0f66f3"
    );

    assert.equal(
        referenceTranslations.entities.reduce(
            (sum,row)=>sum+row.translations.length,0
        ),
        152
    );
});

for (const [index,record] of
    referenceBaseline.records.entries()
) {
    test("Historical baseline "+index+":"+record.method,()=>{
        const args = structuredClone(record.args);

        if (
            record.argumentEncoding==="URLSearchParams"
        ) {
            args[1]=new URLSearchParams(args[1]);
        }

        assert.equal(
            referenceDigest(catalog[record.method](...args)),
            record.sha256
        );
    });
}

for (const row of referenceBaseline.protectedDetails) {
    const label = row.type+":"+row.id+":"+
        (row.language??"omitted");

    test("Protected legacy Details "+label,()=>{
        const args = row.language===null
            ? [row.type,row.id]
            : [row.type,row.id,{language:row.language}];

        assert.equal(
            referenceDigest(catalog.getDetails(...args)),
            row.sha256
        );
    });

    test("Protected empty append "+label,()=>{
        assert.equal(
            referenceDigest(catalog.getDetails(
                row.type,row.id,{
                    ...(row.language===null
                        ? {}:{language:row.language}),
                    append_to_response:""
                }
            )),
            row.sha256
        );
    });
}

for (const row of referenceTranslations.entities) {
    for (const language of LANGUAGES) {
        const label = row.mediaType+":"+row.id+":"+
            (language??"omitted");

        test("Exact fixture translations "+label,()=>{
            const result = catalog.getDetails(
                row.mediaType,row.id,{
                    ...options(language),
                    append_to_response:"translations"
                }
            );

            assert.deepEqual(
                result.translations,
                {translations:row.translations}
            );
        });

        test("Exact combined translations "+label,()=>{
            const result = catalog.getDetails(
                row.mediaType,row.id,{
                    ...options(language),
                    append_to_response:
                        BLOCKS[row.mediaType].join(",")
                }
            );

            assert.deepEqual(
                result.translations,
                {translations:row.translations}
            );
        });

        test("Deep translation isolation "+label,()=>{
            const opts = {
                ...options(language),
                append_to_response:"translations"
            };

            const changed = catalog.getDetails(
                row.mediaType,row.id,opts
            );

            if (changed.translations.translations.length) {
                const first =
                    changed.translations.translations[0];

                first.name="MUTATED";
                first.data.overview="MUTATED";
            }

            changed.translations.translations.push({
                syntheticMutation:true
            });

            assert.deepEqual(
                catalog.getDetails(
                    row.mediaType,row.id,opts
                ).translations,
                {translations:row.translations}
            );

            const independent = loadCatalog();

            assert.deepEqual(
                independent.getDetails(
                    row.mediaType,row.id,opts
                ).translations,
                {translations:row.translations}
            );
        });
    }
}

for (const [type,id] of [
    ["movie",910001],
    ["tv",920001]
]) {
    test("Append does not enable unknown options "+type,()=>{
        assert.throws(
            ()=>catalog.getDetails(type,id,{
                append_to_response:"credits",
                unexpectedOption:true
            }),
            TypeError
        );
    });

    test("Append remains Details-only "+type,()=>{
        assert.throws(
            ()=>catalog.getCredits(type,id,{
                append_to_response:"credits"
            }),
            TypeError
        );
    });

    test("Append options remain unchanged "+type,()=>{
        const opts = Object.freeze({
            language:"en-US",
            append_to_response:"credits,translations"
        });

        const expected = structuredClone(opts);

        catalog.getDetails(type,id,opts);

        assert.deepEqual(opts,expected);
    });

    test("Whitespace-only append rejected "+type,()=>{
        assert.throws(
            ()=>catalog.getDetails(type,id,{
                append_to_response:"   "
            })
        );
    });
}
