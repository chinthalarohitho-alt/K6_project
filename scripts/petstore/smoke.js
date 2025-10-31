import { createOptions, expectStatus, expectBodyNotEmpty, runTestGroup, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions({
  thresholds: {
    'http_req_duration': ['p(95)<500'],
  },
});

const api = createApiClient(BASE_URL);

export default function () {
  setup();
  runTestGroup('Petstore Smoke Test', {
    action: () => api.get('/pet/findByStatus?status=available'),
    checks: {
      ...expectStatus(200),
      ...expectBodyNotEmpty(),
    }
  });
}