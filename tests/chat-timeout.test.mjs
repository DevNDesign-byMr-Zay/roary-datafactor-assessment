import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildApp() {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = {
    generateContent: jest.fn(() => new Promise(() => {})),
  };
  const vertexClient = { getGenerativeModel: jest.fn(() => model) };
  const add = jest.fn(async () => ({ id: 'write' }));
  const messages = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({ get: jest.fn(async () => ({ docs: [] })) })),
    })),
    add,
  };
  const db = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ collection: jest.fn(() => messages) })),
    })),
  };

  return {
    app: createApp({
      vertexClient,
      db,
      logger,
      requestIdFactory: () => 'timeout-request-1',
      chatTimeoutMs: 10,
    }),
    logger,
    model,
    add,
  };
}

describe('chat timeout handling', () => {
  test('returns a correlated 504 without persisting a partial turn', async () => {
    const { app, logger, model, add } = buildApp();

    const response = await request(app)
      .post('/chat')
      .send({ text: 'hello', sessionId: 'session-timeout' });

    expect(response.status).toBe(504);
    expect(response.headers['x-request-id']).toBe('timeout-request-1');
    expect(response.body).toEqual({
      error: {
        code: 'CHAT_TIMEOUT',
        message: 'The chat request timed out.',
      },
    });
    expect(model.generateContent).toHaveBeenCalledTimes(1);
    expect(add).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      {
        event: 'chat.timed_out',
        requestId: 'timeout-request-1',
        sessionId: 'session-timeout',
      },
      'Chat request timed out',
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});
