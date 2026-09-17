import { describe, expect, jest, test } from '@jest/globals';

import { createUnhandledErrorReporter } from '../src/error-reporting.mjs';

function logger() {
  return { warn: jest.fn() };
}

describe('unhandled error reporting', () => {
  test('requires a function when a reporting hook is configured', () => {
    expect(() => createUnhandledErrorReporter({ onUnhandledError: 'invalid', logger: logger() })).toThrow(
      'onUnhandledError must be a function when provided.',
    );
  });

  test('forwards the original error with frozen bounded context', () => {
    const log = logger();
    const onUnhandledError = jest.fn();
    const report = createUnhandledErrorReporter({ onUnhandledError, logger: log });
    const failure = new Error('provider failed');

    report(failure, { scope: 'http', requestId: 'req-1' });

    expect(onUnhandledError).toHaveBeenCalledTimes(1);
    const [reportedError, context] = onUnhandledError.mock.calls[0];
    expect(reportedError).toBe(failure);
    expect(context).toEqual({ scope: 'http', requestId: 'req-1' });
    expect(Object.isFrozen(context)).toBe(true);
    expect(log.warn).not.toHaveBeenCalled();
  });

  test('isolates synchronous reporter failures without logging raw error text', () => {
    const log = logger();
    const secret = 'telemetry-secret-do-not-log';
    const report = createUnhandledErrorReporter({
      logger: log,
      onUnhandledError: () => {
        throw new Error(secret);
      },
    });

    expect(() => report(new Error('request failed'), { scope: 'http' })).not.toThrow();
    expect(log.warn).toHaveBeenCalledWith(
      { event: 'error.reporter_failed', scope: 'http', errorName: 'Error' },
      'Unhandled error reporter failed',
    );
    expect(JSON.stringify(log.warn.mock.calls)).not.toContain(secret);
  });

  test('handles asynchronous reporter rejection without creating an unhandled rejection', async () => {
    const log = logger();
    const report = createUnhandledErrorReporter({
      logger: log,
      onUnhandledError: async () => {
        const error = new Error('async telemetry failed');
        error.code = 'TELEMETRY_DOWN';
        throw error;
      },
    });

    report(new Error('request failed'), { scope: 'http' });
    await Promise.resolve();

    expect(log.warn).toHaveBeenCalledWith(
      {
        event: 'error.reporter_failed',
        scope: 'http',
        errorName: 'Error',
        errorCode: 'TELEMETRY_DOWN',
      },
      'Unhandled error reporter failed',
    );
  });
});
