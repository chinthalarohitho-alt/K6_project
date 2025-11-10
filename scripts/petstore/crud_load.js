import {
  createLoadOptions, // Use the load options function
  randomString,
  expectStatus,
  assertValue,
  runTestGroup,
  assertIsArray,
  assertProperty,
  assertTypeString,
  assertTypeInt,
  setup,
  createApiClient,
  BASE_URL,
} from '../../utils/index.js';

export const options = createLoadOptions(); // Configure for load testing
const api = createApiClient(BASE_URL);

export default function () {
  setup();

  let petId;
  const petName = `K6-Doggie-${randomString(8)}`;

  // === 1. Create Pet (POST) ===
  const createRes = runTestGroup('Step 1: Create Pet', {
    action: () => api.post('/pet', 'pet', { name: petName }),
    checks: {
      ...expectStatus(200),
      ...assertTypeInt('id'),
      ...assertValue('name', petName),
      ...assertTypeString('status'),
      ...assertIsArray('tags'),
    },
  });
  petId = createRes ? createRes.json('id') : null;
  if (!petId) return;

  // === 2. Get Pet by ID (GET) ===
  runTestGroup('Step 2: Get Pet by ID', {
    action: () => api.get(`/pet/${petId}`),
    checks: {
      ...expectStatus(200),
      ...assertValue('id', petId),
    },
  });

  // === 3. Update Pet (PUT) ===
  runTestGroup('Step 3: Update Pet', {
    action: () => api.put('/pet', 'pet', { id: petId, status: 'sold' }),
    checks: {
      ...expectStatus(200),
      ...assertProperty('status', 'sold', 'string'),
    },
  });

  // === 4. Delete Pet (DELETE) ===
  runTestGroup('Step 4: Delete Pet', {
    action: () => api.del(`/pet/${petId}`),
    checks: expectStatus(200),
  });
}