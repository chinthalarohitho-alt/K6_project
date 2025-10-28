import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = { vus: 1, iterations: 1, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://dummyjson.com";

export default function () {
    group("Smoke: Health Endpoints", function() {
        const res = http.get(`${BASE_URL}/products`);
        check(res, { "PRODUCTS: status 200": (r) => r.status === 200 });
        const usersRes = http.get(`${BASE_URL}/users`);
        check(usersRes, { "USERS: status 200": (r) => r.status === 200 });
    });
    sleep(1);
}
