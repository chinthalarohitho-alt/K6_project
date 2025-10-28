import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { reportHTML } from "https://raw.githubusercontent.com/fziviello/k6-report-html/main/dist/reportHtml.min.js";

export let options = { vus: 1, iterations: 2 }; // 2 iterations per endpoint set

const BASE_URL = "https://petstore.swagger.io/v2";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    let petId;

    group("API Health Check", function() {
        // 1. Health: Get store inventory
        const invRes = http.get(`${BASE_URL}/store/inventory`);
        check(invRes, { "GET /store/inventory returns 200": (r) => r.status === 200 });
    });

    group("Create and Read Pet", function() {
        // 2. Create Pet
        petId = Math.floor(Math.random() * 1000000);
        const createPayload = JSON.stringify({ id: petId, name: "SmokePet", photoUrls: [""], status: "available" });
        const createRes = http.post(`${BASE_URL}/pet`, createPayload, params);
        check(createRes, {
            "POST /pet returns 200": (r) => r.status === 200,
            "POST /pet returns correct pet ID": (r) => r.json("id") === petId,
        });

        // 3. Read Pet
        const readRes = http.get(`${BASE_URL}/pet/${petId}`);
        check(readRes, {
            "GET /pet/{petId} returns 200": (r) => r.status === 200,
            "GET /pet/{petId} returns correct pet ID": (r) => r.json("id") === petId,
        });
    });

    group("Place Order and Cleanup", function() {
        if (!petId) return; // Don't proceed if pet creation failed
        // 4. Place Order
        const orderPayload = JSON.stringify({ petId: petId, quantity: 1, status: "placed", complete: true });
        const orderRes = http.post(`${BASE_URL}/store/order`, orderPayload, params);
        check(orderRes, { "POST /store/order returns 200": (r) => r.status === 200 });

        // 5. Delete Pet
        const delRes = http.del(`${BASE_URL}/pet/${petId}`);
        check(delRes, { "DELETE /pet/{petId} returns 200": (r) => r.status === 200 });
    });

    sleep(1);
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
      title: `Petstore API Smoke Test - ${timestamp}`,
    }),
  };
}