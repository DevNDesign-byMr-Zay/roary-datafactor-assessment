import { afterEach, describe, expect, test } from '@jest/globals';

import { createLogger } from '../src/logger.mjs';

const originalLogLevel = process.env.LOG_LEVEL;

afterEach(() => {
  if (originalLogLevel === undefined) delete process.env.LOG_LEVEL;
  else process.env.LOG_LEVEL = originalLogLevel;
});

describe('structured logger factory', () => {
  test('defaults to info level', () => {
    delete process.env.LOG_LEVEL;
    const logger = createLogger();

    expect(logger.level).toBe('info');
  });

  test('respects LOG_LEVEL from the environment', () => {
    process.env.LOG_LEVEL = 'warn';
    const logger = createLogger();

    expect(logger.level).toBe('warn');
  });

  test('explicit options override the environment-derived default', () => {
    process.env.LOG_LEVEL = 'warn';
    const logger = createLogger({ level: 'debug' });

    expect(logger.level).toBe('debug');
  });

  test('omits default pid and hostname bindings', () => {
    const logger = createLogger();

    expect(logger.bindings()).toEqual({});
  });
});
