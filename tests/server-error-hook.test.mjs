import { beforeEach, expect, jest, test } from '@jest/globals';

const info = jest.fn();
const warn = jest.fn();
const server = { close: jest.fn() };
const listen = jest.fn((_port, callback) => {
  callback();
  return server;
});
const use = jest.fn();
const app = { listen, use };
const createApp = jest.fn(() => app);
const createLogger = jest.fn(() => ({ info, warn }));
const createCloudDependencies = jest.fn(() => ({
  project: 'assessment-project',
  location: 'us-central1',
  vertexClient: { getGenerativeModel: jest.fn() },
  db: {},
}));

jest.unstable_mockModule('../src/app.mjs', () => ({ createApp }));
jest.unstable_mockModule('../src/cloud.mjs', () => ({ createCloudDependencies }));
jest.unstable_mockModule('../src/logger.mjs', () => ({ createLogger }));

const { startServer } = await import('../src/server.mjs');

beforeEach(() => {
  info.mockClear();
  warn.mockClear();
  listen.mockClear();
  use.mockClear();
  createApp.mockClear();
  createLogger.mockClear();
  createCloudDependencies.mockClear();
});

test('server error hook receives frozen bounded context and preserves the original error flow', () => {
  const onUnhandledError = jest.fn();
  const failure = new Error('request failed');
  const next = jest.fn();

  startServer({ env: {}, onUnhandledError });
  const middleware = use.mock.calls[0][0];
  middleware(failure, { requestId: 'request-123', secret: 'not-forwarded' }, {}, next);

  expect(onUnhandledError).toHaveBeenCalledTimes(1);
  const [reportedError, context] = onUnhandledError.mock.calls[0];
  expect(reportedError).toBe(failure);
  expect(context).toEqual({ scope: 'http', requestId: 'request-123' });
  expect(Object.isFrozen(context)).toBe(true);
  expect(context).not.toHaveProperty('secret');
  expect(next).toHaveBeenCalledWith(failure);
});

test('server error hook failure is contained and does not replace the original request error', () => {
  const failure = new Error('original request error');
  const next = jest.fn();

  startServer({
    env: {},
    onUnhandledError() {
      throw new Error('tracker unavailable');
    },
  });
  const middleware = use.mock.calls[0][0];

  expect(() => middleware(failure, { requestId: 'request-456' }, {}, next)).not.toThrow();
  expect(next).toHaveBeenCalledWith(failure);
  expect(warn).toHaveBeenCalledWith(
    expect.objectContaining({
      event: 'error.reporter_failed',
      scope: 'http',
      errorName: 'Error',
    }),
    'Unhandled error reporter failed',
  );
});
