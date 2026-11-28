"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");

const {loadCatalog}=require("./helpers/tmdb-mock.cjs");

const catalog=loadCatalog();

const directory=path.join(
    __dirname,"fixtures/tmdb/localization"
);

function read(name) {
    return JSON.parse(
        fs.readFileSync(
            path.join(directory,name),"utf8"
        )
    );
}

const baseline=read("append-baseline.json");
const reference=read("append-reference.json");
const translations=read("translations.json");

const digest=value=>crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");

const rows=baseline.protectedDetails.filter(
    row=>row.type==="tv"
);

assert.equal(rows.length,96);

const blocks=[
    "credits",
    "aggregate_credits",
    "translations",
    "images",
    "videos",
    "keywords",
    "content_ratings"
].join(",");

for (const row of rows) {
    const label=row.id+"/"+(row.language??"omitted");

    const options=row.language===null
        ? {}
        : {language:row.language};

    const plain={
        ...options,
        append_to_response:blocks
    };

    const credits=reference.credits.find(
        item=>item.type==="tv" &&
              item.id===row.id &&
              item.language===row.language
    );

    const aggregate=reference.aggregateCredits.find(
        item=>item.type==="tv" &&
              item.id===row.id &&
              item.language===row.language
    );

    const translation=translations.entities.find(
        item=>item.mediaType==="tv" &&
              item.id===row.id
    );

    assert.ok(credits && aggregate && translation);

    function verifyAppend(opts) {
        const keys=Reflect.ownKeys(opts);

        const descriptors=
            Object.getOwnPropertyDescriptors(opts);

        const actual=catalog.getDetails(
            "tv",row.id,opts
        );

        assert.equal(
            digest(actual.credits),
            credits.appendedSHA256
        );

        assert.equal(
            digest(actual.aggregate_credits),
            aggregate.appendedSHA256
        );

        assert.deepEqual(
            actual.translations,
            {translations:translation.translations}
        );

        const restored=structuredClone(actual);

        const legacy=catalog.getDetails(
            "tv",row.id,
            row.language===null
                ? undefined
                : {language:row.language}
        );

        restored.credits=legacy.credits;

        restored.aggregate_credits=
            legacy.aggregate_credits;

        delete restored.translations;

        assert.equal(
            digest(restored),
            row.sha256
        );

        assert.deepEqual(
            Reflect.ownKeys(opts),keys
        );

        assert.deepEqual(
            Object.getOwnPropertyDescriptors(opts),
            descriptors
        );
    }

    const validAppend=[
        ["frozen",()=>Object.freeze({...plain})],

        ["sealed",()=>Object.seal({...plain})],

        ["null prototype",()=>Object.assign(
            Object.create(null),plain
        )],

        ["frozen null prototype",()=>Object.freeze(
            Object.assign(Object.create(null),plain)
        )]
    ];

    for (const [name,create] of validAppend) {
        test("TV append options "+name+" "+label,()=>{
            verifyAppend(create());
        });
    }

    const legacyForms=[
        ["plain",()=>({...options})],

        ["null prototype",()=>Object.assign(
            Object.create(null),options
        )],

        ["frozen",()=>Object.freeze({...options})],

        ["empty append",()=>({
            ...options,
            append_to_response:""
        })],

        ["null prototype empty append",()=>Object.assign(
            Object.create(null),
            options,
            {append_to_response:""}
        )]
    ];

    for (const [name,create] of legacyForms) {
        test("TV legacy options "+name+" "+label,()=>{
            const opts=create();

            const descriptors=
                Object.getOwnPropertyDescriptors(opts);

            assert.equal(
                digest(catalog.getDetails(
                    "tv",row.id,opts
                )),
                row.sha256
            );

            assert.deepEqual(
                Object.getOwnPropertyDescriptors(opts),
                descriptors
            );
        });
    }

    const invalidForms=[
        ["unknown key",()=>({
            ...plain,unexpected:true
        })],

        ["symbol key",()=>({
            ...plain,[Symbol("unknown")]:true
        })],

        ["hidden key",()=>Object.defineProperty(
            {...plain},"hidden",{
                value:true,
                enumerable:false
            }
        )],

        ["custom prototype",()=>Object.assign(
            Object.create({unexpected:true}),plain
        )],

        ["array options",()=>Object.assign([],plain)],

        ["undefined append",()=>({
            ...plain,
            append_to_response:undefined
        })],

        ["undefined language",()=>({
            ...plain,
            language:undefined
        })]
    ];

    for (const [name,create] of invalidForms) {
        test("TV rejected options "+name+" "+label,()=>{
            assert.throws(
                ()=>catalog.getDetails(
                    "tv",row.id,create()
                ),
                TypeError
            );
        });
    }
}

for (const row of rows.filter(
    item=>item.language==="en-US"
)) {
    test("TV normalized locale "+row.id,()=>{
        const actual=catalog.getDetails(
            "tv",row.id,{
                language:"EN-us",
                append_to_response:blocks
            }
        );

        const credits=reference.credits.find(
            item=>item.type==="tv" &&
                  item.id===row.id &&
                  item.language==="en-US"
        );

        const aggregate=reference.aggregateCredits.find(
            item=>item.type==="tv" &&
                  item.id===row.id &&
                  item.language==="en-US"
        );

        assert.ok(credits && aggregate);

        assert.equal(
            digest(actual.credits),
            credits.appendedSHA256
        );

        assert.equal(
            digest(actual.aggregate_credits),
            aggregate.appendedSHA256
        );
    });
}

const unknownID=Number.MAX_SAFE_INTEGER;

for (const language of [
    undefined,"ru-RU","en-US"
]) {
    const options=language===undefined
        ? {}
        : {language};

    const label=language??"omitted";

    test("TV unknown ID valid append "+label,()=>{
        assert.equal(
            catalog.getDetails(
                "tv",unknownID,{
                    ...options,
                    append_to_response:blocks
                }
            ),
            null
        );
    });

    test("TV unknown ID invalid append "+label,()=>{
        assert.throws(
            ()=>catalog.getDetails(
                "tv",unknownID,{
                    ...options,
                    append_to_response:"release_dates"
                }
            ),
            RangeError
        );
    });

    test("TV invalid ID precedence "+label,()=>{
        assert.throws(
            ()=>catalog.getDetails(
                "tv",-1,{
                    ...options,
                    append_to_response:"release_dates"
                }
            ),
            TypeError
        );
    });
}
