import { SharedArray, createOptions, getPayload, expectStatus, assertValue, assertExists, runTestGroup, setup, createApiClient, BASE_URL } from '../../utils/index.js';

const users = new SharedArray('users to create', () => getPayload('users_to_create'));

export const options = createOptions({
  vus: 2,
  iterations: users.length,
});

export default function () {
  const api = createApiClient(BASE_URL);
  setup();
  const user = users[__ITER];

  runTestGroup(`Create User: ${user.name}`, {
    action: () => api.post('/users', user),
    checks: {
      ...expectStatus(201),
      ...assertValue('name', user.name),
      ...assertValue('job', user.job),
      ...assertExists('id'),
    },
  });
}