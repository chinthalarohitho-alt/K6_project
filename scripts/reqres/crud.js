import { createOptions, randomInt, expectStatus, assertValue, assertExists, runTestGroup, assertTypeInt, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions();

export default function () {
  const api = createApiClient(BASE_URL);
  setup();
  let userId;
  const randomUserId = randomInt(1, 12);

  // === 1. Create User (POST) ===
  const createRes = runTestGroup('Step 1: Create User', {
    action: () => api.post('/users', 'user_create'),
    checks: {
      ...expectStatus(201),
      ...assertExists('id'),
      ...assertValue('name', 'morpheus'),
    },
  });
  userId = createRes ? createRes.json('id') : null;
  if (!userId) {
    // We don't exit here because subsequent steps use a different, random user ID.
  }

  // === 2. Get User (GET) ===
  runTestGroup('Step 2: Get Single User', {
    action: () => api.get(`/users/${randomUserId}`),
    checks: {
      ...expectStatus(200),
      ...assertValue('data.id', randomUserId),
      ...assertTypeInt('data.id'),
    },
  });

  // === 3. Update User (PUT) ===
  runTestGroup('Step 3: Update User', {
    action: () => api.put(`/users/${randomUserId}`, 'user_update'),
    checks: {
      ...expectStatus(200),
      ...assertValue('job', 'zion resident'),
    },
  });

  // === 4. Delete User (DELETE) ===
  runTestGroup('Step 4: Delete User', {
    action: () => api.del(`/users/${randomUserId}`),
    checks: expectStatus(204),
  });
}