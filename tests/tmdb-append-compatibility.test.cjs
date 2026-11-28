"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const {loadCatalog} =
    require("./helpers/tmdb-mock.cjs");

const catalog = loadCatalog();

const dir = path.join(
    __dirname,"fixtures/tmdb/localization"
);

const read = name => JSON.parse(
    fs.readFileSync(path.join(dir,name),"utf8")
);

const baseline = read("append-baseline.json");
const reference = read("append-reference.json");
const translations = read("translations.json");

const digest = value => crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");

const unknownID = Number.MAX_SAFE_INTEGER;

const blocks = {
    movie:[
        "credits","translations","images",
        "videos","keywords","release_dates"
    ],
    tv:[
        "credits","aggregate_credits",
        "translations","images","videos",
        "keywords","content_ratings"
    ]
};

const languages = [
    undefined,"ru-RU","en-US"
];

const opts = language =>
    language === undefined ? {} : {language};

function verify(category,name,fn) {
    test(
        "Compatibility matrix "+category+" "+name,
        fn
    );
}

function expectError(fn,ErrorClass,message) {
    assert.throws(fn,error=>{
        assert.equal(error.constructor,ErrorClass);
        assert.match(error.message,message);
        return true;
    });
}

const invalidMedia = [
    undefined,null,"","Movie","TV",
    "person","episode","season","series",
    1,true,[],{},new String("movie"),
    Symbol("movie")
];

const invalidIDs = [
    undefined,null,0,-1,-910001,1.5,
    NaN,Infinity,-Infinity,
    Number.MAX_SAFE_INTEGER+1,
    "910001","920001","",true,false,
    [],{},910001n,new Number(910001),
    Symbol("id")
];

const invalidOptions = [
    null,0,1,true,false,"","credits",
    [],["credits"],new String("credits"),
    new Date(0),new Map(),new Set(),
    Symbol("options"),()=>({}),
    Object.create({custom:true})
];

const malformedLanguages = [
    undefined,null,"","ru","en",
    "ru_RU","en_US","ru-RUS","eng-US",
    " ru-RU","en-US ","12-34",1,true,
    [],{},new String("ru-RU"),
    Symbol("locale")
];

const unsupportedLanguages = [
    "zz-ZZ","fr-FR","pl-PL","uk-UA",
    "en-GB","ru-US","en-RU"
];

const invalidAppend = [
    undefined,null,0,1,-1,NaN,Infinity,
    true,false,[],{},["credits"],
    new String("credits"),new Date(0),
    new Map(),Symbol("append"),
    ()=>"credits",1n
];

for (const [i,type] of invalidMedia.entries()) {
    verify("invalidMedia",String(i),()=>{
        expectError(
            ()=>catalog.getDetails(type,-1,null),
            TypeError,
            /Unsupported details media type/
        );
    });
}

