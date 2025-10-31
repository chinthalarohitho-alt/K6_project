// import { createOptions, randomString, expectStatus, assertValue, assertExists, expectBodyToContain, runTestGroup, assertIsArray, assertProperty, assertTypeString, assertTypeInt, setup, createApiClient, BASE_URL } from '../../utils/index.js';
// export const options = createOptions();
// const api = createApiClient(BASE_URL);

// export default function () {
//   setup();
//   let petId;
//   const petName = `K6-Doggie-${randomString(8)}`;

//   // === 1. Create Pet (POST) ===
//   const createRes = runTestGroup('Step 1: Create Pet', {
//     action: () => api.post('/pet', 'pet', { name: petName }),
//     checks: {
//       ...expectStatus(200),
//       ...assertTypeInt('id'),
//       ...assertValue('name', petName),
//       ...assertTypeString('status'),
//       ...assertIsArray('tags'),
//     },
//   });
//   petId = createRes ? createRes.json('id') : null;
//   if (!petId) {
//     return; // Exit the iteration if pet creation fails
//   }

//   // // === 2. Upload Pet Image (POST with multipart/form-data) ===
//   // runTestGroup('Step 2: Upload Pet Image', {
//   //   action: () => api.uploadImage(`/pet/${petId}/uploadImage`, 'pet_image_data'),
//   //   checks: {
//   //     ...expectStatus(200),
//   //     ...expectBodyToContain('test_pet_image.png'),
//   //   },
//   // });

//   // === 3. Get Pet (GET) ===
//   runTestGroup('Step 3: Get Pet by ID', {
//     action: () => api.get(`/pet/${petId}`),
//     checks: {
//       ...expectStatus(200),
//       ...assertValue('id', petId),
//     },
//   });

//   // === 4. Update Pet (PUT) ===
//   runTestGroup('Step 4: Update Pet', {
//     action: () => api.put('/pet', 'pet', { id: petId, status: 'sold' }),
//     checks: {
//       ...expectStatus(200),
//       ...assertProperty('status', 'sold', 'string'),
//     },
//   });

//   // === 5. Delete Pet (DELETE) ===
//   runTestGroup('Step 5: Delete Pet', {
//     action: () => api.del(`/pet/${petId}`),
//     checks: expectStatus(200),
//   });
// }










import {
  createOptions,
  randomString,
  expectStatus,
  assertValue,
  assertExists,
  expectBodyToContain,
  runTestGroup,
  assertIsArray,
  assertProperty,
  assertTypeString,
  assertTypeInt,
  setup,
  createApiClient,
  BASE_URL,
} from '../../utils/index.js';

export const options = createOptions();
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



