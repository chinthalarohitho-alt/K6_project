import { check, createOptions, expectStatus, assertExists, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions({
  stages: [
    { duration: '20s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
  },
});

const api = createApiClient(BASE_URL);

export default function () {
  setup();
  const res = api.get('/users?page=2');

  check(res, {
    ...expectStatus(200),
    ...assertExists('data'),
  });

}