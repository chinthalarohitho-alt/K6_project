import http from "k6/http";
import { check, group, sleep, fail } from "k6";

export let options = { vus: 1, iterations: 2, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://petstore.swagger.io/v2";
const PET_PAYLOAD = {
    id: Math.floor(Math.random() * 1000000), // Unique ID per test run
    name: "QA Portfolio Pet",
    category: { id: 1, name: "Dogs" },
    photoUrls: ["http://example.com/photo.jpg"],
    tags: [{ id: 1, name: "QA" }],
    status: "available"
};

export default function () {
    group("Pet CRUD Operations", function() {
        // Create Pet
        const createRes = http.post(`${BASE_URL}/pet`, JSON.stringify(PET_PAYLOAD), {
            headers: { "Content-Type": "application/json" }
        });
        check(createRes, {
            "CREATE: status 200": (r) => r.status === 200,
            "CREATE: pet name": (r) => r.json("name") === PET_PAYLOAD.name
        }) || fail("Pet create failed");
        const petId = createRes.json("id");

        // Read Pet
        const getRes = http.get(`${BASE_URL}/pet/${petId}`);
        check(getRes, {
            "GET: status 200": (r) => r.status === 200,
            "GET: correct pet name": (r) => r.json("name") === PET_PAYLOAD.name
        });

        // Update Pet
        const updatePayload = Object.assign({}, PET_PAYLOAD, { name: "QA Portfolio Pet Updated", status: "sold" });
        const updateRes = http.put(`${BASE_URL}/pet`, JSON.stringify(updatePayload), {
            headers: { "Content-Type": "application/json" }
        });
        check(updateRes, {
            "UPDATE: status 200": (r) => r.status === 200,
            "UPDATE: pet name": (r) => r.json("name") === "QA Portfolio Pet Updated",
            "UPDATE: status set": (r) => r.json("status") === "sold"
        });

        // Delete Pet
        const delRes = http.del(`${BASE_URL}/pet/${petId}`);
        check(delRes, {
            "DELETE: status 200": (r) => r.status === 200,
            "DELETE: message": (r) => r.body.includes("Pet deleted") || r.body.length > 0
        });

        // Negative: get deleted pet
        const getDeleted = http.get(`${BASE_URL}/pet/${petId}`);
        check(getDeleted, { "GET DELETED: 404": (r) => r.status === 404 });
    });
    sleep(1);
}
