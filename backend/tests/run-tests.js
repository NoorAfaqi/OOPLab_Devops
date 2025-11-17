#!/usr/bin/env node
/**
 * Test runner that outputs JUnit XML format for CI/CD
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = __dirname;
const RESULTS_DIR = path.join(TEST_DIR, '..', 'test-results');
const XML_FILE = path.join(RESULTS_DIR, 'test-results.xml');

// Create results directory
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Track test results
const testResults = {
  tests: [],
  total: 0,
  passed: 0,
  failed: 0,
  duration: 0
};

const startTime = Date.now();

// Run pagination tests
try {
  console.log('Running pagination tests...');
  execSync('node tests/pagination.test.js', { cwd: path.join(TEST_DIR, '..'), stdio: 'inherit' });
  testResults.tests.push({ name: 'pagination.test.js', status: 'passed', duration: 0 });
  testResults.passed++;
} catch (error) {
  testResults.tests.push({ name: 'pagination.test.js', status: 'failed', error: error.message, duration: 0 });
  testResults.failed++;
}

// Run validation tests
try {
  console.log('Running validation tests...');
  execSync('node tests/validation.test.js', { cwd: path.join(TEST_DIR, '..'), stdio: 'inherit' });
  testResults.tests.push({ name: 'validation.test.js', status: 'passed', duration: 0 });
  testResults.passed++;
} catch (error) {
  testResults.tests.push({ name: 'validation.test.js', status: 'failed', error: error.message, duration: 0 });
  testResults.failed++;
}

testResults.total = testResults.tests.length;
testResults.duration = (Date.now() - startTime) / 1000;

// Generate JUnit XML
function generateJUnitXML() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Backend Unit Tests" tests="${testResults.total}" failures="${testResults.failed}" time="${testResults.duration}">
  <testsuite name="Backend Tests" tests="${testResults.total}" failures="${testResults.failed}" time="${testResults.duration}">
${testResults.tests.map(test => {
  if (test.status === 'passed') {
    return `    <testcase name="${test.name}" classname="BackendTests" time="0"/>`;
  } else {
    return `    <testcase name="${test.name}" classname="BackendTests" time="0">
      <failure message="${test.error || 'Test failed'}">${test.error || 'Test failed'}</failure>
    </testcase>`;
  }
}).join('\n')}
  </testsuite>
</testsuites>`;

  fs.writeFileSync(XML_FILE, xml, 'utf8');
  console.log(`\nTest results written to: ${XML_FILE}`);
}

generateJUnitXML();

// Exit with appropriate code
if (testResults.failed > 0) {
  console.error(`\n❌ ${testResults.failed} test(s) failed`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${testResults.passed} test(s) passed`);
  process.exit(0);
}

