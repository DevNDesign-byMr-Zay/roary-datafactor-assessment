import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from './src/app.mjs';

function makeLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

function makeDb(seedDescending = []) {
  const writes = [];
  const collection = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(async () => ({
          docs: seedDescending.map((row) => ({ data: () => row })),
        })),
      })),
    })),
    add: jest.fn(async (row) => {
      writes.push(row);
      return { id: `write-${writes.length}` };
    }),
  };

  const db = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => collection),
      })),
    })),
  };

  return { db, writes, collection };
}

function makeVertex(generateContent) {
  const model = { generateContent: jest.fn(generateContent) };
  const vertexClient = {
    getGenerativeModel: jest.fn(() => model),
  };
  return { vertexClient, model };
}

describe('assessment service', () => {
  test('GET /health returns a healthy service contract', async () => {
    const { db } = makeDb();
    const { vertexClient } = makeVertex(async () => ({ response: { text: () => 'unused' } }));
    const app = createApp({
      vertexClient,
      db,
      logger: makeLogger(),
      healthNowFn: () => 7_000,
      startedAt: 2_000,
      serviceVersion: '1.1.0-test',
    });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      status: 'ok',
      service: 'conversational-ai-service',
      version: '1.1.0-test',
      uptimeSeconds: 5,
      project: 'assessment-project',
      location: 'us-central1',
      model: 'gemini-2.5-flash',
    });
  });

  test('POST /chat returns a mocked model reply and persists both turns', async () => {
    const { db, writes } = makeDb([
      { role: 'assistant', text: 'Earlier answer' },
      { role: 'user', text: 'Earlier question' },
    ]);
    const { vertexClient, model } = makeVertex(async () => ({
      response: { text: () => 'Mocked answer' },
    }));
    const app = createApp({ vertexClient, db, logger: makeLogger() });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'New question', sessionId: 'session-123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ reply: 'Mocked answer', sessionId: 'session-123' });
    expect(model.generateContent).toHaveBeenCalledWith({
      contents: [
        { role: 'user', parts: [{ text: 'Earlier question' }] },
        { role: 'model', parts: [{ text: 'Earlier answer' }] },
        { role: 'user', parts: [{ text: 'New question' }] },
      ],
    });
    expect(writes.map(({ role, text }) => ({ role, text }))).toEqual([
      { role: 'user', text: 'New question' },
      { role: 'assistant', text: 'Mocked answer' },
    ]);
  });

  test('POST /chat rejects a missing text field with 400', async () => {
    const { db } = makeDb();
    const { vertexClient, model } = makeVertex(async () => ({ response: { text: () => 'unused' } }));
    const app = createApp({ vertexClient, db, logger: makeLogger() });

    const response = await request(app).post('/chat').send({ sessionId: 'session-123' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_CHAT_REQUEST');
    expect(response.body.error.requestId).toBe(response.headers['x-request-id']);
    expect(model.generateContent).not.toHaveBeenCalled();
  });

  test('POST /chat returns a correlated sanitized 500 when model generation fails', async () => {
    const { db } = makeDb();
    const secretFailure = new Error('provider secret details must not leak');
    const { vertexClient } = makeVertex(async () => {
      throw secretFailure;
    });
    const logger = makeLogger();
    const app = createApp({ vertexClient, db, logger });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'Trigger failure', sessionId: 'session-123' });
    const requestId = response.headers['x-request-id'];

    expect(response.status).toBe(500);
    expect(requestId).toBeTruthy();
    expect(response.body).toEqual({
      error: {
        code: 'CHAT_REQUEST_FAILED',
        message: 'Unable to complete the chat request.',
        requestId,
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('provider secret details');
    expect(logger.error).toHaveBeenCalled();
  });

  test('POST /chat returns a correlated sanitized 429 for provider rate limits', async () => {
    const { db } = makeDb();
    const providerFailure = Object.assign(new Error('quota account details must not leak'), {
      code: 'RESOURCE_EXHAUSTED',
    });
    const { vertexClient } = makeVertex(async () => {
      throw providerFailure;
    });
    const logger = makeLogger();
    const app = createApp({
      vertexClient,
      db,
      logger,
      requestIdFactory: () => 'request-rate-limited',
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'Try the provider', sessionId: 'session-123' });

    expect(response.status).toBe(429);
    expect(response.headers['x-request-id']).toBe('request-rate-limited');
    expect(response.body).toEqual({
      error: {
        code: 'UPSTREAM_RATE_LIMITED',
        message: 'The model provider is temporarily rate limited.',
        requestId: 'request-rate-limited',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('quota account details');
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'chat.provider_rate_limited',
        requestId: 'request-rate-limited',
        sessionId: 'session-123',
        errorCode: 'RESOURCE_EXHAUSTED',
      }),
      'Model provider request failed',
    );
  });

  test('POST /chat keeps unknown model failures on the generic sanitized 500 contract', async () => {
    const { db } = makeDb();
    const { vertexClient } = makeVertex(async () => {
      throw new Error('unknown provider secret');
    });
    const app = createApp({
      vertexClient,
      db,
      logger: makeLogger(),
      requestIdFactory: () => 'request-provider-unknown',
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'Trigger unknown failure', sessionId: 'session-123' });

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({
      code: 'CHAT_REQUEST_FAILED',
      message: 'Unable to complete the chat request.',
      requestId: 'request-provider-unknown',
    });
    expect(JSON.stringify(response.body)).not.toContain('unknown provider secret');
  });

  test('POST /chat returns 502 when the provider yields no text', async () => {
    const { db } = makeDb();
    const { vertexClient } = makeVertex(async () => ({ response: { candidates: [] } }));
    const app = createApp({ vertexClient, db, logger: makeLogger() });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'No text please', sessionId: 'session-123' });

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('EMPTY_MODEL_RESPONSE');
    expect(response.body.error.requestId).toBe(response.headers['x-request-id']);
  });
});
