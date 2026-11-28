"use strict";

const {
    defineConfig,
    devices
} = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/e2e",

    testMatch: "**/*.spec.cjs",

    fullyParallel: false,

    forbidOnly: true,

    retries: 0,

    workers: 1,

    timeout: 30000,

    expect: {
        timeout: 5000
    },

    outputDir: "./test-results/playwright/artifacts",

    reporter: [
        ["list"],
        [
            "html",
            {
                outputFolder: "./playwright-report",
                open: "never"
            }
        ],
        [
            "json",
            {
                outputFile:
                    "./test-results/playwright/results.json"
            }
        ]
    ],

    use: {
        baseURL: "http://127.0.0.1:4173",

        browserName: "chromium",

        headless: true,

        locale: "ru-RU",

        timezoneId: "Europe/Warsaw",

        serviceWorkers: "block",

        actionTimeout: 10000,

        navigationTimeout: 15000,

        screenshot: "only-on-failure",

        video: "retain-on-failure",

        trace: "retain-on-failure"
    },

    projects: [
        {
            name: "mobile-samsung",

            use: {
                ...devices["Galaxy S24"],
                browserName: "chromium"
            }
        },

        {
            name: "mobile-pixel",

            use: {
                ...devices["Pixel 7"],
                browserName: "chromium"
            }
        },

        {
          name: "tablet-samsung",
          use: {
            ...devices["Galaxy Tab S9"],
            browserName: "chromium"
          }
        },
        {
          name: "tablet-samsung-landscape",
          use: {
            ...devices["Galaxy Tab S9 landscape"],
            browserName: "chromium"
          }
        },
        {
          name: "mobile-iphone",
          use: {
            ...devices["iPhone 16 Pro"],
            browserName: "webkit"
          }
        },
        {
          name: "tablet-ipad",
          use: {
            ...devices["iPad Pro 11"],
            browserName: "webkit"
          }
        },
        {
          name: "tablet-ipad-landscape",
          use: {
            ...devices["iPad Pro 11 landscape"],
            browserName: "webkit"
          }
        },
        {
            name: "desktop-chromium",

            use: {
                ...devices["Desktop Chrome"],

                browserName: "chromium",

                viewport: {
                    width: 1280,
                    height: 800
                }
            }
        }
    ],

    webServer: {
        command: "node scripts/test-server.cjs",

        url: "http://127.0.0.1:4173/__health",

        reuseExistingServer: false,

        timeout: 30000,

        gracefulShutdown: {
            signal: "SIGTERM",
            timeout: 5000
        },

        stdout: "pipe",

        stderr: "pipe"
    }
});
