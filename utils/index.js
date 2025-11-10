// utils/index.js
// Unified import hub for all K6 utilities and framework modules.

import { API_TARGET, ENV, BASE_URL } from '../config/config.js';
import { Trend } from 'k6/metrics';
import { createApiClient as _createApiClient } from './core/apiClient.js';

// A flag to ensure the header is printed only once per test run.
let headerPrinted = false;

/**
 * Logs run metadata once per test execution.
 */
export function setup() {
  // This function is now a placeholder for other setup logic if needed.
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
export { createFunctionalOptions, createLoadOptions } from './options.js';
export { handleSummary } from './core/summary.js';
