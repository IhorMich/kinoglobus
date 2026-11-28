"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCatalog } = require("./helpers/tmdb-mock.cjs");

const catalog = loadCatalog();
const missingId = Number.MAX_SAFE_INTEGER;

const endpoints = [
    ["Movie Details", "getDetails", ["movie"], TypeError, /^Invalid details ID:/],
    ["TV Details", "getDetails", ["tv"], TypeError, /^Invalid details ID:/],
    ["Movie Credits", "getCredits", ["movie"], TypeError, /^Invalid credits ID:/],
    ["TV Credits", "getCredits", ["tv"], TypeError, /^Invalid credits ID:/],
    ["TV Aggregate Credits", "getAggregateCredits", [], Error, /^Invalid TV ID:/],
    ["TV Created By", "getCreatedBy", [], TypeError, /^Invalid TV id:/]
];

for (const [label, method, prefix, errorType, message] of endpoints) {
    test(label + " rejects an ID that cannot be converted to a string", () => {
        assert.throws(
            () => catalog[method](...prefix, Object.create(null)),
            error => error.constructor === errorType && message.test(error.message)
        );
    });

    test(label + " preserves option validation order for a missing ID", () => {
        const call = () => catalog[method](...prefix, missingId, {language: "fr-FR"});

        if (method === "getDetails") {
            assert.throws(call, RangeError);
        } else {
            assert.equal(call(), null);
        }
    });
}

for (const [method, message] of [
    ["getDetails", /^Unsupported details media type:/],
    ["getCredits", /^Unsupported credits media type:/]
]) {
    test(method + " rejects a media type that cannot be converted to a string", () => {
        assert.throws(
            () => catalog[method](Object.create(null), -1),
            {name: "TypeError", message}
        );
    });
}
