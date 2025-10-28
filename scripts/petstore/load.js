import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = {
    stages: [
        { duration: "10s", target: 10 }, // ramp-up
        { duration: "30s", target: 10 }, // steady load
        { duration: "10s", target: 0 },  // ramp-down
    ],
    thresholds: {
        http_req_failed: ["rate<0.1"],    // <10% error rate
        http_req_duration: ["p(95)<1200"],// 95% requests < 1200ms
    },
};

const BASE_URL = "https://petstore.swagger.io/v2";
const params = { headers: { "Content-Type": "application/json" } };

export default function () {
    group("Petstore User Flow", function() {
        // 1. Find available pets
        const findRes = http.get(`${BASE_URL}/pet/findByStatus?status=available`);
        check(findRes, {
            "GET /pet/findByStatus returns 200": (r) => r.status === 200,
            "GET /pet/findByStatus returns a list": (r) => Array.isArray(r.json()),
        });

        // 2. Create a new pet
        const petId = Math.floor(Math.random() * 10000000);
        const createPayload = JSON.stringify({
            id: petId,
            name: `LoadPet-${petId}`,
            photoUrls: ["https://example.com/load.jpg"],
            status: "available",
        });
        const createRes = http.post(`${BASE_URL}/pet`, createPayload, params);
        check(createRes, {
            "POST /pet returns 200": (r) => r.status === 200,
            "POST /pet returns correct pet ID": (r) => r.json("id") === petId,
        });
    });

    sleep(1); // pacing between iterations
}
