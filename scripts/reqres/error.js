import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = { vus: 1, iterations: 2 };
const BASE_URL = "https://dummyjson.com";

export default function () {
    group("ERROR & NEGATIVES", function() {
        // Invalid endpoint
        const badRes = http.get(`${BASE_URL}/invalid-endpoint`);
        check(badRes, { "Invalid Endpoint: 404": (r) => r.status === 404 });

        // Create with invalid payload
        const failCreate = http.post(`${BASE_URL}/products/add`, JSON.stringify({ foo: "bar" }), {
            headers: { "Content-Type": "application/json" }
        });
        check(failCreate, { "Bad Create: 400/422": (r) => r.status === 400 || r.status === 422 });

        // Unauthorized (token required, fake token)
        const badLogout = http.post(`${BASE_URL}/auth/logout`, null, {
            headers: { "Authorization": "Bearer fake-token" }
        });
        check(badLogout, { "Unauthorized logout: 401/403/400": (r) => [400,401,403].includes(r.status) });
    });
    sleep(1);
}
