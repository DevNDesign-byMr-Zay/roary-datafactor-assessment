import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function logger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
}

function db({ rows = [], addImpl } = {}) {
  const add = jest.fn(addImpl ?? (async () => ({ id: 'write' })));
  const messages = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(async () => ({ docs: rows.map((row) => ({ data: () => row })) })),
      })),
    })),
    add,
  };
  return {
    database: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ collection: jest.fn(() => messages) })),
      })),
    },
    add,
  };
}

function vertex(generateContent = async () => ({ response: { text: () => 'answer' } })) {
  const model = { generateContent: jest.fn(generateContent) };
  return {
    client: { getGenerativeModel: jest.fn(() => model) },
    model,
  };
}

describe('application edge behavior', () => {
  test('rejects construction without a Vertex-compatible client', () => {
    const { database } = db();
    expect(() => createApp({ db: database, logger: logger() })).toThrow(TypeError);
  });

  test('rejects construction without a Firestore-compatible database', () => {
    const { client } = vertex();
    expect(() => createApp({ vertexClient: client, logger: logger() })).toThrow(TypeError);
  });

  test('rejects construction without a structured logger', () => {
    const { database } = db();
    const { client } = vertex();
    expect(() => createApp({ vertexClient: client, db: database })).toThrow(TypeError);
  });

  test('GET / returns the liveness message', async () => {
    const { database } = db();
    const { client } = vertex();
    const app = createApp({ vertexClient: client, db: database, logger: logger() });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Conversational AI service is live');
  });

  test('unknown routes return a structured 404', async () => {
    const { database } = db();
    const { client } = vertex();
    const app = createApp({ vertexClient: client, db: database, logger: logger() });

    const response = await request(app).get('/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });

  test('strict validation rejects unexpected request fields before model invocation', async () => {
    const { database } = db();
    const { client, model } = vertex();
    const log = logger();
    const app = createApp({ vertexClient: client, db: database, logger: log });

    const response = await request(app).post('/chat').send({ text: 'hello', extra: true });

    expect(response.status).toBe(400);
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'chat.validation_failed' },
      'Rejected invalid chat request',
    );
  });

  test('omitted session id uses the validated default session', async () => {
    const { database } = db();
    const { client } = vertex();
    const app = createApp({ vertexClient: client, db: database, logger: logger() });

    const response = await request(app).post('/chat').send({ text: 'hello' });

    expect(response.status).toBe(200);
    expect(response.body.sessionId).toBe('default');
  });

  test('Firestore load failures are sanitized and logged', async () => {
    const failure = new Error('database internals');
    const database = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              limit: jest.fn(() => ({ get: jest.fn(async () => { throw failure; }) })),
            })),
          })),
        })),
      })),
    };
    const { client } = vertex();
    const log = logger();
    const app = createApp({ vertexClient: client, db: database, logger: log });

    const response = await request(app).post('/chat').send({ text: 'hello', sessionId: 's1' });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('CHAT_REQUEST_FAILED');
    expect(JSON.stringify(response.body)).not.toContain('database internals');
    expect(log.error).toHaveBeenCalled();
  });
});
