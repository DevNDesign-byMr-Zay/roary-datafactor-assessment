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

function buildHistoryTimeoutApp() {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = { generateContent: jest.fn() };
  const vertexClient = { getGenerativeModel: jest.fn(() => model) };
  const messages = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({ get: jest.fn(() => new Promise(() => {})) })),
    })),
    add: jest.fn(),
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
      requestIdFactory: () => 'history-timeout-request-1',
      chatTimeoutMs: 10,
    }),
    logger,
    model,
    add: messages.add,
  };
}

function buildLateModelApp() {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = {
    generateContent: jest.fn(
      () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ response: { text: () => 'late reply' } }), 30);
        });
      },
    ),
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
      requestIdFactory: () => 'late-model-request-1',
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
        requestId: 'timeout-request-1',
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

  test('bounds history loading by the same request deadline', async () => {
    const { app, logger, model, add } = buildHistoryTimeoutApp();

    const response = await request(app)
      .post('/chat')
      .send({ text: 'hello', sessionId: 'session-history-timeout' });

    expect(response.status).toBe(504);
    expect(response.headers['x-request-id']).toBe('history-timeout-request-1');
    expect(response.body).toEqual({
      error: {
        code: 'CHAT_TIMEOUT',
        message: 'The chat request timed out.',
        requestId: 'history-timeout-request-1',
      },
    });
    expect(model.generateContent).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      {
        event: 'chat.timed_out',
        requestId: 'history-timeout-request-1',
        sessionId: 'session-history-timeout',
      },
      'Chat request timed out',
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('does not persist when the model resolves after the request deadline', async () => {
    const { app, logger, model, add } = buildLateModelApp();

    const response = await request(app)
      .post('/chat')
      .send({ text: 'hello', sessionId: 'session-late-model' });

    expect(response.status).toBe(504);
    expect(response.headers['x-request-id']).toBe('late-model-request-1');
    expect(response.body.error.code).toBe('CHAT_TIMEOUT');
    expect(model.generateContent).toHaveBeenCalledTimes(1);
    expect(add).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      {
        event: 'chat.timed_out',
        requestId: 'late-model-request-1',
        sessionId: 'session-late-model',
      },
      'Chat request timed out',
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});
