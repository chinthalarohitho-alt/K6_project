# K6 API Project
This repository contains k6 load testing scripts for Petstore and Reqres APIs, along with Docker support for containerized runs. 
cmd : 
     docker-compose -f docker/docker-compose.yaml run --rm k6 ../scripts/petstore/smoke.js
petstore Apis - 




 reqres Apis - 
auth.js — login/register scenarios

crud.js — create/read/update (PUT/PATCH)/delete user

error.js — negative/error cases (404, invalid payloads etc.)

load.js — ramp-up volumes, repeats main endpoints

smoke.js — high-level health, basic CRUD, unknown endpoints