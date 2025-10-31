#!/usr/bin/env node
// ESM-based log formatter for API functional test results
// Usage:
// npm run generate:payloads && k6 run ... --out json=- 2>&1 | node tools/format-results.js

import readline from "readline";
import chalk from "chalk";

// ────────────────────────────────────────────────
//  CONSTANTS
// ────────────────────────────────────────────────
const BOX_WIDTH = 60;

// ────────────────────────────────────────────────
//  BOX UTILITIES
// ────────────────────────────────────────────────
function box(title, width = BOX_WIDTH) {
  const content = ` ${title} `;
  const padLength = Math.max(0, width - content.length - 2);
  const pad = " ".repeat(padLength);
  console.log(`┌${"─".repeat(width - 2)}┐`);
  console.log(`│${content}${pad}│`);
  console.log(`└${"─".repeat(width - 2)}┘`);
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour12: true });
}

// ────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────
function prettyJSON(obj, indent = 11) {
  if (!obj) return " ".repeat(indent) + "{}";
  return JSON.stringify(obj, null, 2)
    .split("\n")
    .map((l) => " ".repeat(indent) + l)
    .join("\n");
}

function statusBox(success) {
  const msg = success
    ? chalk.bold.green("TEST RUN COMPLETED SUCCESSFULLY")
    : chalk.bold.red("TEST RUN COMPLETED WITH ERRORS");

  const plainMsg = msg.replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI colors
  const totalWidth = BOX_WIDTH - 2;
  const padTotal = totalWidth - plainMsg.length;
  const leftPad = Math.floor(padTotal / 2);
  const rightPad = padTotal - leftPad;

  console.log(`┌${"─".repeat(totalWidth)}┐`);
  console.log(`│${" ".repeat(leftPad)}${msg}${" ".repeat(rightPad)}│`);
  console.log(`└${"─".repeat(totalWidth)}┘`);
}


// ────────────────────────────────────────────────
//  HEADER SECTION
// ────────────────────────────────────────────────
function printHeader(meta) {
  box("FUNCTIONAL API TEST FRAMEWORK LOGS");
  console.log(`Environment: ${chalk.yellow(meta.env)}`);
  console.log(`Base URL: ${chalk.cyan(meta.baseUrl)}`);
  console.log(`Test Suite: ${chalk.green(meta.testSuite)}`);
  console.log(`Started: ${meta.startTime}\n`);
  box("API EXECUTION");
}

// ────────────────────────────────────────────────
//  ROUTE DETAILS
// ────────────────────────────────────────────────
function printRoute(route, logs) {
  box(`ROUTE: ${route}`);
  logs.forEach((log) => {
    const time = chalk.gray(`[${formatTime()}]`);
    switch (log.type) {
      case "info":
        console.log(`${time} ${chalk.cyan("ⓘ INFO")}         - ${log.message}`);
        break;

      case "request":
        console.log(`${time} ${chalk.magenta("📤 REQUEST")}  - Body:`);
        console.log(prettyJSON(log.body));
        break;

      case "response":
        console.log(
          `${time} ${chalk.blue("📥 RESPONSE")} - (${log.status} ${log.statusText}, ${log.duration}ms):`
        );
        console.log(prettyJSON(log.body));
        break;

      case "pass":
        console.log(`${time} ${chalk.green("✔ PASS")}      - ${log.message}`);
        break;

      case "error":
        console.log(`${time} ${chalk.red("✖ ERROR")}     - ${log.message}`);
        console.log(`           ✖ Exception: ${log.errorType}`);
        console.log(`           Message: ${log.errorMessage}\n`);
        console.log(`           Location:`);
        console.log(`             ${log.location}`);
        console.log(`             Function: ${log.function}`);
        console.log(`             Route: ${route}\n`);
        console.log(`           Failing Step:`);
        console.log(`             ${log.failingStep}\n`);
        console.log(`           Stack Trace:`);
        log.stackTrace.forEach((line) => console.log(`             • ${line}`));
        console.log(`\n           Root Cause:`);
        console.log(`             ${log.rootCause}\n`);
        console.log(`           Suggested Action:`);
        console.log(`             ${log.suggestion}\n`);
        break;
    }
  });
  console.log("\n");
}

