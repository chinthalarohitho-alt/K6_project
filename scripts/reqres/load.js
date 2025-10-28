import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
    stages: [
        { duration: "5s", target: 5 },   // Ramp up to 5 VUs over 5s
        { duration: "10s", target: 10 }, // Ramp up to 10 VUs over 10s
        { duration: "20s", target: 10 }, // Stay at 10 VUs for 20s
        { duration: "5s", target: 0 },   // Ramp down to 0 VUs over 5s
    ],
    thresholds: {
        'http_req_failed': ['rate<0.01'],    // http errors should be less than 1%
        'http_req_duration': ['p(95)<500'],  // 95% of requests should be below 500ms
        'checks': ['rate>0.99'],             // >99% of checks should pass
    }
};

// Use an environment variable for the base URL, with a default for convenience.
const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    group("Main User Flow", function() {
        // 1. GET list of users
        const listRes = http.get(`${BASE_URL}/users?page=2`);
        check(listRes, {
            "GET /users: status is 200": (r) => r.status === 200,
            "GET /users: response data is an array": (r) => Array.isArray(r.json("data")),
        });

        // 2. POST to create a user
        const userPayload = { name: "Load", job: "Tester" };
        const createPayload = JSON.stringify(userPayload);
        const postRes = http.post(`${BASE_URL}/users`, createPayload, params);
        check(postRes, {
            "POST /users: status is 201": (r) => r.status === 201,
            "POST /users: response contains correct name": (r) => r.json("name") === userPayload.name,
        });

        // 3. GET a single user
        const getRes = http.get(`${BASE_URL}/users/2`);
        check(getRes, {
            "GET /users/{id}: status is 200": (r) => r.status === 200,
            "GET /users/{id}: response contains correct user ID": (r) => r.json("data.id") === 2,
        });

        // 4. PUT to update a user
        const updatePayload = JSON.stringify({ name: "LoadPut", job: "Senior Tester" });
        const putRes = http.put(`${BASE_URL}/users/2`, updatePayload, params);
        check(putRes, { "PUT /users/{id}: status is 200": (r) => r.status === 200 });
    });

    sleep(1); // Pace the iterations
}
