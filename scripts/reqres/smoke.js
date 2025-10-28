import http from "k6/http";
import { check, sleep, group, fail } from "k6";

export let options = { vus: 1, iterations: 2, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://dummyjson.com";
const credentials = { username: "kminchelle", password: "0lelplR" }; // Demo creds

export default function () {
    group("AUTH: Login, Token Validation, Logout", function() {
        // Login (POST /auth/login)
        const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credentials), {
            headers: { "Content-Type": "application/json" }
        });
        check(loginRes, { 
            "LOGIN: status 200": (r) => r.status === 200,
            "LOGIN: token exists": (r) => !!r.json("token")
        }) || fail("Login failed");
        const token = loginRes.json("token");

        // Validate token by accessing a protected endpoint
        const meRes = http.get(`${BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        check(meRes, {
            "AUTH/ME: status 200": (r) => r.status === 200,
            "AUTH/ME: username match": (r) => r.json("username") === credentials.username
        });

        // Logout the session with Bearer token
        const logoutRes = http.post(`${BASE_URL}/auth/logout`, null, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        check(logoutRes, { "LOGOUT: status 200": (r) => r.status === 200 });
    });
    sleep(1);
}
