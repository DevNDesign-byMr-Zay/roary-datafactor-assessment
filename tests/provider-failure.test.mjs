import { describe, expect, test } from '@jest/globals';

import { classifyProviderFailure } from '../src/provider-failure.mjs';

describe('provider failure classification', () => {
  test.each([
    [{ status: 429 }, 429, 'UPSTREAM_RATE_LIMITED'],
    [{ code: 'RESOURCE_EXHAUSTED' }, 429, 'UPSTREAM_RATE_LIMITED'],
    [{ statusCode: 400 }, 422, 'UPSTREAM_REQUEST_REJECTED'],
    [{ code: 'INVALID_ARGUMENT' }, 422, 'UPSTREAM_REQUEST_REJECTED'],
    [{ status: 503 }, 503, 'UPSTREAM_UNAVAILABLE'],
    [{ code: 'UNAVAILABLE' }, 503, 'UPSTREAM_UNAVAILABLE'],
  ])('maps known provider failure %p to a stable response', (error, status, code) => {
    expect(classifyProviderFailure(error)).toMatchObject({ status, code });
  });

  test('leaves unknown failures on the generic internal-error path', () => {
    expect(classifyProviderFailure(new Error('provider internals'))).toBeNull();
  });

  test('does not execute accessor-backed provider metadata', () => {
    let reads = 0;
    const error = {};
    Object.defineProperty(error, 'status', {
      enumerable: true,
      get() {
        reads += 1;
        return 429;
      },
    });

    expect(classifyProviderFailure(error)).toBeNull();
    expect(reads).toBe(0);
  });

  test('does not coerce arbitrary values into provider codes or statuses', () => {
    expect(classifyProviderFailure({ status: '429', code: 429 })).toBeNull();
    expect(classifyProviderFailure({ status: true, code: false })).toBeNull();
  });
});
