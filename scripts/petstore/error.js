import { createOptions, expectStatus, randomInt, runTestGroup, setup, createApiClient, BASE_URL } from '../../utils/index.js';
export const options = createOptions();

const api = createApiClient(BASE_URL);

export default function () {
  setup();

  // === Test Case 1: Get a non-existent pet (expect 404) ===
  runTestGroup('Get Non-Existent Pet', {
    action: () => api.get(`/pet/${randomInt(1000000, 9999999)}`),
    checks: expectStatus(404),
  });

  // === Test Case 2: Send an invalid request body (expect 500 from this specific API) ===
  runTestGroup('Create Pet with Invalid Payload', {
    action: () => api.post('/pet', 'pet_invalid'),
    checks: expectStatus(500),
  });

  // === Test Case 3: Demonstrate passing custom headers via the API client ===
  runTestGroup('Get Non-Existent Pet with Custom Header', {
    action: () => api.get(`/pet/${randomInt(1000000, 9999999)}`, {headers: { 'X-Test-Header': 'My-Custom-Value' } }),
    checks: expectStatus(404)
  });

}