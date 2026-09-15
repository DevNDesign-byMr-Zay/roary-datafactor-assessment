import { describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../src/app.mjs';

function buildHarness({
  advisoryCoordinator = null,
  requestId = 'request-advisory-1',
  chatTimeoutMs = 15_000,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  nowFn = Date.now,
} = {}) {
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
      chatTimeoutMs,
      setTimeoutFn,
      clearTimeoutFn,
      nowFn,
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

  test('shares one shrinking deadline across history, model, and advisory work', async () => {
    const readings = [1_000, 1_010, 1_020, 1_065, 1_070];
    const nowFn = jest.fn(() => readings.shift());
    const setTimeoutFn = jest.fn((_callback, timeoutMs) => `timer-${timeoutMs}`);
    const clearTimeoutFn = jest.fn();
    const advisoryCoordinator = jest.fn(async () => undefined);
    const { app, add } = buildHarness({
      advisoryCoordinator,
      chatTimeoutMs: 100,
      nowFn,
      setTimeoutFn,
      clearTimeoutFn,
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'share one budget', sessionId: 'session-budget' });

    expect(response.status).toBe(200);
    expect(setTimeoutFn.mock.calls.map(([, timeoutMs]) => timeoutMs)).toEqual([90, 80, 35]);
    expect(advisoryCoordinator).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(2);
  });

  test('fails before advisory work when generation consumes the remaining budget', async () => {
    const readings = [1_000, 1_020, 1_100];
    const nowFn = jest.fn(() => readings.shift());
    const advisoryCoordinator = jest.fn(async () => undefined);
    const { app, add, log } = buildHarness({
      advisoryCoordinator,
      requestId: 'request-budget-exhausted',
      chatTimeoutMs: 100,
      nowFn,
      setTimeoutFn: jest.fn(() => 'timer'),
      clearTimeoutFn: jest.fn(),
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'consume the budget', sessionId: 'session-budget-exhausted' });

    expect(response.status).toBe(504);
    expect(response.body.error.requestId).toBe('request-budget-exhausted');
    expect(advisoryCoordinator).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      {
        event: 'chat.timed_out',
        requestId: 'request-budget-exhausted',
        sessionId: 'session-budget-exhausted',
      },
      'Chat request timed out',
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

  test('times out hanging advisory work without persisting a partial turn', async () => {
    let timerCalls = 0;
    const setTimeoutFn = jest.fn((callback) => {
      timerCalls += 1;
      if (timerCalls === 3) globalThis.queueMicrotask(callback);
      return timerCalls;
    });
    const clearTimeoutFn = jest.fn();
    const advisoryCoordinator = jest.fn(() => new Promise(() => {}));
    const { app, add, log } = buildHarness({
      advisoryCoordinator,
      requestId: 'request-advisory-timeout',
      setTimeoutFn,
      clearTimeoutFn,
    });

    const response = await request(app)
      .post('/chat')
      .send({ text: 'prepare bounded advisory view', sessionId: 'session-advisory-timeout' });

    expect(response.status).toBe(504);
    expect(response.headers['x-request-id']).toBe('request-advisory-timeout');
    expect(response.body.error.code).toBe('CHAT_TIMEOUT');
    expect(advisoryCoordinator).toHaveBeenCalledTimes(1);
    expect(add).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith(
      {
        event: 'chat.timed_out',
        requestId: 'request-advisory-timeout',
        sessionId: 'session-advisory-timeout',
      },
      'Chat request timed out',
    );
  });

  test('rejects invalid orchestration dependencies during app construction', () => {
    expect(() => buildHarness({ advisoryCoordinator: {} })).toThrow(
      'advisoryCoordinator must be a function when provided.',
    );
    expect(() => buildHarness({ nowFn: 'bad' })).toThrow('nowFn must be a function.');
  });
});
