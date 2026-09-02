import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const info = jest.fn();
const server = { close: jest.fn() };
const listen = jest.fn((_port, callback) => {
  callback();
  return server;
});
const app = { listen };
const createApp = jest.fn(() => app);
const createLogger = jest.fn(() => ({ info }));
const createCloudDependencies = jest.fn((env = {}) => ({
  project: env.GOOGLE_CLOUD_PROJECT || 'assessment-project',
  location: env.VERTEX_LOCATION || 'us-central1',
  vertexClient: { getGenerativeModel: jest.fn() },
  db: {},
}));

jest.unstable_mockModule('../src/app.mjs', () => ({ createApp }));
jest.unstable_mockModule('../src/cloud.mjs', () => ({ createCloudDependencies }));
jest.unstable_mockModule('../src/logger.mjs', () => ({ createLogger }));

const { startServer } = await import('../src/server.mjs');

describe('server bootstrap', () => {
  beforeEach(() => {
    info.mockClear();
    listen.mockClear();
    createApp.mockClear();
    createLogger.mockClear();
    createCloudDependencies.mockClear();
    server.close.mockClear();
  });

  test('starts on port 8080 by default and returns the app/server handles', () => {
    const result = startServer({ env: {} });

    expect(createCloudDependencies).toHaveBeenCalledWith({});
    expect(createApp).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(8080, expect.any(Function));
    expect(result).toEqual({ app, server });
  });

  test('uses an explicit PORT value', () => {
    startServer({ env: { PORT: '9090' } });

    expect(listen).toHaveBeenCalledWith(9090, expect.any(Function));
  });

  test('logs structured startup metadata after the listener starts', () => {
    startServer({
      env: {
        PORT: '8181',
        GOOGLE_CLOUD_PROJECT: 'project-a',
        VERTEX_LOCATION: 'europe-west1',
      },
    });

    expect(info).toHaveBeenCalledWith(
      {
        event: 'server.started',
        port: 8181,
        project: 'project-a',
        location: 'europe-west1',
      },
      'Conversational AI service started',
    );
  });
});
