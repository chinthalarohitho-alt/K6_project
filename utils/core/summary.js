import { textSummary } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

/**
 * A custom summary handler for k6 that prints a detailed report of failed steps.
 * This function is automatically called by k6 at the end of a test run.
 * @param {object} data - The default k6 summary data.
 * @returns {object} The original data, to not interfere with other summaries.
 */

// An array to store details of failed test groups.
export const failures = [];

export function handleSummary(data) {  
  let output = '';

  // If data is undefined (which can happen on script errors), don't crash.
  if (!data) {
    output += '\nCould not generate k6 summary report due to a script error.\n';
  } else {
    // Add K6 Summary Report header
    output += '\n--------------------------- K6 Summary Report ---------------------------\n\n';

    // Generate the default k6 summary.
    output += textSummary(data, { indent: ' ', enableColors: false });

    // Check for and display threshold failures (only if metrics exist)
    if (data.metrics && typeof data.metrics === 'object') {
      const thresholdFailures = Object.keys(data.metrics).filter(
        (metricName) => data.metrics[metricName].thresholds && Object.values(data.metrics[metricName].thresholds).some(t => !t.ok)
      );
      
      if (thresholdFailures.length > 0) {
        output += '\n\n❗ PERFORMANCE THRESHOLDS CROSSED\n';
        thresholdFailures.forEach(metricName => {
          output += `  - Metric: ${metricName}\n`;
        });
      }
    }
  }

  // Return the default text summary to be printed to stdout.
  return { 'stdout': output };
}