import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    stages: [
        { duration: "10s", target: 5 },
        { duration: "20s", target: 10 },
        { duration: "10s", target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<800'],
        'checks': ['rate>0.95']
    }
};
const BASE_URL = "https://petstore.swagger.io/v2";

export default function () {
    // Fetch pets by status (available)
    const res = http.get(`${BASE_URL}/pet/findByStatus?status=available`);
    check(res, {
        "Pets by status: 200": (r) => r.status === 200,
        "Pets: array present": (r) => Array.isArray(r.json())
    });
    sleep(1);
}
