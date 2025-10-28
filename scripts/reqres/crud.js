import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        // The test fails if any of the checks fail.
        'checks': ['rate==1.0'],
    },
};

const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";

export default function () {
    const params = { headers: { "Content-Type": "application/json" } };
    let userId;

    group("Create User", function () {
        const userPayload = { name: "John", job: "QA" };
        const createPayload = JSON.stringify(userPayload);
        const createRes = http.post(`${BASE_URL}/users`, createPayload, params);
        check(createRes, {
            "CREATE: status is 201": (r) => r.status === 201,
            "CREATE: response has a non-empty id": (r) => typeof r.json("id") === 'string' && r.json("id") !== '',
            "CREATE: response contains correct name": (r) => r.json("name") === userPayload.name,
        });
        userId = createRes.json("id");
    });

    // Since reqres.in is a mock API, the created user doesn't actually persist.
    // A read on a real API would use the `userId` from the create step (e.g., http.get(`${BASE_URL}/users/${userId}`)).
    group("Read User", function () {
        const readRes = http.get(`${BASE_URL}/users/2`); // Using a known existing user for read
        check(readRes, {
            "READ: status is 200": (r) => r.status === 200,
            "READ: response has data for user 2": (r) => r.json("data.id") === 2,
        });
    });

    group("Update and Delete User", function () {
        if (!userId) return; // Don't proceed if user creation failed

        const updatedUserPayload = { name: "John Updated", job: "QA Lead" };
        const updatePayload = JSON.stringify(updatedUserPayload);
        const updateRes = http.put(`${BASE_URL}/users/${userId}`, updatePayload, params);
        check(updateRes, {
            "UPDATE (PUT): status is 200": (r) => r.status === 200,
            "UPDATE (PUT): response contains updated name": (r) => r.json("name") === updatedUserPayload.name,
        });

        const patchPayload = JSON.stringify({ job: "Principal QA" });
        const patchRes = http.patch(`${BASE_URL}/users/${userId}`, patchPayload, params);
        check(patchRes, {
            "UPDATE (PATCH): status is 200": (r) => r.status === 200,
            "UPDATE (PATCH): response contains updated job": (r) => r.json("job") === "Principal QA",
        });

        const deleteRes = http.del(`${BASE_URL}/users/${userId}`);
        check(deleteRes, { "DELETE: status is 204": (r) => r.status === 204 });
    });

    sleep(1);
}
