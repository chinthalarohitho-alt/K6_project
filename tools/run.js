import { spawn } from 'child_process';
import { execSync } from 'child_process';
import readline from 'readline';
 
// This script acts as a robust wrapper for running k6 tests locally.
// It correctly handles environment variables and script path arguments.

const args = process.argv.slice(2);
const scriptPath = args[0];

if (!scriptPath) {
  console.error('Error: No script path provided.');
  console.error('Usage: npm run test:local -- <path/to/script.js>');
  process.exit(1);
}

// Determine k6 version and conditionally include --no-progress
let useNoProgress = false;
try {
    // A more reliable way to check for flag support is to inspect the help output.
    const helpOutput = execSync('k6 help run').toString();
    useNoProgress = helpOutput.includes('--no-progress');
} catch (e) {
    // If k6 isn't found or the command fails, proceed without the flag.
    // This is expected if k6 is not in the system's PATH.
    console.warn('Could not check for --no-progress flag support. If you see an error, please update k6.');
}

// Construct the arguments for the k6 command.
const commandArgs = [
  'run',
  '--env', `K6_SCRIPT_NAME=${scriptPath}`, // Set the script name for config logic
  '--env', `ENV=${process.env.Env || 'production'}`,
  '--env', `VUS=${process.env.VUS || ''}`,
  '--env', `DURATION=${process.env.DURATION || ''}`,
  '--env', `LOAD_PROFILE=${process.env.LOAD_PROFILE || ''}`,
  scriptPath,
];
if (useNoProgress) {
    commandArgs.splice(1, 0, '--no-progress');
}



// Spawn the k6 process. We will capture its output instead of inheriting stdio.
const k6Process = spawn('k6', commandArgs);

const logPrefixRegex = /time=".*?" level=info msg="(.*)"(?: source=console)?/;

/**
 * A function to process each line of output from k6.
 * It strips the k6 logging prefix if it exists, otherwise prints the line as is.
 */
function processLine(line) {
  const match = line.match(logPrefixRegex);
  if (match && match[1]) {
    // If it's a console log, print only the clean message.
    console.log(JSON.parse(`"${match[1]}"`)); // Use JSON.parse to correctly handle escaped characters.
  } else {
    // Otherwise, print the line as is (e.g., k6 banner, summary).
    console.log(line);
  }
}

// Create readline interfaces to process both stdout and stderr line by line.
readline.createInterface({ input: k6Process.stdout }).on('line', processLine);
readline.createInterface({ input: k6Process.stderr }).on('line', processLine);

k6Process.on('close', (code) => {
  // Exit with the same code as the k6 process.
  process.exit(code);
});