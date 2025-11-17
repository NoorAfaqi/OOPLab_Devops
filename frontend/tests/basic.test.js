// Minimal smoke test for CI to ensure Node is available and the package.json is parseable
const fs = require('fs');
const path = require('path');

try {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  if (!pkg.scripts) throw new Error('No scripts found in package.json');
  console.log('basic.test.js: package.json parsed successfully');
  process.exit(0);
} catch (err) {
  console.error('basic.test.js failed:', err.message);
  process.exit(1);
}
