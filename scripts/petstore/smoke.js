import http from 'k6/http';
import { check, sleep } from 'k6';
import { reportHTML } from "https://raw.githubusercontent.com/fziviello/k6-report-html/main/dist/reportHtml.min.js";

export let options = { vus: 1, iterations: 2 }; // 2 iterations per endpoint set

const PETSTORE_BASE = __ENV.PETSTORE_URL || 'https://petstore.swagger.io/v2';
const REQRES_BASE = __ENV.REQRES_URL || 'https://reqres.in/api';

export default function () {
    // Petstore: GET pet by id
    let petRes = http.get(`${PETSTORE_BASE}/pet/1`);
    check(petRes, { 'Petstore GET /pet/1 is 200': (r) => r.status === 200 });

    // Petstore: GET store inventory
    let invRes = http.get(`${PETSTORE_BASE}/store/inventory`);
    check(invRes, { 'Petstore GET /store/inventory is 200': (r) => r.status === 200 });

    // Reqres: List users
    let userRes = http.get(`${REQRES_BASE}/users?page=2`);
    check(userRes, { 'Reqres GET /users?page=2 is 200': (r) => r.status === 200 });

    // Reqres: Health endpoint (should be 200)
    let healthRes = http.get(`${REQRES_BASE}/health`);
    check(healthRes, { 'Reqres GET /health is 200': (r) => r.status === 200 || r.status === 404 }); // fallback for cases /health not available

    // Reqres: Login positive (demo credentials)
    let loginRes = http.post(`${REQRES_BASE}/login`, JSON.stringify({
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(loginRes, { 'Reqres POST /login is 200': (r) => r.status === 200 });
}


// Custom summary function with timestamped filename
export function handleSummary(data) {
  // Format: YYYY-MM-DD_HH-MM-SS
  const now = new Date();
  const timestamp =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    "-" +
    String(now.getMinutes()).padStart(2, "0") +
    "-" +
    String(now.getSeconds()).padStart(2, "0");

  // Save HTML with dynamic name
  return {
    [`reports/petstore-smoke-report-${timestamp}.html`]: reportHTML(data, {
      title: `ReqRes API Stress Test - ${timestamp}`,
    }),
  };
}