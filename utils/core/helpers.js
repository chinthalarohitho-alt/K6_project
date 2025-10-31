// This file contains helper functions to generate dynamic data.
// Each function is exported individually and documented with JSDoc for great autocompletion.

/**
 * Generates a random string of a given length.
 * @param {number} length - The desired length of the string.
 * @returns {string} A random alphanumeric string.
 */
export function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a random integer between a min and max value.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} A random integer.
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generates a random email address for testing.
 * @returns {string} A random email address for testing.
 */
export function randomEmail() {
    return `${randomString(10)}@test.k6.io`;
}