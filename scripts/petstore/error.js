import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = { vus: 1, iterations: 2 };
const BASE_URL = "https://petstore.swagger.io/v2";

export default function () {
    group("Error and Negative Cases", function() {
        // Invalid endpoint
        const badRes = http.get(`${BASE_URL}/invalid`);
        check(badRes, { "Invalid endpoint: 404": (r) => r.status === 404 });

        // Invalid POST payload
        const failCreate = http.post(`${BASE_URL}/pet`, JSON.stringify({ foo: "bar" }), {
            headers: { "Content-Type": "application/json" }
        });
        check(failCreate, { "Invalid pet payload: 400/500": (r) => r.status === 400 || r.status === 500 });

        // Delete non-existent pet
        const badDelete = http.del(`${BASE_URL}/pet/0`);
        check(badDelete, { "Delete non-existent pet: 404": (r) => r.status === 404 });
    });
    sleep(1);
}
