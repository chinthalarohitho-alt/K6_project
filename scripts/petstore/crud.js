import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
    vus: 2,
    iterations: 8,
    thresholds: {
        http_req_failed: ["rate<0.1"], 
        http_req_duration: ["p(95)<1000"], 
    },
};

const BASE_URL = "https://petstore.swagger.io/v2/pet";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    group("Pet CRUD Flow", function() {
        let petId;

        // 1. Create Pet
        petId = Math.floor(Math.random() * 1000000); // Random ID for isolation
        const createPayload = JSON.stringify({
            id: petId,
            name: "TestPet",
            photoUrls: ["https://example.com/photo.jpg"],
            status: "available"
        });
        const createRes = http.post(BASE_URL, createPayload, params);
        check(createRes, {
            "POST /pet returns 200": (r) => r.status === 200,
            "POST /pet response contains correct ID": (r) => r.json("id") === petId,
        });

        // Only proceed if the pet was created successfully
        if (createRes.status !== 200) {
            return; // Exit the current VU iteration
        }

        // 2. Read Pet
        const readRes = http.get(`${BASE_URL}/${petId}`);
        check(readRes, {
            "GET /pet/{petId} returns 200": (r) => r.status === 200,
            "GET /pet/{petId} response contains correct ID": (r) => r.json("id") === petId,
        });

        // 3. Update Pet
        const updatePayload = JSON.stringify({
            id: petId,
            name: "UpdatedPet",
            photoUrls: ["https://example.com/photo2.jpg"],
            status: "sold"
        });
        const updateRes = http.put(BASE_URL, updatePayload, params);
        check(updateRes, {
            "PUT /pet returns 200": (r) => r.status === 200,
            "PUT /pet response contains updated name": (r) => r.json("name") === "UpdatedPet",
            "PUT /pet response contains updated status": (r) => r.json("status") === "sold",
        });

        // 4. Delete Pet
        const deleteRes = http.del(`${BASE_URL}/${petId}`);
        check(deleteRes, {
            "DELETE /pet/{petId} returns 200": (r) => r.status === 200,
        });
    });

    sleep(1);
}