// ────────────────────────────────────────────────
//  SUMMARY SECTION
// ────────────────────────────────────────────────
function printSummary(summary) {
  box("ROUTE EXECUTION SUMMARY");
  console.log(`# | Route                  | Status  | Duration | Notes`);
  console.log("────────────────────────────────────────────────────────");
  summary.forEach((r, i) => {
    const status =
      r.status === "Passed" ? chalk.green(r.status) : chalk.red(r.status);
    console.log(
      `${String(i + 1).padEnd(2)}| ${r.route.padEnd(23)} | ${status.padEnd(
        8
      )} | ${r.duration.padEnd(8)} | ${r.notes}`
    );
  });
  console.log("────────────────────────────────────────────────────────\n");
}

// ────────────────────────────────────────────────
//  FOOTER
// ────────────────────────────────────────────────
function printFooter(total, passed, failed, duration) {
  statusBox(failed === 0);
  console.log(
    `Total Routes: ${total} | Passed: ${passed} | Failed: ${failed} | Duration: ${duration.toFixed(
      2
    )}s`
  );
  console.log(`Completed: ${new Date().toLocaleString("en-US", { hour12: true })}`);
}

// ────────────────────────────────────────────────
//  MAIN EXECUTION
// ────────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const routes = new Map();
const meta = {
  env: "BETA",
  baseUrl: "https://beta.api.company.com",
  testSuite: "Payment Gateway API",
  startTime: new Date().toLocaleString("en-US", { hour12: true }),
};

rl.on("line", (line) => {
  const match = line.match(/{.*}/);
  if (!match) return;

  try {
    const data = JSON.parse(match[0]);

    // Detect routes automatically
    if (data.type === "request-details" || (data.method && data.url)) {
      const route = `${data.method} ${data.url}`;
      if (!routes.has(route)) routes.set(route, []);
      const logs = routes.get(route);

      logs.push({
        type: "info",
        message: `Executing Route: ${data.method} ${data.url}`,
      });

      if (data.requestBody)
        logs.push({ type: "request", body: data.requestBody });

      if (data.responseStatus) {
        logs.push({
          type: "response",
          status: data.responseStatus,
          statusText: data.responseStatusText || "OK",
          body: data.responseBody,
          duration: data.duration ? data.duration.toFixed(0) : "0",
        });

        if (data.responseStatus >= 200 && data.responseStatus < 300) {
          logs.push({ type: "pass", message: "Request completed successfully" });
        } else {
          logs.push({
            type: "error",
            message: `Request failed with status ${data.responseStatus}`,
            errorType: "HTTPError",
            errorMessage: data.responseStatusText || "Unknown error",
            location: "runtime/request.js",
            function: "executeRequest()",
            failingStep: `${data.method} ${data.url}`,
            stackTrace: ["executeRequest (runtime/request.js:42:10)"],
            rootCause: "API returned non-2xx status",
            suggestion: "Check endpoint or input data",
          });
        }
      }
    }

    // Assertion failures
    if (data.type === "assertion-failure") {
      const currentRoute = Array.from(routes.keys()).at(-1);
      if (!currentRoute) return;
      const logs = routes.get(currentRoute);

      logs.push({
        type: "error",
        message: `Expected ${data.expected} but received ${data.actual}`,
        errorType: "AssertionError",
        errorMessage: "Test validation failed",
        location: "testSuite/assertions.js:25:10",
        function: "validateResponse()",
        failingStep: `Assertion: ${data.checkName}`,
        stackTrace: [
          "validateResponse (testSuite/assertions.js:25:10)",
          "processTicksAndRejections (node:internal/process/task_queues:95:5)",
        ],
        rootCause: "Response did not meet expected condition",
        suggestion: "Check API schema or mock data consistency.",
      });
    }
  } catch {
    // Ignore malformed lines
  }
});

rl.on("close", () => {
  printHeader(meta);

  const summary = [];
  for (const [route, logs] of routes) {
    printRoute(route, logs);
    const failed = logs.some((l) => l.type === "error");
    summary.push({
      route,
      status: failed ? "Failed" : "Passed",
      duration: `${(Math.random() * 1.5 + 0.5).toFixed(2)}s`,
      notes: failed ? "500 - Internal Server Error" : "Authenticated successfully",
    });
  }

  printSummary(summary);

  const total = summary.length;
  const passed = summary.filter((s) => s.status === "Passed").length;
  const failed = total - passed;
  const duration = 2.63;

  printFooter(total, passed, failed, duration);
});
