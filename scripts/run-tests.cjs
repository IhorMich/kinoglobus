"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { performance } = require("node:perf_hooks");

const ROOT = path.resolve(__dirname, "..");
const TEST_DIR = path.join(ROOT, "tests");
const REPORT_DIR = path.join(ROOT, "test-results");
const TIMEOUT_MS = 120000;

const args = process.argv.slice(2);
const syntaxOnly = args.includes("--syntax-only");

if (args.some(arg => arg !== "--syntax-only")) {
    console.error("Unknown test runner argument");
    process.exit(2);
}

function discoverTests() {
    return fs.readdirSync(TEST_DIR, {
        withFileTypes: true
    })
        .filter(entry =>
            entry.isFile() && entry.name.endsWith(".cjs")
        )
        .map(entry => path.join(TEST_DIR, entry.name))
        .sort();
}

function execute(file, syntax = false) {
    const start = performance.now();

    const run = spawnSync(
        process.execPath,
        syntax ? ["--check", file] : [file],
        {
            cwd: ROOT,
            encoding: "utf8",
            timeout: TIMEOUT_MS,
            maxBuffer: 16 * 1024 * 1024
        }
    );

    const status = run.error?.code === "ETIMEDOUT"
        ? "TIMEOUT"
        : run.status === 0 && !run.error
            ? "PASS"
            : "FAIL";

    return {
        status,
        exitCode: run.status,
        signal: run.signal,
        elapsedMs: Number(
            (performance.now() - start).toFixed(2)
        ),
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        error: run.error?.message || null
    };
}

function commit() {
    const result = spawnSync(
        "git",
        ["rev-parse", "HEAD"],
        { cwd: ROOT, encoding: "utf8" }
    );

    return result.status === 0
        ? result.stdout.trim()
        : null;
}

function main() {
    const startedAt = new Date().toISOString();
    const start = performance.now();
    const files = discoverTests();
    const results = [];

    console.log("========================================");
    console.log("MOVEN AUTOMATED TEST RUNNER");
    console.log("========================================");
    console.log("Node:", process.version);
    console.log("Commit:", commit());
    console.log("Mode:", syntaxOnly ? "syntax" : "full");
    console.log("Discovered test files:", files.length);

    for (const [index, file] of files.entries()) {
        const name = path.relative(ROOT, file);

        console.log(
            `\n[${index + 1}/${files.length}] ${name}`
        );

        const syntax = execute(file, true);
        let execution = null;

        console.log("Syntax:", syntax.status);

        if (syntax.status === "PASS" && !syntaxOnly) {
            execution = execute(file);
        }

        const result = {
            file: name,
            status: execution
                ? execution.status
                : syntax.status,
            syntax,
            execution
        };

        for (const phase of [syntax, execution]) {
            if (!phase) continue;
            if (phase.stdout) console.log(phase.stdout.trim());
            if (phase.stderr) console.error(phase.stderr.trim());
            if (phase.error) console.error(phase.error);
        }

        console.log("RESULT:", result.status);
        results.push(result);
    }

    const passed = results.filter(
        result => result.status === "PASS"
    ).length;

    const failed = results.filter(
        result => result.status === "FAIL"
    ).length;

    const timeouts = results.filter(
        result => result.status === "TIMEOUT"
    ).length;

    const success = files.length > 0
        && passed === files.length;

    const report = {
        schemaVersion: 1,
        runnerVersion: "1.0.0",
        startedAt,
        finishedAt: new Date().toISOString(),
        commit: commit(),
        node: process.version,
        platform: process.platform,
        architecture: process.arch,
        mode: syntaxOnly ? "syntax" : "full",
        totalFiles: files.length,
        passedFiles: passed,
        failedFiles: failed,
        timeouts,
        successRate: files.length
            ? Number((passed / files.length * 100).toFixed(2))
            : 0,
        elapsedMs: Number(
            (performance.now() - start).toFixed(2)
        ),
        success,
        results
    };

    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const reportPath = path.join(
        REPORT_DIR,
        syntaxOnly ? "syntax-latest.json" : "latest.json"
    );

    const temporaryPath = reportPath + "." + process.pid + ".tmp";

    try {
        fs.writeFileSync(
            temporaryPath,
            JSON.stringify(report, null, 2) + "\n",
            { mode: 0o600 }
        );

        fs.renameSync(temporaryPath, reportPath);
    } finally {
        if (fs.existsSync(temporaryPath)) {
            fs.unlinkSync(temporaryPath);
        }
    }

    console.log("\n========== SUMMARY ==========");
    console.log("Test files:", files.length);
    console.log("Passed:", passed);
    console.log("Failed:", failed);
    console.log("Timeouts:", timeouts);
    console.log("Success rate:", report.successRate + "%");
    console.log("Elapsed:", report.elapsedMs + " ms");
    console.log("Report:", reportPath);
    console.log(success ? "SUCCESS" : "FAILURE");

    process.exitCode = success ? 0 : 1;
}

try {
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
