import { createOptions, randomString, randomEmail, randomInt, expectStatus, expectBodyToContain, assertValue, runTestGroup, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions();

const api = createApiClient(BASE_URL);

export default function () {
  setup();
  const username = `k6-user-${randomString(8)}`;
  const email = randomEmail();
  const password = 'password123';
  let orderId;

  // === Step 1: Create a User ===
  runTestGroup('Step 1: Create User', {
    action: () => api.post('/user', 'user_petstore', { username, email, password }),
    checks: expectStatus(200),
  });

  // === Step 2: Login as the User ===
  runTestGroup('Step 2: User Login', {
    action: () => api.get(`/user/login?username=${username}&password=${password}`),
    checks: {
      ...expectStatus(200),
      ...expectBodyToContain('logged in user session'),
    },
  });

  // === Step 3: Place an Order for a Pet ===
  const orderRes = runTestGroup('Step 3: Place Order', {
    action: () => {
      const modifications = {
        id: randomInt(1, 10), // Order IDs must be between 1 and 10
        petId: randomInt(1, 1000),
      };
      return api.post('/store/order', 'pet_order', modifications);
    },
    checks: {
      ...expectStatus(200),
      'response has correct ID': (r) => r.json('id') >= 1 && r.json('id') <= 10,
    },
  });
  orderId = orderRes ? orderRes.json('id') : null;
  if (!orderId) {
    return; // Exit iteration if order fails
  }
  

  // === Step 4: Get the Order by ID to Verify ===
  runTestGroup('Step 4: Get Order by ID', {
    action: () => api.get(`/store/order/${orderId}`),
    checks: {
      ...expectStatus(200),
      ...assertValue('id', orderId),
    },
  });
  

  // === Step 5: Logout the User ===
  runTestGroup('Step 5: User Logout', {
    action: () => api.get('/user/logout'),
    checks: expectStatus(200),
  });
}