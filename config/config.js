// =============================================================
//  Environment Config Loader
// =============================================================
const environments = JSON.parse(open('./environments.json'));
export const ENV = __ENV.ENV || 'production'; // e.g., 'beta'

if (!__ENV.K6_SCRIPT_NAME) {
  throw new Error(
    'Framework error: K6_SCRIPT_NAME environment variable not found. This should be set by the npm script.'
  );
}

// Automatically determine the API_TARGET from the script path (e.g., "scripts/petstore/crud.js" -> "petstore")
const pathParts = __ENV.K6_SCRIPT_NAME.split('/');
export const API_TARGET = pathParts.length > 1 ? pathParts[1] : null;

if (!environments[API_TARGET] || !environments[API_TARGET][ENV]) {
  throw new Error(
    `Configuration error: No configuration found for API_TARGET='${API_TARGET}' and ENV='${ENV}' in config/environments.json.`
  );
}

const environmentConfig = environments[API_TARGET][ENV];

if (!environmentConfig || !environmentConfig.baseUrl) {
  throw new Error(
    `Configuration error: Missing 'baseUrl' for API_TARGET='${API_TARGET}' and ENV='${ENV}'.`
  );
}

export const BASE_URL = environmentConfig.baseUrl;
export const BOT_ID = environmentConfig.botId || null;

export const HEADERS = {
  'Content-Type': 'application/json',
};
