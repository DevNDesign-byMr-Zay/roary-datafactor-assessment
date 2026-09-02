import { afterEach, describe, expect, jest, test } from '@jest/globals';

const SOURCE =
  '../Software Engineering & AI Tooling/API Foundations/Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs';
let importId = 0;
const originalOrigins = process.env.ALLOWED_ORIGINS;

async function loadPolicy(origins) {
  if (origins === undefined) delete process.env.ALLOWED_ORIGINS;
  else process.env.ALLOWED_ORIGINS = origins;

  const useCalls = [];
  globalThis.cors = jest.fn((options) => ({ kind: 'cors', options }));
  globalThis.app = {
    use: jest.fn((handler) => {
      useCalls.push(handler);
    }),
  };

  await import(`${SOURCE}?test=${importId++}`);
  return { corsOptions: globalThis.cors.mock.calls[0][0], errorHandler: useCalls[1] };
}

function responseHarness() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

afterEach(() => {
  if (originalOrigins === undefined) delete process.env.ALLOWED_ORIGINS;
  else process.env.ALLOWED_ORIGINS = originalOrigins;
  delete globalThis.app;
  delete globalThis.cors;
  jest.restoreAllMocks();
});

describe('canonical CORS policy artifact', () => {
  test('allows requests without an Origin header', async () => {
    const { corsOptions } = await loadPolicy('https://one.example');
    const callback = jest.fn();

    corsOptions.origin(undefined, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test('trims and allows configured origins', async () => {
    const { corsOptions } = await loadPolicy(
      ' https://one.example,https://two.example  ',
    );
    const callback = jest.fn();

    corsOptions.origin('https://two.example', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
    expect(corsOptions.credentials).toBe(true);
  });

  test('rejects an origin outside the allowlist', async () => {
    const { corsOptions } = await loadPolicy('https://one.example');
    const callback = jest.fn();

    corsOptions.origin('https://blocked.example', callback);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Not allowed by CORS: https://blocked.example',
      }),
    );
  });

  test('converts CORS errors into structured 403 responses', async () => {
    const { errorHandler } = await loadPolicy('https://one.example');
    const res = responseHarness();
    const next = jest.fn();
    const error = new Error('Not allowed by CORS: https://blocked.example');

    errorHandler(error, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
    expect(next).not.toHaveBeenCalled();
  });

  test('passes unrelated errors to the next handler', async () => {
    const { errorHandler } = await loadPolicy('https://one.example');
    const res = responseHarness();
    const next = jest.fn();
    const error = new Error('unrelated');

    errorHandler(error, {}, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
