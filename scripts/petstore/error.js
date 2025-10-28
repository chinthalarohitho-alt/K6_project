import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
    vus: 1,
    iterations: 4,
};

const BASE_URL = "https://petstore.swagger.io/v2";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    group("Error Scenarios - Not Found", function() {
        // 1. Read a non-existent pet
        const notFoundId = 999999999;
        const notFoundRes = http.get(`${BASE_URL}/pet/${notFoundId}`);
        check(notFoundRes, {
            "GET non-existent pet returns 404": (r) => r.status === 404,
        });
    });

    group("Error Scenarios - Bad Request / Server Error", function() {
        // 2. Try to update with an invalid data model
        const invalidUpdatePayload = JSON.stringify({ foo: "bar" }); // Invalid model
        const invalidUpdateRes = http.put(`${BASE_URL}/pet`, invalidUpdatePayload, params);
        check(invalidUpdateRes, {
            "PUT with invalid model returns 400": (r) => r.status === 400,
        });

        // 3. Create with missing required fields (Petstore API returns 500 for this)
        const missingFieldsPayload = JSON.stringify({ name: "MissingId" }); // 'id' is required
        const badCreateRes = http.post(`${BASE_URL}/pet`, missingFieldsPayload, params);
        check(badCreateRes, {
            "POST with missing required fields returns 500": (r) => r.status === 500,
        });
    });

    group("Error Scenarios - Method Not Allowed", function() {
        // 4. Use an invalid HTTP method on an endpoint
        const invalidMethodRes = http.patch(`${BASE_URL}/pet/1`);
        check(invalidMethodRes, {
            "PATCH on /pet/{petId} returns 405": (r) => r.status === 405,
        });
    });

    sleep(1);
}
