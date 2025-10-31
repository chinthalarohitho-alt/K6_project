import { check, sleep, createOptions, expectStatus, expectResponseIsArray, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions({
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_reqs{status:200}': ['count>100'],
  },
});

const api = createApiClient(BASE_URL);

export default function () {
  setup();
  const res = api.get('/pet/findByStatus?status=available');

  check(res, {
    ...expectStatus(200),
    ...expectResponseIsArray(),
  });

  sleep(1);
}