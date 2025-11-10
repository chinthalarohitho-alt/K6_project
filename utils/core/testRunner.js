import { group, check } from "k6";

// A flag to ensure the header is printed only once per test run (per VU 0, iteration 0).

/**
 * A test group runner that provides clear, formatted console output.
 * @param {object} data - The default k6 summary data.
 */
export function runTestGroup(name, { action, checks }) {
  let res;

  group(name, function () {
    res = action();
    const passed = check(res, checks);

    // Determine the status icon and color based on whether the checks passed.
    const statusIcon = passed ? '✔' : '✖';
    const statusText = passed ? 'PASS' : 'FAIL';

    // Log a clean, formatted summary for the test step.
    console.log(` ${statusIcon} ${name}  [${statusText}] - ${res.request.method} ${res.url} (${res.timings.duration.toFixed(2)}ms)`);

    if (!passed) {
      // If the check failed, log the response body for easy debugging.
      let formattedBody = res.body;
      try {
        // Try to parse and pretty-print the JSON body with 2-space indentation.
        formattedBody = JSON.stringify(JSON.parse(res.body), null, 2);
      } catch (e) {
        // If parsing fails, it's not JSON, so we'll use the original body.
      }
      // Indent all lines of the formatted body for clean alignment.
      console.log(`   └─ Failed Check Response:\n   ${formattedBody.replace(/\n/g, '\n   ')}`);
    }
  });

  return res;
}
