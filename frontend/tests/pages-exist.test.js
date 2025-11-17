const fs = require('fs');
const path = require('path');

try {
  const appDir = path.resolve(__dirname, '..', 'src', 'app');
  const mustExist = [
    'page.tsx',
    path.join('blogs', 'page.tsx'),
    path.join('products', 'page.tsx'),
    path.join('about', 'page.tsx'),
  ];

  const missing = mustExist.filter(rel => !fs.existsSync(path.join(appDir, rel)));
  if (missing.length) {
    throw new Error('Missing required pages: ' + missing.join(', '));
  }

  console.log('pages-exist.test.js: OK');
  process.exit(0);
} catch (err) {
  console.error('pages-exist.test.js failed:', err.message);
  process.exit(1);
}


