// =============================================================
//  Environment Config Loader
// =============================================================
const environments = JSON.parse(open('./environments.json'));

export const API_TARGET = __ENV.API_TARGET; // e.g., 'petstore'
export const ENV = __ENV.ENV || 'production'; // e.g., 'beta'

if (!API_TARGET) {
  throw new Error(
    "Execution error: API_TARGET environment variable is not set. Please specify it via the npm script."
  );
}

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
