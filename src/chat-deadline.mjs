export class ChatTimeoutError extends Error {
  constructor() {
    super('Chat generation exceeded the configured deadline.');
    this.name = 'ChatTimeoutError';
    this.code = 'CHAT_TIMEOUT';
  }
}

export class ChatAbortError extends Error {
  constructor() {
    super('Chat request was aborted by the client.');
    this.name = 'ChatAbortError';
    this.code = 'CHAT_ABORTED';
  }
}

function readNow(nowFn) {
  const value = nowFn();
  if (!Number.isFinite(value)) throw new TypeError('nowFn must return a finite number.');
  return value;
}

export function createChatDeadlineBudget(timeoutMs, { nowFn = Date.now } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('timeoutMs must be a positive finite number.');
  }
  if (typeof nowFn !== 'function') throw new TypeError('nowFn must be a function.');

  const deadlineAt = readNow(nowFn) + timeoutMs;

  return Object.freeze({
    deadlineAt,
    remainingMs() {
      const remaining = deadlineAt - readNow(nowFn);
      if (remaining <= 0) throw new ChatTimeoutError();
      return remaining;
    },
  });
}

/**
 * Run a task against an explicit request deadline and optional client abort signal.
 *
 * @param {() => unknown | Promise<unknown>} task
 * @param {{
 *   timeoutMs?: number,
 *   signal?: AbortSignal,
 *   setTimeoutFn?: typeof setTimeout,
 *   clearTimeoutFn?: typeof clearTimeout
 * }} [options]
 */
export async function runWithChatDeadline(
  task,
  {
    timeoutMs,
    signal,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
  } = {},
) {
  if (typeof task !== 'function') throw new TypeError('task must be a function.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('timeoutMs must be a positive finite number.');
  }
  if (typeof setTimeoutFn !== 'function' || typeof clearTimeoutFn !== 'function') {
    throw new TypeError('timer functions are required.');
  }
  if (signal?.aborted) throw new ChatAbortError();

  let timerId;
  let abortHandler;

  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeoutFn(() => reject(new ChatTimeoutError()), timeoutMs);
  });

  const racers = [Promise.resolve().then(task), timeoutPromise];

  if (signal) {
    racers.push(
      new Promise((_, reject) => {
        abortHandler = () => reject(new ChatAbortError());
        signal.addEventListener('abort', abortHandler, { once: true });
      }),
    );
  }

  try {
    return await Promise.race(racers);
  } finally {
    if (timerId !== undefined) clearTimeoutFn(timerId);
    if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
  }
}
