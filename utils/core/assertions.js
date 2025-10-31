// This module provides a suite of reusable assertion helpers for k6 checks.
// Using these helpers makes test scripts more declarative, readable, and maintainable.

/**
 * A private helper to log rich assertion failure details for the formatter.
 * @private
 */
function logAssertionFailure(checkName, expected, actual) {
    // We use console.log here to emit a structured log that our Node.js formatter script can parse.
    console.log(JSON.stringify({
        type: 'assertion-failure',
        checkName: checkName,
        expected: expected,
        actual: actual,
    }));
}

/**
 * A private helper to create checks and log failures.
 * @private
 */
function createCheck(name, validator, expected, getActual) {
    return {
        [name]: (r) => {
            if (!r) return false; // Guard against null responses
            const actual = getActual(r);
            const pass = validator(actual);
            if (!pass) {
                logAssertionFailure(name, expected, actual);
            }
            return pass;
        }
    }
}

/**
 * Creates a check object for asserting the response status code.
 * @param {number} expectedStatus - The expected HTTP status code.
 * @returns {object} A check object for k6.
 */
export function expectStatus(expectedStatus) {
    const name = `status is ${expectedStatus}`;
    return createCheck(name, (actual) => actual === expectedStatus, expectedStatus, (r) => r.status);
}

/**
 * Creates a check object to verify that a specific key exists in the JSON response.
 * @param {string} key - The JSON key to check for existence.
 * @returns {object} A check object for k6.
 */
export function assertExists(key) {
    const name = `JSON property '${key}' exists`;
    return createCheck(name, (actual) => actual !== undefined && actual !== null, 'not null or undefined', (r) => {
        try { return r.json(key); } catch (e) { return undefined; }
    });
}

/**
 * Creates a check object for asserting a specific key-value pair in a JSON response.
 * @param {string} path - The JSON path to the property (e.g., 'name', 'data.id').
 * @param {*} expectedValue - The expected value for the property.
 * @returns {object} A check object for k6.
 */
export function assertValue(path, expectedValue) {
    const name = `JSON property '${path}' is correct`;
    return createCheck(name, (actual) => actual === expectedValue, expectedValue, (r) => {
        try { return r.json(path); } catch (e) { return undefined; }
    });
}

/**
 * A private helper for creating specific type assertion functions.
 * @private
 */
function _createTypeAssertion(path, type, validator) {
    const name = `JSON property '${path}' has type '${type}'`;
    return createCheck(
        name,
        (actual) => validator(actual.actualValue), // The validator now gets the raw value
        type, // The expected value is the type string
        (r) => {
            let val;
            try { val = r.json(path); } catch (e) { val = undefined; }
            // Return an object for rich logging in case of failure
            return {
                actualType: Array.isArray(val) ? 'array' : typeof val,
                actualValue: val,
            };
        }
    );
}

/**
 * Creates a check object to verify the data type of a property is a string.
 * @param {string} path - The JSON path to the property.
 * @returns {object} A check object for k6.
 */
export function assertTypeString(path) {
    return _createTypeAssertion(path, 'string', (val) => typeof val === 'string');
}

/**
 * Creates a check object to verify the data type of a property is a number (int or float).
 * @param {string} path - The JSON path to the property.
 * @returns {object} A check object for k6.
 */
export function assertTypeNumber(path) {
    return _createTypeAssertion(path, 'number', (val) => typeof val === 'number');
}

/**
 * Creates a check object to verify the data type of a property is an integer.
 * @param {string} path - The JSON path to the property.
 * @returns {object} A check object for k6.
 */
export function assertTypeInt(path) {
    return _createTypeAssertion(path, 'int', (val) => Number.isInteger(val));
}

/**
 * Creates a check object to verify the data type of a property is a boolean.
 * @param {string} path - The JSON path to the property.
 * @returns {object} A check object for k6.
 */
export function assertTypeBoolean(path) {
    return _createTypeAssertion(path, 'boolean', (val) => typeof val === 'boolean');
}

/**
 * Creates a check object for asserting both the value and type of a property in a JSON response.
 * @param {string} path - The JSON path to the property.
 * @param {*} value - The expected value.
 * @param {string} type - The expected data type ('string', 'number', 'int', 'boolean').
 * @returns {object} A composite check object for k6.
 */
export function assertProperty(path, value, type) {
    let typeCheck = {};
    switch (type) {
        case 'string': typeCheck = assertTypeString(path); break;
        case 'number': typeCheck = assertTypeNumber(path); break;
        case 'int': typeCheck = assertTypeInt(path); break;
        case 'boolean': typeCheck = assertTypeBoolean(path); break;
        default: throw new Error(`Unsupported type '${type}' in assertProperty.`);
    }
    return {
        ...assertValue(path, value),
        ...typeCheck,
    };
}

/**
 * Creates a check object to verify that a property within a JSON response is an array.
 * @param {string} key - The JSON key to check.
 * @returns {object} A check object for k6.
 */
export function assertIsArray(key) {
    const name = `JSON property '${key}' is an array`;
    return createCheck(name, (actual) => Array.isArray(actual), 'array', (r) => {
        try { return r.json(key); } catch(e) { return undefined; }
    });
}

/**
 * Creates a check object to verify the response body is not empty.
 * @returns {object} A check object for k6.
 */
export function expectBodyNotEmpty() {
    const name = 'response body is not empty';
    return createCheck(name, (actual) => actual && actual.length > 0, 'not empty', (r) => r.body);
}

/**
 * Creates a check object to verify the response body contains a specific substring.
 * @param {string} substring - The substring to search for in the response body.
 * @returns {object} A check object for k6.
 */
export function expectBodyToContain(substring) {
    const name = `response body contains "${substring}"`;
    return createCheck(name, (actual) => actual && actual.includes(substring), `to contain "${substring}"`, (r) => r.body);
}

/**
 * Creates a check object to verify the response body is a valid array.
 * @returns {object} A check object for k6.
 */
export function expectResponseIsArray() {
    const name = 'response is an array';
    return createCheck(name, (actual) => Array.isArray(actual), 'array', (r) => {
        try { return r.json(); } catch(e) { return undefined; }
    });
}