const assert = require('assert');
const {
  validateUserRegistration,
  validateUserLogin,
} = require('../src/middleware/validation');

function createMockReqRes(body = {}) {
  const req = { body };
  const res = {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.payload = obj;
      return this;
    },
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, get nextCalled() { return nextCalled; } };
}

try {
  // Registration: invalid email & short password
  {
    const ctx = createMockReqRes({
      firstName: 'A',
      lastName: 'B',
      email: 'not-an-email',
      username: 'ab',
      password: '123',
    });
    validateUserRegistration(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.res.statusCode, 400);
    assert.strictEqual(ctx.res.payload.success, false);
    assert(Array.isArray(ctx.res.payload.errors));
    assert.strictEqual(ctx.nextCalled, false);
  }

  // Registration: happy path
  {
    const ctx = createMockReqRes({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'john_doe',
      password: 'StrongP4ss',
    });
    validateUserRegistration(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.res.statusCode, 200);
    assert.strictEqual(ctx.res.payload, undefined);
    assert.strictEqual(ctx.nextCalled, true);
  }

  // Login: missing password
  {
    const ctx = createMockReqRes({
      email: 'john@example.com',
    });
    validateUserLogin(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.res.statusCode, 400);
    assert.strictEqual(ctx.res.payload.success, false);
    assert.strictEqual(ctx.nextCalled, false);
  }

  // Login: ok
  {
    const ctx = createMockReqRes({
      email: 'john@example.com',
      password: 'anything',
    });
    validateUserLogin(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.res.statusCode, 200);
    assert.strictEqual(ctx.nextCalled, true);
  }

  console.log('validation.test.js: OK');
  process.exit(0);
} catch (err) {
  console.error('validation.test.js failed:', err.message);
  process.exit(1);
}


