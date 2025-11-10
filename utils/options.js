/**
 * This module provides centralized functions to configure k6 options for 'functional' and 'load' tests.
 */

/**
 * Creates k6 options for a standard functional test (single user, single iteration).
 * It merges default functional settings with any test-specific overrides.
 *
 * @param {object} customOptions - Test-specific options to merge with the profile.
 * @returns {object} The final k6 options object.
 */
export function createFunctionalOptions(customOptions = {}) {
  const baseProfile = {
    vus: 1,
    iterations: 1,
    thresholds: {
      'http_req_failed': ['rate<0.01'],
      'http_req_duration': ['p(95)<1500'],
    },
  };
  return {
    ...baseProfile,
    ...customOptions,
    thresholds: {
      ...baseProfile.thresholds,
      ...(customOptions.thresholds || {}),
    },
  };
}

/**
 * Creates k6 options for a load test.
 * It uses VUS and DURATION from environment variables, with defaults of 10 VUs and 30s.
 *
 * @param {object} customOptions - Test-specific options to merge with the profile.
 * @returns {object} The final k6 options object.
 */
export function createLoadOptions(customOptions = {}) {
  // Define different load testing profiles using k6 stages
  const profiles = {
    // Default: A simple load test. Overridden by VUS and DURATION if provided.
    base: {
      vus: __ENV.VUS || 10,
      duration: __ENV.DURATION || '30s',
    },
    // Spike Test: Simulates a sudden, extreme burst of traffic.
    spike: {
      stages: [
        { duration: '10s', target: 20 },   // Ramp-up to a baseline
        { duration: '5s', target: 200 },  // Sudden spike in traffic
        { duration: '10s', target: 20 },  // Recover back to baseline
        { duration: '5s', target: 0 },    // Ramp-down to zero
      ],
    },
    // Stress Test: Steadily ramps up traffic to find the system's limits.
    stress: {
      stages: [
        { duration: '2m', target: 50 },   // Ramp-up to 50 users over 2 minutes
        { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
        { duration: '1m', target: 150 },  // Ramp-up to 150 users over 1 minute
        { duration: '3m', target: 150 },  // Stay at 150 users for 3 minutes
        { duration: '1m', target: 0 },    // Ramp-down to zero
      ],
    },
  };

  // Select the profile from the environment variable, defaulting to 'base'
  const profileName = __ENV.LOAD_PROFILE || 'base';
  const selectedProfile = profiles[profileName] || profiles.base;

  // Common thresholds for all load profiles
  const defaultThresholds = {
    thresholds: {
      'http_req_failed': ['rate<0.01'],
      'http_req_duration': ['p(95)<2000'],
    },
  };

  // Merge the selected profile, default thresholds, and any custom options from the test script
  return {
    ...defaultThresholds,
    ...selectedProfile,
    ...customOptions,
  };
}