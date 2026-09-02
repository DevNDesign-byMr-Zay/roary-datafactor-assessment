import { afterEach, describe, expect, jest, test } from '@jest/globals';

const SOURCE =
  '../Software Engineering & AI Tooling/Authentication & Security/Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs';
let importId = 0;
const originalToken = process.env.APP_API_TOKEN;

async function loadMiddleware(token) {
  if (token === undefined) delete process.env.APP_API_TOKEN;
  else process.env.APP_API_TOKEN = token;

  let middleware;
  globalThis.app = {
    use: jest.fn((handler) => {
      middleware = handler;
    }),
  };

  await import(`${SOURCE}?test=${importId++}`);
  return middleware;
}

function responseHarness() {
  const res = { sendStatus: jest.fn(), status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

afterEach(() => {
  if (originalToken === undefined) delete process.env.APP_API_TOKEN;
  else process.env.APP_API_TOKEN = originalToken;
  delete globalThis.app;
  jest.restoreAllMocks();
});

describe('canonical token-authentication artifact', () => {
  test('short-circuits OPTIONS requests with 204', async () => {
    const middleware = await loadMiddleware('secret');
    const res = responseHarness();
    const next = jest.fn();

    middleware({ method: 'OPTIONS', header: jest.fn() }, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  });

  test('passes a matching application token', async () => {
    const middleware = await loadMiddleware('secret');
    const res = responseHarness();
    const next = jest.fn();

    middleware({ method: 'POST', header: jest.fn(() => 'secret') }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects a wrong application token', async () => {
    const middleware = await loadMiddleware('secret');
    const res = responseHarness();

    middleware({ method: 'POST', header: jest.fn(() => 'wrong') }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  test('rejects a missing application token', async () => {
    const middleware = await loadMiddleware('secret');
    const res = responseHarness();

    middleware({ method: 'GET', header: jest.fn(() => undefined) }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('fails closed when APP_API_TOKEN is unset', async () => {
    const middleware = await loadMiddleware(undefined);
    const res = responseHarness();
    const next = jest.fn();

    middleware({ method: 'GET', header: jest.fn(() => '') }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
