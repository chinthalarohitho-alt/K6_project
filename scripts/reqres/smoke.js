import http from "k6/http";
import { check, group, sleep } from "k6";

export let options = {
    vus: 1,
    iterations: 2, // 2 iterations per endpoint set
    thresholds: {
        // The test fails if any of the checks fail.
        'checks': ['rate==1.0'],
    },
};

const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    group("API Health Check", function() {
        // 1. Health (simulate by getting a list of users)
        const healthRes = http.get(`${BASE_URL}/users?page=1`);
        check(healthRes, { "HEALTH: status is 200": (r) => r.status === 200 });
    });

    group("Basic CRUD Operations", function() {
        // 2. Create user
        const userPayload = { name: "smoke", job: "qa" };
        const createPayload = JSON.stringify(userPayload);
        const createRes = http.post(`${BASE_URL}/users`, createPayload, params);
        check(createRes, {
            "CREATE: status is 201": (r) => r.status === 201,
            "CREATE: response contains a non-empty id": (r) => typeof r.json("id") === 'string' && r.json("id") !== '',
            "CREATE: response contains correct name": (r) => r.json("name") === userPayload.name,
        });
        const userId = createRes.json("id");

        // 3. Get user
        const getRes = http.get(`${BASE_URL}/users/2`);
        check(getRes, { "READ: status is 200": (r) => r.status === 200 });

        // 4. Update user
        if (!userId) return; // Don't proceed if user creation failed
        const updatedUserPayload = { name: "smoke-update", job: "qa lead" };
        const updatePayload = JSON.stringify(updatedUserPayload);
        const updateRes = http.put(`${BASE_URL}/users/${userId}`, updatePayload, params);
        check(updateRes, { "UPDATE: status is 200": (r) => r.status === 200 });

        // 5. Delete user
        const delRes = http.del(`${BASE_URL}/users/${userId}`);
        check(delRes, { "DELETE: status is 204": (r) => r.status === 204 });
    });

    sleep(1);
}
