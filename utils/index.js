// utils/index.js
// Unified import hub for all K6 utilities and framework modules.

import { API_TARGET, ENV, BASE_URL } from '../config/config.js';
import { Trend } from 'k6/metrics';
import { createApiClient as _createApiClient } from './core/apiClient.js';

// --- Custom Metrics and Logging ---
const logMetric = new Trend('custom_log', true);
let metadataLogged = false;

/**
 * Logs run metadata once per test execution.
 */
export function setup() {
  if (!metadataLogged && __VU === 1 && __ITER === 0) {
    logMetric.add(1, {
      log_type: 'run_metadata',
      script: __ENV.K6_SCRIPT_NAME,
      api_target: API_TARGET,
      environment: ENV,
    });
    metadataLogged = true;
  }
}

// ✅ Exported API client factory and default instance
export const createApiClient = _createApiClient;
export const api = _createApiClient(BASE_URL);

// ✅ Export shared base URL
export { BASE_URL };

// ✅ Re-export core k6 modules
export { check, group, sleep } from 'k6';
export { SharedArray } from 'k6/data';

// ✅ Re-export framework helpers and utilities
export * from './core/helpers.js';
export { getPayload } from './core/payloads.js';
export * from './core/assertions.js';
export { runTestGroup } from './core/testRunner.js';

// ✅ Default test options
export const defaultOptions = {
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<1500'],
  },
  vus: 1,
  iterations: 1,
};

/**
 * Merges custom test options with framework defaults.
 * @param {object} customOptions - Optional overrides.
 * @returns {object} Final k6 options.
 */
export function createOptions(customOptions = {}) {
  return {
    ...defaultOptions,
    ...customOptions,
    thresholds: {
      ...defaultOptions.thresholds,
      ...(customOptions.thresholds || {}),
    },
  };
}
