"use strict";

const {test}=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");

const {loadCatalog}=require("./helpers/tmdb-mock.cjs");

const catalog=loadCatalog();

const directory=path.join(
    __dirname,"fixtures/tmdb/localization"
);

const baseline=JSON.parse(
    fs.readFileSync(
        path.join(directory,"append-baseline.json"),
        "utf8"
    )
);

const reference=JSON.parse(
    fs.readFileSync(
        path.join(directory,"append-reference.json"),
        "utf8"
    )
);

const digest=value=>crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");

const movieRows=baseline.protectedDetails.filter(
    row=>row.type==="movie"
);

assert.equal(movieRows.length,108);

for (const row of movieRows) {
    const label=row.id+"/"+(row.language??"omitted");

    const options=row.language===null
        ? {}
        : {language:row.language};

    test("Movie explicit legacy options "+label,()=>{
        assert.equal(
            digest(catalog.getDetails(
                "movie",row.id,options
            )),
            row.sha256
        );
    });

    test("Movie null prototype legacy "+label,()=>{
        const opts=Object.assign(
            Object.create(null),options
        );

        assert.equal(
            digest(catalog.getDetails(
                "movie",row.id,opts
            )),
            row.sha256
        );
    });

    test("Movie null prototype append "+label,()=>{
        const opts=Object.assign(
            Object.create(null),
            options,
            {append_to_response:"credits"}
        );

        const expected=reference.credits.find(
            item=>item.type==="movie" &&
                  item.id===row.id &&
                  item.language===row.language
        );

        assert.ok(expected);

        const result=catalog.getDetails(
            "movie",row.id,opts
        );

        assert.equal(
            digest(result.credits),
            expected.appendedSHA256
        );
    });

    test("Movie custom prototype rejected "+label,()=>{
        const opts=Object.assign(
            Object.create({custom:true}),
            options,
            {append_to_response:"credits"}
        );

        assert.throws(
            ()=>catalog.getDetails(
                "movie",row.id,opts
            ),
            TypeError
        );
    });

    test("Movie own undefined append rejected "+label,()=>{
        assert.throws(
            ()=>catalog.getDetails(
                "movie",row.id,{
                    ...options,
                    append_to_response:undefined
                }
            ),
            TypeError
        );
    });

    test("Movie symbol option rejected "+label,()=>{
        assert.throws(
            ()=>catalog.getDetails(
                "movie",row.id,{
                    ...options,
                    append_to_response:"credits",
                    [Symbol("unknown")]:true
                }
            ),
            TypeError
        );
    });

    test("Movie frozen legacy options "+label,()=>{
        const opts=Object.freeze({...options});

        assert.equal(
            digest(catalog.getDetails(
                "movie",row.id,opts
            )),
            row.sha256
        );
    });
}

for (const row of movieRows.filter(
    row=>row.language==="en-US"
)) {
    test("Movie normalized locale "+row.id,()=>{
        const result=catalog.getDetails(
            "movie",row.id,{
                language:"EN-us",
                append_to_response:"credits"
            }
        );

        const expected=reference.credits.find(
            item=>item.type==="movie" &&
                  item.id===row.id &&
                  item.language==="en-US"
        );

        assert.ok(expected);

        assert.equal(
            digest(result.credits),
            expected.appendedSHA256
        );
    });
}

test("Movie unknown ID with valid append",()=>{
    assert.equal(
        catalog.getDetails("movie",999999999,{
            append_to_response:"credits"
        }),
        null
    );
});
