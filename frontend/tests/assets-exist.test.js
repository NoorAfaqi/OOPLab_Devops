const fs = require('fs');
const path = require('path');

try {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const mustExist = [
    'manifest.json',
    'logo.png',
    'OOPLab-Logo-Light.png',
  ];

  const missing = mustExist.filter(rel => !fs.existsSync(path.join(publicDir, rel)));
  if (missing.length) {
    throw new Error('Missing required public assets: ' + missing.join(', '));
  }

  console.log('assets-exist.test.js: OK');
  process.exit(0);
} catch (err) {
  console.error('assets-exist.test.js failed:', err.message);
  process.exit(1);
}


