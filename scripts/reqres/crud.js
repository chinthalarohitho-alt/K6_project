import http from "k6/http";
import { check, sleep, group, fail } from "k6";

export let options = { vus: 1, iterations: 2, thresholds: { 'checks': ['rate==1.0'] } };
const BASE_URL = "https://dummyjson.com";
const productPayload = { title: "QA Portfolio Product", price: 123, category: "smartphones" };

export default function () {
    group("CRUD: Products (Add, List, Get, Update, Delete, Negatives)", function() {
        // Create
        const createRes = http.post(`${BASE_URL}/products/add`, JSON.stringify(productPayload), {
            headers: { "Content-Type": "application/json" }
        });
        check(createRes, {
            "CREATE: status 200": (r) => r.status === 200,
            "CREATE: id exists": (r) => !!r.json("id"),
            "CREATE: title match": (r) => r.json("title") === productPayload.title
        }) || fail("Product create failed");
        const productId = createRes.json("id");

        // List
        const listRes = http.get(`${BASE_URL}/products?limit=5`);
        check(listRes, {
            "LIST: status 200": (r) => r.status === 200,
            "LIST: products present": (r) => Array.isArray(r.json("products"))
        });

        // Get by ID
        const getRes = http.get(`${BASE_URL}/products/${productId}`);
        check(getRes, {
            "GET: status 200": (r) => r.status === 200,
            "GET: correct title": (r) => r.json("title") === productPayload.title
        });

        // Update
        const updatePayload = { title: "QA Portfolio Product Updated", price: 150 };
        const updateRes = http.put(`${BASE_URL}/products/${productId}`, JSON.stringify(updatePayload), {
            headers: { "Content-Type": "application/json" }
        });
        check(updateRes, {
            "UPDATE: status 200": (r) => r.status === 200,
            "UPDATE: title match": (r) => r.json("title") === updatePayload.title
        });

        // Delete
        const delRes = http.del(`${BASE_URL}/products/${productId}`);
        check(delRes, {
            "DELETE: status 200": (r) => r.status === 200,
            "DELETE: id match": (r) => r.json("id") === productId
        });

        // Negative: Get non-existent
        const badRes = http.get(`${BASE_URL}/products/9999999`);
        check(badRes, { "GET BAD: 404": (r) => r.status === 404 });
    });
    sleep(1);
}
