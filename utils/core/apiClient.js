import http from 'k6/http';
import { getPayload } from './payloads.js';
import { HEADERS } from '../../config/config.js';

/**
 * Resolve payload name or merge inline overrides.
 */
function resolvePayload(payload, modifications) {
  if (typeof payload === 'string') return getPayload(payload, modifications);
  return { ...payload, ...modifications };
}

/**
 * Factory to create an API client bound to a base URL.
 * Handles GET, POST, PUT, DELETE, and file uploads.
 */
export function createApiClient(baseUrl) {
  return {
    _mergeParams(customParams = {}) {
      return {
        ...customParams,
        headers: { ...HEADERS, ...(customParams.headers || {}) },
      };
    },

    get(endpoint, params) {
      const url = `${baseUrl}${endpoint}`;
      const res = http.get(url, this._mergeParams(params));
      return res;
    },

    post(endpoint, payload, modifications = {}, params = {}) {
      const url = `${baseUrl}${endpoint}`;
      const body = resolvePayload(payload, modifications);
      const res = http.post(url, JSON.stringify(body), this._mergeParams(params));
      return res;
    },

    put(endpoint, payload, modifications = {}, params = {}) {
      const url = `${baseUrl}${endpoint}`;
      const body = resolvePayload(payload, modifications);
      const res = http.put(url, JSON.stringify(body), this._mergeParams(params));
      return res;
    },

    del(endpoint, params) {
      const url = `${baseUrl}${endpoint}`;
      const res = http.del(url, null, this._mergeParams(params));
      return res;
    },

    /**
     * Upload a file using multipart/form-data.
     * Automatically removes static JSON headers.
     */
    uploadImage(endpoint, filePayloadName, params = {}) {
      const fileData = getPayload(filePayloadName);
      const multipartHeaders = { ...HEADERS };
      delete multipartHeaders['Content-Type'];

      const body = {
        file: http.file(fileData.data, fileData.filename, fileData.content_type),
      };

      const url = `${baseUrl}${endpoint}`;
      const res = http.post(
        url,
        body,
        this._mergeParams({ ...params, headers: multipartHeaders })
      );

      logRequestDetails('POST', url, res, { file: fileData.filename });
      return res;
    },
  };
}
