// This Node.js script enforces the architectural rule that all test scripts
// in the /scripts directory must only import from the central utils module.
// This maintains the integrity of the framework's single-import pattern.

const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '../scripts');
const allowedImport = '../../utils/index.js'; // Relative path from a script in /scripts/..
let invalidFiles = [];

function checkFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const importLines = lines.filter(line => line.trim().startsWith('import'));

  for (const line of importLines) {
    if (!line.includes(allowedImport)) {
      console.error(`❌ Architectural Violation in: ${path.relative(process.cwd(), filePath)}`);
      console.error(`   Invalid import found: ${line.trim()}`);
      invalidFiles.push(filePath);
      return; // Stop after first violation in a file
    }
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      checkFileImports(fullPath);
    }
  }
}

console.log('🔍 Checking import integrity in test scripts...');
traverseDir(scriptsDir);

if (invalidFiles.length > 0) {
  console.error('\n🚨 Found architectural violations. All test scripts must only import from the central toolkit.');
  process.exit(1); // Exit with a failure code
} else {
  console.log('✅ All test scripts adhere to the single-import pattern. Great job!');
  process.exit(0); // Exit with a success code
}