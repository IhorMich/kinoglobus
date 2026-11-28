"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const {loadCatalog} =
    require("./helpers/tmdb-mock.cjs");

const referencePath = path.join(
    __dirname,
    "fixtures/tmdb/localization/append-reference.json"
);

const referenceBytes =
    fs.readFileSync(referencePath);

const sha = value => crypto
    .createHash("sha256")
    .update(value).digest("hex");

const digest = value =>
    sha(JSON.stringify(value));

assert.equal(
    sha(referenceBytes),
    "e05767104468e24b141e0e8621f0aa57aa9f37e0da1b06eb4f930ea168113325"
);

const reference = JSON.parse(referenceBytes);

assert.equal(reference.credits.length,204);
assert.equal(reference.aggregateCredits.length,96);

const catalog = loadCatalog();

function optionsFor(row) {
    return row.language===null
        ? undefined
        : {language:row.language};
}

function appendOptions(row,block) {
    return {
        ...optionsFor(row),
        append_to_response:block
    };
}

function identity(row) {
    return [
        row.type,
        row.id,
        row.language??"omitted"
    ].join("/");
}

for (const row of reference.credits) {
    test(
        "Protected standalone Credits "+identity(row),
        () => {
            const actual = catalog.getCredits(
                row.type,
                row.id,
                optionsFor(row)
            );

            assert.equal(
                digest(actual),
                row.standaloneSHA256
            );
        }
    );

    test(
        "Independent appended Credits "+identity(row),
        () => {
            const actual = catalog.getDetails(
                row.type,
                row.id,
                appendOptions(row,"credits")
            );

            assert.ok(actual);
            assert.ok(Object.hasOwn(actual,"credits"));

            assert.equal(
                digest(actual.credits),
                row.appendedSHA256
            );
        }
    );
}

for (const row of reference.aggregateCredits) {
    test(
        "Protected standalone Aggregate "+identity(row),
        () => {
            const actual = catalog.getAggregateCredits(
                row.id,
                optionsFor(row)
            );

            assert.equal(
                digest(actual),
                row.standaloneSHA256
            );
        }
    );

    test(
        "Independent appended Aggregate "+identity(row),
        () => {
            const actual = catalog.getDetails(
                "tv",
                row.id,
                appendOptions(row,"aggregate_credits")
            );

            assert.ok(actual);

            assert.ok(
                Object.hasOwn(actual,"aggregate_credits")
            );

            assert.equal(
                digest(actual.aggregate_credits),
                row.appendedSHA256
            );
        }
    );
}
