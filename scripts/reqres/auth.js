import http from "k6/http";
import { check, sleep, group, fail } from "k6";

export let options = { vus: 1, iterations: 2, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://dummyjson.com";
const VALID_USER = { username: "kminchelle", password: "0lelplR" };

export default function () {
    group("AUTH: Login, Token Validation, Logout, Negative Cases", function() {
        // Valid login
        const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(VALID_USER), {
            headers: { "Content-Type": "application/json" }
        });
        check(loginRes, {
            "LOGIN: status 200": (r) => r.status === 200,
            "LOGIN: token exists": (r) => !!r.json("token"),
            "LOGIN: returned user": (r) => r.json("username") === VALID_USER.username
        }) || fail(`Login failed: ${loginRes.status} - ${loginRes.body}`);
        const token = loginRes.json("token");

        // Token validation
        const userRes = http.get(`${BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        check(userRes, {
            "TOKEN VALID: 200": (r) => r.status === 200,
            "TOKEN VALID: user is correct": (r) => r.json("username") === VALID_USER.username
        });

        // Logout (Bearer required)
        const logoutRes = http.post(`${BASE_URL}/auth/logout`, null, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        check(logoutRes, { "LOGOUT: status 200": (r) => r.status === 200 });

        // Negative: Bad login
        const badLogin = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ username: "foo", password: "bar" }), {
            headers: { "Content-Type": "application/json" }
        });
        check(badLogin, { "LOGIN INVALID: 400": (r) => r.status === 400 });
    });
    sleep(1);
}
