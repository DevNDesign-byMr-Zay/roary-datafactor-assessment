import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildApp({
  generateContent = async () => ({ response: { text: () => 'answer' } }),
  requestId = 'server-request-1',
} = {}) {
  const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = { generateContent: jest.fn(generateContent) };
  const vertexClient = { getGenerativeModel: jest.fn(() => model) };
  const messages = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({ get: jest.fn(async () => ({ docs: [] })) })),
    })),
    add: jest.fn(async () => ({ id: 'write' })),
  };
  const db = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ collection: jest.fn(() => messages) })),
    })),
  };
  const requestIdFactory = jest.fn(() => requestId);

  return {
    app: createApp({ vertexClient, db, logger: log, requestIdFactory }),
    log,
    model,
    requestIdFactory,
  };
}

describe('request correlation', () => {
  test('uses a server-owned id for the response and completion log', async () => {
    const { app, log, requestIdFactory } = buildApp();

    const response = await request(app)
      .post('/chat')
      .set('X-Request-Id', 'client-controlled')
      .send({ text: 'hello', sessionId: 'session-1' });

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe('server-request-1');
    expect(response.body).toEqual({ reply: 'answer', sessionId: 'session-1' });
    expect(requestIdFactory).toHaveBeenCalledTimes(1);
    expect(log.info).toHaveBeenCalledWith(
      { event: 'chat.completed', requestId: 'server-request-1', sessionId: 'session-1' },
      'Chat request completed',
    );
  });

  test('correlates sanitized upstream failures without logging raw error text', async () => {
    const failure = Object.assign(new Error('provider token SECRET_VALUE'), { code: 'UPSTREAM' });
    const { app, log } = buildApp({
      generateContent: async () => {
        throw failure;
      },
      requestId: 'server-request-2',
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'hello', sessionId: 'session-2' });

    expect(response.status).toBe(500);
    expect(response.headers['x-request-id']).toBe('server-request-2');
    expect(response.body.error.code).toBe('CHAT_REQUEST_FAILED');
    expect(log.error).toHaveBeenCalledWith(
      {
        event: 'chat.failed',
        errorName: 'Error',
        errorCode: 'UPSTREAM',
        requestId: 'server-request-2',
        sessionId: 'session-2',
      },
      'Chat request failed',
    );
    expect(JSON.stringify(log.error.mock.calls)).not.toContain('SECRET_VALUE');
    expect(JSON.stringify(log.error.mock.calls)).not.toContain('provider token');
  });
});
