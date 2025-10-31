// This module centralizes access to all payload files.
// It combines dynamically discovered JSON payloads with static, non-JSON payloads.

// Import the dynamically generated map of JSON payloads.
import { jsonPayloads } from '../_generated_payloads.js';

// Define non-JSON payloads, like binary file data for uploads.
const otherPayloads = {
  pet_image_data: {
    data: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer,
    filename: 'test_pet_image.png',
    content_type: 'image/png'
  },
};

// Combine all payloads for a single lookup point.
const allPayloads = { ...jsonPayloads, ...otherPayloads };

/**
 * Retrieves a fresh copy of a payload, optionally applying modifications.
 * This is a clean, declarative way to create payload variations for tests.
 * @param {string} name - The key of the base payload to retrieve (e.g., 'user_create').
 * @param {object} [modifications] - An optional object with keys/values to override in the base payload.
 * @returns {object|array} A new payload object or array with the modifications applied.
 */
export function getPayload(name, modifications = {}) {
  if (!allPayloads[name]) {
    throw new Error(`Payload with name '${name}' not found. Available payloads: ${Object.keys(allPayloads).join(', ')}`);
  }

  const basePayload = jsonPayloads[name]
    // For JSON data, return a deep copy to ensure test isolation.
    ? JSON.parse(JSON.stringify(allPayloads[name]))
    // For other data types (like our image object), return a direct reference.
    : allPayloads[name];
  
  // The basePayload is already a deep copy, so a shallow merge is safe and efficient.
  return {
    ...basePayload,
    ...modifications,
  };
}