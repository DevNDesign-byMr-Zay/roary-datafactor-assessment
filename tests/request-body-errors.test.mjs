import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildApp() {
  const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = { generateContent: jest.fn(async () => ({ response: { text: () => 'answer' } })) };
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

  return { app: createApp({ vertexClient, db, logger: log }), log, model };
}

describe('request body failures', () => {
  test('malformed JSON returns a structured 400 before model invocation', async () => {
    const { app, log, model } = buildApp();

    const response = await request(app)
      .post('/chat')
      .set('Content-Type', 'application/json')
      .send('{"text":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must contain valid JSON.',
      },
    });
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'request.invalid_json' },
      'Rejected malformed JSON request',
    );
  });

  test('oversized JSON returns a structured 413 before model invocation', async () => {
    const { app, log, model } = buildApp();

    const response = await request(app)
      .post('/chat')
      .send({ text: 'x'.repeat(70 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: {
        code: 'REQUEST_TOO_LARGE',
        message: 'Request body exceeds the 64kb limit.',
      },
    });
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'request.body_too_large' },
      'Rejected oversized request body',
    );
  });

  test('unsupported content encoding returns a structured 415 before model invocation', async () => {
    const { app, log, model } = buildApp();

    const response = await request(app)
      .post('/chat')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'snappy')
      .send('{"text":"hello","sessionId":"session-123"}');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: {
        code: 'UNSUPPORTED_CONTENT_ENCODING',
        message: 'Request content encoding is not supported.',
      },
    });
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'request.unsupported_encoding' },
      'Rejected unsupported request encoding',
    );
  });

  test('non-JSON chat requests return a structured 415 before validation or model invocation', async () => {
    const { app, log, model } = buildApp();

    const response = await request(app)
      .post('/chat')
      .set('Content-Type', 'text/plain')
      .send('{"text":"hello","sessionId":"session-123"}');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Chat requests must use application/json.',
      },
    });
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'request.unsupported_media_type' },
      'Rejected non-JSON chat request',
    );
  });
});
