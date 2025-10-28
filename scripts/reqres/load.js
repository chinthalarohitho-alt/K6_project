import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    stages: [
        { duration: "10s", target: 5 },
        { duration: "20s", target: 10 },
        { duration: "10s", target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<600'],
        'checks': ['rate>0.95']
    }
};
const BASE_URL = "https://dummyjson.com";

export default function () {
    const res = http.get(`${BASE_URL}/products`);
    check(res, {
        "LOAD: status 200": (r) => r.status === 200,
        "LOAD: products": (r) => Array.isArray(r.json("products"))
    });
    sleep(1);
}
