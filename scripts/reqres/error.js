import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        // The test fails if any of the checks fail.
        'checks': ['rate==1.0'],
    },
};

const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";

export default function () {
    const params = { headers: { "Content-Type": "application/json" } };

    group("Error Scenarios - Not Found", function () {
        // 1. Get non-existent user
        const get404 = http.get(`${BASE_URL}/users/999`);
        check(get404, { "GET: non-existent user returns 404": (r) => r.status === 404 });
    });

    group("Error Scenarios - Bad Request", function () {
        // 2. Create with invalid payload (reqres.in still returns 201, but a real API should return 400)
        const badCreatePayload = JSON.stringify({});
        const badCreate = http.post(`${BASE_URL}/users`, badCreatePayload, params);
        check(badCreate, { "POST: empty payload returns 201 (mock) or 400 (real)": (r) => r.status === 201 || r.status === 400 });

        // 3. Update without data (reqres.in still returns 200, but a real API should return 400)
        const badUpdate = http.put(`${BASE_URL}/users/2`, null, params);
        check(badUpdate, { "PUT: null payload returns 200 (mock) or 400 (real)": (r) => r.status === 200 || r.status === 400 });

        // 4. Register with missing password
        const regErrorPayload = JSON.stringify({ email: "eve.holt@reqres.in" });
        const regError = http.post(`${BASE_URL}/register`, regErrorPayload, params);
        check(regError, {
            "POST: register with missing password returns 400": (r) => r.status === 400,
            "POST: register with missing password returns correct error message": (r) => r.json("error") === "Missing password",
        });

        // 5. Unsupported method (PUT on a resource list)
        const wrongMethod = http.put(`${BASE_URL}/users`);
        check(wrongMethod, { "PUT: on resource list returns client error (>=400)": (r) => r.status >= 400 });
    });

    sleep(1);
}
