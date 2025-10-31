import { group, check } from "k6";

/**
 * Unified test group runner with JSON logging for Node formatter
 */
export function runTestGroup(name, { action, checks }) {
  let res;

  group(name, function () {
    const start = Date.now();
    res = action();
    const duration = Date.now() - start;

    const passed = check(res, checks);

    // ✅ Emit structured JSON for format-results.js
    console.log(JSON.stringify({
      type: "request-details",
      name,
      method: res.request?.method || "UNKNOWN",
      url: res.url || "UNKNOWN",
      requestBody: res.request?.body || null,
      responseStatus: res.status,
      responseStatusText: res.status === 200 ? "OK" : "FAIL",
      responseBody: res.body,
      duration,
      passed
    }));

    if (!passed) {
      console.log(JSON.stringify({
        type: "assertion-failure",
        expected: Object.keys(checks),
        actual: res.status
      }));
    }
  });

  return res;
}
