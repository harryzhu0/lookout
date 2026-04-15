#!/usr/bin/env node
const path = require('path');
const cwd = process.cwd();
const nextDev = require(path.join(cwd, 'node_modules', 'next', 'dist', 'cli', 'next-dev.js')).nextDev;

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const rawKey = arg.slice(2);
    const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    
    // Check if next argument is a value (doesn't start with --)
    let value = true;
    if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      value = argv[i + 1];
      i++; // Skip the value in next iteration
    }
    
    // Convert numeric values
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = Number(value);
    }

    options[key] = value;
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  try {
    await nextDev(options, 'default', cwd);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
