#!/usr/bin/env node
// This Node.js script automates the discovery of JSON payload files.
// It scans the /payloads directory, creates a map of the files,
// and generates a new JS module (_generated_payloads.js) that k6 can import.
// This enables a 'zero-configuration' workflow for adding new test data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 🔧 Fix for missing __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const payloadsDir = path.join(__dirname, '../payloads');
const generatedFilePath = path.join(__dirname, '../utils/_generated_payloads.js');

let payloadExports = '// This is an auto-generated file. Do not edit it manually.\n\n';
payloadExports += 'export const jsonPayloads = {\n';

function toPayloadKey(filename) {
  // Converts 'user-login-success.json' → 'user_login_success'
  return filename
    .replace('.json', '')
    .replace(/[-]/g, '_'); // Normalize separators to underscore
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip subdirectories like /schemas
      continue;
    } else if (fullPath.endsWith('.json')) {
      const filename = path.basename(fullPath);
      const payloadKey = toPayloadKey(filename);
      // The path for the k6 'open' function must be relative.
      // Since _generated_payloads is in /utils, the path is ../payloads/
      const k6Path = `open('../payloads/${filename}')`;
      payloadExports += `  '${payloadKey}': JSON.parse(${k6Path}),\n`;
    }
  }
}

console.log('🔄 Generating dynamic payload map...');
traverseDir(payloadsDir);

payloadExports += '};\n';

fs.writeFileSync(generatedFilePath, payloadExports);
console.log(`✅ Payload map successfully generated at: ${path.relative(process.cwd(), generatedFilePath)}`);
