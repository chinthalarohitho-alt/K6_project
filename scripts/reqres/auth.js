import http from "k6/http";
import { check, group, sleep } from "k6";

// Use an environment variable for the base URL, with a default for convenience.
// k6 run -e BASE_URL=https://my-test-api.com scripts/reqres/auth.js
const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        // The test fails if any of the checks fail.
        'checks': ['rate==1.0'],
    },
};

export default function () {
    const params = { headers: { "Content-Type": "application/json" } };

    group("Authentication - Login", function () {
        const loginSuccessPayload = JSON.stringify({ email: "eve.holt@reqres.in", password: "cityslicka" });
        const loginRes = http.post(`${BASE_URL}/login`, loginSuccessPayload, params);
        check(loginRes, {
            "successful login returns 200": (r) => r.status === 200,
            "successful login response has a token": (r) => typeof r.json("token") === 'string' && r.json("token") !== '',
        });

        const loginFailPayload = JSON.stringify({ email: "eve.holt@reqres.in" });
        const loginFailRes = http.post(`${BASE_URL}/login`, loginFailPayload, params);
        check(loginFailRes, {
            "failed login returns 400": (r) => r.status === 400,
            "failed login response has 'Missing password' error": (r) => r.json("error") === "Missing password",
        });
    });

    group("Authentication - Register", function () {
        const registerSuccessPayload = JSON.stringify({ email: "eve.holt@reqres.in", password: "pistol" });
        const regRes = http.post(`${BASE_URL}/register`, registerSuccessPayload, params);
        check(regRes, {
            "successful register returns 200": (r) => r.status === 200,
            "successful register response has a numeric id and a token": (r) => typeof r.json("id") === 'number' && typeof r.json("token") === 'string',
        });

        const registerFailPayload = JSON.stringify({ email: "sydney@fife" });
        const regFailRes = http.post(`${BASE_URL}/register`, registerFailPayload, params);
        check(regFailRes, {
            "failed register returns 400": (r) => r.status === 400,
            "failed register response has 'Missing password' error": (r) => r.json("error") === "Missing password",
        });
    });

    // Add a short sleep to be a good citizen.
    sleep(1);
}
