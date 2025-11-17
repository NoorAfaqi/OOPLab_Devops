const assert = require('assert');
const { parsePagination, parseSortParams } = require('../src/utils/pagination');

try {
  // Default parsing
  const p1 = parsePagination('1', '10');
  assert.deepStrictEqual(p1, { page: 1, limit: 10, offset: 0 });

  // Clamp too small
  const p2 = parsePagination('-5', '0');
  assert.deepStrictEqual(p2, { page: 1, limit: 10, offset: 0 });

  // Clamp too big
  const p3 = parsePagination('99999', '99999');
  assert.strictEqual(p3.page, 1000);
  assert.strictEqual(p3.limit, 100);
  assert.strictEqual(p3.offset, (1000 - 1) * 100);

  // Sort params: allowed field & order normalization
  const s1 = parseSortParams('title', 'asc', ['title', 'createdAt']);
  assert.deepStrictEqual(s1, { sortBy: 'title', sortOrder: 'ASC' });

  // Sort params: fallback field, invalid order
  const s2 = parseSortParams('unknown', 'sideways', ['title', 'createdAt']);
  assert.deepStrictEqual(s2, { sortBy: 'createdAt', sortOrder: 'DESC' });

  console.log('pagination.test.js: OK');
  process.exit(0);
} catch (err) {
  console.error('pagination.test.js failed:', err.message);
  process.exit(1);
}


