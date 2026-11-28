"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const ROOT = path.resolve(__dirname, "../..");
const ORIGIN = "http://127.0.0.1:4173";

const FIXTURE_URL = ORIGIN + "/__smoke_fixture__";

const FIXTURE_HTML = `<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1">
    <title>Moven Smoke Fixture</title>
</head>
<body>
    <button id="action">Test action</button>
    <output id="result">initial</output>

    <script>
        document.getElementById("action")
            .addEventListener("click", function () {
                document.getElementById("result")
                    .textContent = "clicked";
            });

        window.smokeReady = true;
    </script>
</body>
</html>`;

async function openFixture(page) {
    await page.route("**/*", async route => {
        if (route.request().url() === FIXTURE_URL) {
            await route.fulfill({
                status: 200,
                contentType: "text/html; charset=utf-8",
                body: FIXTURE_HTML
            });

            return;
        }

        await route.abort("blockedbyclient");
    });

    const response = await page.goto(FIXTURE_URL);

    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);

    await expect(page).toHaveTitle(
        "Moven Smoke Fixture"
    );
}

test("SMOKE-01 server health", async ({ request }) => {
    const response = await request.get("/__health", {
        maxRedirects: 0
    });

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data.status).toBe("ok");
    expect(data.service).toBe("moven-test-server");
});

test("SMOKE-02 application index", async ({ request }) => {
    const response = await request.get("/", {
        maxRedirects: 0
    });

    expect(response.status()).toBe(200);

    expect(response.headers()["content-type"])
        .toContain("text/html");

    const actual = await response.body();

    const expected = fs.readFileSync(
        path.join(ROOT, "index.html")
    );

    expect(actual.equals(expected)).toBe(true);
});

test("SMOKE-03 application resources", async ({ request }) => {
    const resources = [
        "collections.js",
        "series-hub.js",
        "series-page.js",
        "film-card.js",
        "app-theme.css",
        "moven.webmanifest",
        "assets/vendor/tailwind.min.css",
        "assets/vendor/three-r128.min.js"
    ];

    for (const resource of resources) {
        const response = await request.get(
            "/" + resource,
            { maxRedirects: 0 }
        );

        expect(response.status(), resource).toBe(200);

        const actual = await response.body();

        const expected = fs.readFileSync(
            path.join(ROOT, resource)
        );

        expect(
            actual.equals(expected),
            resource
        ).toBe(true);
    }
});

test("SMOKE-04 browser JavaScript", async ({ page }) => {
    await openFixture(page);

    expect(
        await page.evaluate(() => window.smokeReady)
    ).toBe(true);

    expect(
        await page.evaluate(() => 6 * 7)
    ).toBe(42);
});

test("SMOKE-05 interaction and DOM", async ({ page }) => {
    await openFixture(page);

    await expect(
        page.locator("#result")
    ).toHaveText("initial");

    await page.locator("#action").click();

    await expect(
        page.locator("#result")
    ).toHaveText("clicked");
});

test("SMOKE-06 isolated local storage", async ({ page }) => {
    await openFixture(page);

    const key = "moven-smoke-test";

    expect(
        await page.evaluate(
            key => localStorage.getItem(key),
            key
        )
    ).toBeNull();

    await page.evaluate(
        key => localStorage.setItem(key, "test-value"),
        key
    );

    await page.reload();

    expect(
        await page.evaluate(
            key => localStorage.getItem(key),
            key
        )
    ).toBe("test-value");

    await page.evaluate(
        key => localStorage.removeItem(key),
        key
    );

    expect(
        await page.evaluate(
            key => localStorage.getItem(key),
            key
        )
    ).toBeNull();
});

test("SMOKE-07 mock API response", async ({ page }) => {
    await openFixture(page);

    let intercepted = 0;

    const apiURL = ORIGIN + "/__smoke_api__";

    await page.route(apiURL, async route => {
        intercepted++;

        await route.fulfill({
            status: 200,
            json: {
                results: [
                    { id: 1, title: "Test Movie" }
                ]
            }
        });
    });

    const result = await page.evaluate(
        async url => {
            const response = await fetch(url);

            return {
                status: response.status,
                data: await response.json()
            };
        },
        apiURL
    );

    expect(result.status).toBe(200);

    expect(result.data.results).toEqual([
        { id: 1, title: "Test Movie" }
    ]);

    expect(intercepted).toBe(1);
});

test("SMOKE-08 external network blocked", async ({ page }) => {
    await openFixture(page);

    let blocked = 0;

    const externalURL =
        "https://example.invalid/moven-smoke";

    await page.route(externalURL, async route => {
        blocked++;

        await route.abort("blockedbyclient");
    });

    const result = await page.evaluate(
        async url => {
            try {
                await fetch(url);
                return "unexpected-success";
            } catch {
                return "blocked";
            }
        },
        externalURL
    );

    expect(result).toBe("blocked");
    expect(blocked).toBe(1);
});
