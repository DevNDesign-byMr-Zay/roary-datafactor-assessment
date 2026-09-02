import { describe, expect, test } from '@jest/globals';

import { extractModelText } from '../src/model-response.mjs';

describe('model response extraction', () => {
  test('uses response.text() and trims the returned text', () => {
    expect(extractModelText({ response: { text: () => '  answer  ' } })).toBe('answer');
  });

  test('accepts a direct response.text string', () => {
    expect(extractModelText({ response: { text: '  direct answer  ' } })).toBe('direct answer');
  });

  test('joins text candidate parts in order', () => {
    const result = {
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: 'line one' }, { text: '' }, { text: 'line two' }],
            },
          },
        ],
      },
    };

    expect(extractModelText(result)).toBe('line one\nline two');
  });

  test('falls back to top-level candidates when response candidates are absent', () => {
    const result = {
      candidates: [{ content: { parts: [{ text: 'fallback' }] } }],
    };

    expect(extractModelText(result)).toBe('fallback');
  });

  test('skips empty candidates and returns the first candidate containing text', () => {
    const result = {
      response: {
        candidates: [
          { content: { parts: [{ text: '   ' }] } },
          { content: { parts: [{ text: 'usable' }] } },
        ],
      },
    };

    expect(extractModelText(result)).toBe('usable');
  });

  test.each([undefined, null, {}, { response: {} }, { response: { text: () => '   ' } }])(
    'returns an empty string for non-text responses: %p',
    (value) => {
      expect(extractModelText(value)).toBe('');
    },
  );
});