for (const type of ["movie","tv"]) {
    const id = type==="movie"?910001:920001;

    for (const [i,value] of invalidIDs.entries()) {
        for (const [j,options] of [
            undefined,{},
            {append_to_response:"credits"},
            {append_to_response:"unknown"},
            null
        ].entries()) {
            verify(
                "invalidID",
                [type,i,j].join("/"),
                ()=>expectError(
                    ()=>catalog.getDetails(
                        type,value,options
                    ),
                    TypeError,
                    /Invalid details ID/
                )
            );
        }
    }

    for (const language of languages) {
        const label = [
            type,language??"omitted"
        ].join("/");

        for (const targetID of [id,unknownID]) {
            const target =
                label+"/"+targetID;

            function rejected(
                category,values,ErrorClass,message,
                create,labelFor
            ) {
                for (const [i,value] of
                    values.entries()
                ) {
                    verify(
                        category,
                        target+"/"+labelFor(value,i),
                        ()=>expectError(
                            ()=>catalog.getDetails(
                                type,targetID,
                                create(value)
                            ),
                            ErrorClass,message
                        )
                    );
                }
            }

            rejected(
                "invalidAppend",invalidAppend,
                TypeError,/Invalid append_to_response/,
                value=>({
                    ...opts(language),
                    append_to_response:value
                }),
                (value,i)=>i
            );

            rejected(
                "invalidOptions",invalidOptions,
                TypeError,/Invalid details options/,
                value=>value,
                (value,i)=>i
            );

            rejected(
                "emptyTokens",
                [
                    ",",",credits","credits,",
                    "credits,,images",
                    "credits, ,images",
                    " ","\t","\n",
                    "credits,\t,images"
                ],
                TypeError,/Empty append block/,
                value=>({
                    ...opts(language),
                    append_to_response:value
                }),
                (value,i)=>i
            );

            rejected(
                "unsupportedBlock",
                [
                    "unknown","Credits","CREDITS",
                    "watch/providers",
                    "recommendations","similar",
                    "combined_credits","__proto__",
                    "constructor","prototype",
                    "credits,unknown",
                    ...(type==="movie"
                        ?[
                            "aggregate_credits",
                            "content_ratings"
                        ]
                        :["release_dates"])
                ],
                RangeError,/Unsupported append block/,
                value=>({
                    ...opts(language),
                    append_to_response:value
                }),
                value=>value
            );

            rejected(
                "tokenLimit",[21,22,100],
                RangeError,/Too many append blocks/,
                count=>({
                    ...opts(language),
                    append_to_response:
                        Array(count)
                            .fill("credits")
                            .join(",")
                }),
                count=>count
            );

            const badKeys = [
                ()=>({
                    ...opts(language),
                    append_to_response:"credits",
                    unexpected:true
                }),

                ()=>({
                    ...opts(language),
                    append_to_response:"credits",
                    [Symbol("hidden")]:true
                }),

                ()=>Object.defineProperty(
                    {
                        ...opts(language),
                        append_to_response:"credits"
                    },
                    "hidden",{value:true}
                ),

                ()=>({
                    ...opts(language),
                    append_to_response:"credits",
                    include_image_language:"ru,en,null"
                })
            ];

            rejected(
                "unsupportedOption",badKeys,
                TypeError,/Unsupported details option/,
                create=>create(),
                (value,i)=>i
            );
        }

        for (const value of [
            "",
            "credits",
            blocks[type].join(","),
            Array(20).fill("credits").join(",")
        ]) {
            verify(
                "unknownID",label+"/"+value,
                ()=>assert.equal(
                    catalog.getDetails(
                        type,unknownID,{
                            ...opts(language),
                            append_to_response:value
                        }
                    ),
                    null
                )
            );
        }

        for (const count of [1,19,20]) {
            verify(
                "validTokenBoundary",
                label+"/"+count,
                ()=>assert.deepEqual(
                    catalog.getDetails(type,id,{
                        ...opts(language),
                        append_to_response:
                            Array(count)
                                .fill("credits")
                                .join(",")
                    }),
                    catalog.getDetails(type,id,{
                        ...opts(language),
                        append_to_response:"credits"
                    })
                )
            );
        }
    }

    for (const targetID of [id,unknownID]) {
        for (const [i,language] of
            malformedLanguages.entries()
        ) {
            for (const append of [
                "","credits","unknown"
            ]) {
                verify(
                    "malformedLanguage",
                    [type,targetID,i,append].join("/"),
                    ()=>expectError(
                        ()=>catalog.getDetails(
                            type,targetID,{
                                language,
                                append_to_response:append
                            }
                        ),
                        TypeError,
                        /Invalid details language/
                    )
                );
            }
        }

        for (const language of unsupportedLanguages) {
            for (const append of [
                "","credits","unknown"
            ]) {
                verify(
                    "unsupportedLanguage",
                    [
                        type,targetID,language,append
                    ].join("/"),
                    ()=>expectError(
                        ()=>catalog.getDetails(
                            type,targetID,{
                                language,
                                append_to_response:append
                            }
                        ),
                        RangeError,
                        /Unsupported details language/
                    )
                );
            }
        }
    }
}

