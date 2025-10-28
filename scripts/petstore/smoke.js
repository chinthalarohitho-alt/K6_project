import http from "k6/http";
import { check, sleep, group } from "k6";

export let options = { vus: 1, iterations: 1, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://petstore.swagger.io/v2";

export default function () {
    group("Smoke Test - Petstore Health", function() {
        const petsStatus = http.get(`${BASE_URL}/pet/findByStatus?status=available`);
        check(petsStatus, { "Pets available: status 200": (r) => r.status === 200 });

        const storeInventory = http.get(`${BASE_URL}/store/inventory`);
        check(storeInventory, { "Inventory: status 200": (r) => r.status === 20 });

        const usersRes = http.get(`${BASE_URL}/user/user1`);
        check(usersRes, { "User1: status 404/200": (r) => r.status === 200 || r.status === 404 }); // User may not exist
    });
    sleep(1);
}
