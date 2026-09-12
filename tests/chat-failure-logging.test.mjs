import { expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildDb() {
  const messages = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(async () => ({ docs: [] })),
      })),
    })),
    add: jest.fn(async () => ({ id: 'write' })),
  };

  return {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ collection: jest.fn(() => messages) })),
    })),
  };
}

test('provider failures log bounded metadata without raw error text or stack', async () => {
  const secret = 'provider-token=do-not-log';
  const failure = new Error(secret);
  failure.code = 'UPSTREAM_FAILURE';

  const model = {
    generateContent: jest.fn(async () => {
      throw failure;
    }),
  };
  const vertexClient = { getGenerativeModel: jest.fn(() => model) };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const app = createApp({ vertexClient, db: buildDb(), logger });

  const response = await request(app)
    .post('/chat')
    .send({ text: 'hello', sessionId: 'session-123' });

  expect(response.status).toBe(500);
  expect(response.body).toEqual({
    error: {
      code: 'CHAT_REQUEST_FAILED',
      message: 'Unable to complete the chat request.',
    },
  });
  expect(logger.error).toHaveBeenCalledWith(
    {
      event: 'chat.failed',
      errorName: 'Error',
      errorCode: 'UPSTREAM_FAILURE',
      sessionId: 'session-123',
    },
    'Chat request failed',
  );

  const logged = JSON.stringify(logger.error.mock.calls);
  expect(logged).not.toContain(secret);
  expect(logged).not.toContain(failure.stack);
});
