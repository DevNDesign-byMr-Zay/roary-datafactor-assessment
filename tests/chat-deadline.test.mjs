import { describe, expect, jest, test } from '@jest/globals';

import {
  ChatAbortError,
  ChatTimeoutError,
  createChatDeadlineBudget,
  runWithChatDeadline,
} from '../src/chat-deadline.mjs';

describe('chat deadline boundary', () => {
  test('tracks one absolute deadline and exposes only remaining budget', () => {
    const readings = [1_000, 1_020, 1_065, 1_101];
    const nowFn = jest.fn(() => readings.shift());
    const budget = createChatDeadlineBudget(100, { nowFn });

    expect(budget.deadlineAt).toBe(1_100);
    expect(budget.remainingMs()).toBe(80);
    expect(budget.remainingMs()).toBe(35);
    expect(() => budget.remainingMs()).toThrow(ChatTimeoutError);
  });

  test('rejects invalid deadline clock configuration', () => {
    expect(() => createChatDeadlineBudget(0)).toThrow(TypeError);
    expect(() => createChatDeadlineBudget(100, { nowFn: 'bad' })).toThrow(TypeError);
    expect(() => createChatDeadlineBudget(100, { nowFn: () => Number.NaN })).toThrow(TypeError);
  });

  test('returns successful task results and clears the timer', async () => {
    const setTimeoutFn = jest.fn(() => 'timer-1');
    const clearTimeoutFn = jest.fn();

    await expect(
      runWithChatDeadline(async () => 'ok', {
        timeoutMs: 100,
        setTimeoutFn,
        clearTimeoutFn,
      }),
    ).resolves.toBe('ok');

    expect(setTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 100);
    expect(clearTimeoutFn).toHaveBeenCalledWith('timer-1');
  });

  test('fails with a stable timeout error when the deadline wins', async () => {
    let fireTimeout;
    const setTimeoutFn = jest.fn((callback) => {
      fireTimeout = callback;
      return 'timer-2';
    });
    const clearTimeoutFn = jest.fn();
    const pending = runWithChatDeadline(() => new Promise(() => {}), {
      timeoutMs: 50,
      setTimeoutFn,
      clearTimeoutFn,
    });

    fireTimeout();

    await expect(pending).rejects.toBeInstanceOf(ChatTimeoutError);
    await expect(pending).rejects.toMatchObject({ code: 'CHAT_TIMEOUT' });
    expect(clearTimeoutFn).toHaveBeenCalledWith('timer-2');
  });

  test('fails immediately when the request is already aborted', async () => {
    const controller = new globalThis.AbortController();
    const task = jest.fn(async () => 'should-not-run');
    controller.abort();

    await expect(
      runWithChatDeadline(task, {
        timeoutMs: 100,
        signal: controller.signal,
      }),
    ).rejects.toBeInstanceOf(ChatAbortError);
    expect(task).not.toHaveBeenCalled();
  });

  test('stops waiting when the request aborts after work starts', async () => {
    const controller = new globalThis.AbortController();
    const clearTimeoutFn = jest.fn();
    const pending = runWithChatDeadline(() => new Promise(() => {}), {
      timeoutMs: 100,
      signal: controller.signal,
      setTimeoutFn: () => 'timer-3',
      clearTimeoutFn,
    });

    controller.abort();

    await expect(pending).rejects.toBeInstanceOf(ChatAbortError);
    expect(clearTimeoutFn).toHaveBeenCalledWith('timer-3');
  });
});
