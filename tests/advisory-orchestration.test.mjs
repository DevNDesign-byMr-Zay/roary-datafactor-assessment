import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildHarness({ advisoryCoordinator = null, requestId = 'request-advisory-1' } = {}) {
  const log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const model = {
    generateContent: jest.fn(async () => ({ response: { text: () => 'advisory-ready reply' } })),
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
      logger: log,
      requestIdFactory: () => requestId,
      advisoryCoordinator,
    }),
    add,
    log,
  };
}

describe('request-scoped advisory orchestration', () => {
  test('runs advisory work with correlation and abort context before persistence', async () => {
    const advisoryCoordinator = jest.fn(async (context) => {
      expect(Object.isFrozen(context)).toBe(true);
      expect(context.requestId).toBe('request-advisory-1');
      expect(context.sessionId).toBe('session-advisory-1');
      expect(context.reply).toBe('advisory-ready reply');
      expect(context.signal).toBeInstanceOf(globalThis.AbortSignal);
      expect(context.signal.aborted).toBe(false);
    });
    const { app, add } = buildHarness({ advisoryCoordinator });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'prepare advisory view', sessionId: 'session-advisory-1' });

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe('request-advisory-1');
    expect(advisoryCoordinator).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(2);
    expect(advisoryCoordinator.mock.invocationCallOrder[0]).toBeLessThan(
      add.mock.invocationCallOrder[0],
    );
  });

  test('does not persist a partial turn when advisory work fails', async () => {
    const advisoryCoordinator = jest.fn(async () => {
      throw Object.assign(new Error('private advisory provider detail'), {
        code: 'ADVISORY_FAILED',
      });
    });
    const { app, add, log } = buildHarness({
      advisoryCoordinator,
      requestId: 'request-advisory-2',
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'prepare advisory view', sessionId: 'session-advisory-2' });

    expect(response.status).toBe(500);
    expect(response.headers['x-request-id']).toBe('request-advisory-2');
    expect(response.body.error.code).toBe('CHAT_REQUEST_FAILED');
    expect(add).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith(
      {
        event: 'chat.failed',
        errorName: 'Error',
        errorCode: 'ADVISORY_FAILED',
        requestId: 'request-advisory-2',
        sessionId: 'session-advisory-2',
      },
      'Chat request failed',
    );
    expect(JSON.stringify(log.error.mock.calls)).not.toContain('private advisory provider detail');
  });

  test('rejects a non-function advisory coordinator during app construction', () => {
    expect(() => buildHarness({ advisoryCoordinator: {} })).toThrow(
      'advisoryCoordinator must be a function when provided.',
    );
  });
});
