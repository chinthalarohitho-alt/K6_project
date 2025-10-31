import { createOptions, expectStatus, assertExists, assertValue, runTestGroup, setup, createApiClient, BASE_URL } from '../../utils/index.js';

export const options = createOptions();
const api = createApiClient(BASE_URL);

export default function () {
  setup();
  
  runTestGroup('Successful Login', {
    action: () => api.post('/login', 'user_login_success'),
    checks: {
      ...expectStatus(200),
      ...assertExists('token'),
    }
  });

  runTestGroup('Unsuccessful Login (Missing Password)', {
    action: () => api.post('/login', 'user_login_fail'),
    checks: {
      ...expectStatus(400),
      ...assertValue('error', 'Missing password'),
    }
  });

  runTestGroup('Successful Registration', {
    action: () => api.post('/register', 'user_register_success'),
    checks: {
      ...expectStatus(200),
      ...assertExists('id'),
      ...assertExists('token'),
    }
  });

  runTestGroup('Unsuccessful Registration (Missing Password)', {
    action: () => api.post('/register', 'user_login_fail'),
    checks: {
      ...expectStatus(400),
      ...assertValue('error', 'Missing password'),
    }
  });
}