for (const row of baseline.protectedDetails) {
    const {type,id,language} = row;

    const label = [
        type,id,language??"omitted"
    ].join("/");

    const options = language===null
        ?{}:{language};

    const legacy = catalog.getDetails(
        type,id,options
    );

    const creditReference =
        reference.credits.find(item=>
            item.type===type &&
            item.id===id &&
            item.language===language
        );

    const aggregateReference = type==="tv"
        ?reference.aggregateCredits.find(item=>
            item.id===id &&
            item.language===language
        )
        :null;

    const translationReference =
        translations.entities.find(item=>
            item.mediaType===type &&
            item.id===id
        );

    assert.ok(creditReference);
    assert.ok(translationReference);

    if (type==="tv") {
        assert.ok(aggregateReference);
    }

    const all = blocks[type].join(",");

    const fullOptions = {
        ...options,
        append_to_response:all
    };

    const forms = [
        ["plain",()=>({...fullOptions})],

        ["frozen",()=>
            Object.freeze({...fullOptions})],

        ["sealed",()=>
            Object.seal({...fullOptions})],

        ["nonextensible",()=>
            Object.preventExtensions({
                ...fullOptions
            })],

        ["nullPrototype",()=>
            Object.assign(
                Object.create(null),fullOptions
            )],

        ["frozenNullPrototype",()=>
            Object.freeze(Object.assign(
                Object.create(null),fullOptions
            ))],

        ["hiddenAllowedProperties",()=>
            Object.defineProperties(
                {},
                Object.fromEntries(
                    Object.entries(fullOptions)
                        .map(([key,value])=>[
                            key,{
                                value,
                                enumerable:false
                            }
                        ])
                )
            )]
    ];

    for (const [name,create] of forms) {
        verify(
            "immutableOptions",
            label+"/"+name,
            ()=>{
                const input = create();

                const descriptors =
                    Object.getOwnPropertyDescriptors(
                        input
                    );

                const prototype =
                    Object.getPrototypeOf(input);

                const actual = catalog.getDetails(
                    type,id,input
                );

                assert.equal(
                    digest(actual.credits),
                    creditReference.appendedSHA256
                );

                assert.deepEqual(
                    actual.translations,
                    {
                        translations:
                            translationReference.translations
                    }
                );

                const restored =
                    structuredClone(actual);

                restored.credits = legacy.credits;

                if (type==="tv") {
                    assert.equal(
                        digest(actual.aggregate_credits),
                        aggregateReference.appendedSHA256
                    );

                    restored.aggregate_credits =
                        legacy.aggregate_credits;
                }

                delete restored.translations;

                assert.equal(
                    digest(restored),row.sha256
                );

                assert.deepEqual(
                    Object.getOwnPropertyDescriptors(
                        input
                    ),
                    descriptors
                );

                assert.equal(
                    Object.getPrototypeOf(input),
                    prototype
                );
            }
        );
    }

    if (language!==null) {
        const variants = language==="ru-RU"
            ?["RU-ru","rU-Ru","RU-RU","ru-ru"]
            :["EN-us","eN-Us","EN-US","en-us"];

        for (const variant of variants) {
            verify(
                "localeNormalization",
                label+"/"+variant,
                ()=>assert.deepEqual(
                    catalog.getDetails(type,id,{
                        language:variant,
                        append_to_response:all
                    }),
                    catalog.getDetails(
                        type,id,fullOptions
                    )
                )
            );
        }
    }

    verify("appendPermutation",label,()=>{
        assert.deepEqual(
            catalog.getDetails(type,id,{
                ...options,
                append_to_response:
                    [...blocks[type]]
                        .reverse()
                        .map(value=>" \t"+value+"\n ")
                        .join(",")
            }),
            catalog.getDetails(
                type,id,fullOptions
            )
        );
    });

    verify("crossMethodIsolation",label,()=>{
        const changed = catalog.getDetails(
            type,id,fullOptions
        );

        changed.credits.cast.push({id:-1});
        changed.credits.crew.push({id:-1});

        if (changed.credits.cast.length>1) {
            changed.credits.cast[0].name =
                "MUTATED";
        }

        changed.translations.translations.push({
            syntheticMutation:true
        });

        if (type==="tv") {
            const aggregate =
                changed.aggregate_credits;

            if (aggregate.cast.length) {
                aggregate.cast[0].roles.push({
                    character:"MUTATED"
                });
            }

            if (aggregate.crew.length) {
                aggregate.crew[0].jobs.push({
                    job:"MUTATED"
                });
            }

            aggregate.cast.push({id:-1});
            changed.created_by.push({id:-1});

            assert.equal(
                digest(catalog.getAggregateCredits(
                    id,options
                )),
                aggregateReference.standaloneSHA256
            );

            assert.deepEqual(
                catalog.getCreatedBy(id),
                legacy.created_by
            );
        }

        assert.equal(
            digest(catalog.getCredits(
                type,id,options
            )),
            creditReference.standaloneSHA256
        );

        assert.equal(
            digest(catalog.getDetails(
                type,id,options
            )),
            row.sha256
        );

        const fresh = catalog.getDetails(
            type,id,fullOptions
        );

        assert.equal(
            digest(fresh.credits),
            creditReference.appendedSHA256
        );

        assert.deepEqual(
            fresh.translations,
            {
                translations:
                    translationReference.translations
            }
        );

        if (type==="tv") {
            assert.equal(
                digest(fresh.aggregate_credits),
                aggregateReference.appendedSHA256
            );
        }
    });
}

const methods = [
    ["Movie Credits","getCredits",["movie",910001]],
    ["TV Credits","getCredits",["tv",920001]],
    ["TV Aggregate","getAggregateCredits",[920001]],
    ["TV CreatedBy","getCreatedBy",[920001]]
];

for (const [label,method,args] of methods) {
    for (const language of languages) {
        for (const append of [
            "","credits","translations",
            undefined,null,"unknown"
        ]) {
            verify(
                "detailsOnly",
                label+"/"+language+"/"+String(append),
                ()=>expectError(
                    ()=>catalog[method](
                        ...args,{
                            ...opts(language),
                            append_to_response:append
                        }
                    ),
                    TypeError,
                    /Unsupported details option/
                )
            );
        }
    }

    const unknownArgs = [...args];

    unknownArgs[unknownArgs.length-1] =
        unknownID;

    verify(
        "historicalUnknownIDPrecedence",
        label,
        ()=>assert.equal(
            catalog[method](
                ...unknownArgs,
                {append_to_response:"unknown"}
            ),
            null
        )
    );
}
