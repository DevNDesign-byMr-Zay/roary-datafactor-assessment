import { describe, expect, test } from '@jest/globals';

import { parseChatRequest } from '../src/validation.mjs';

describe('chat request validation', () => {
  test('accepts valid input, trims strings, and preserves an explicit session id', () => {
    const result = parseChatRequest({ text: '  hello  ', sessionId: '  session-1  ' });

    expect(result).toEqual({
      ok: true,
      value: { text: 'hello', sessionId: 'session-1' },
    });
  });

  test('defaults the session id when it is omitted', () => {
    const result = parseChatRequest({ text: 'hello' });

    expect(result).toEqual({
      ok: true,
      value: { text: 'hello', sessionId: 'default' },
    });
  });

  test.each([
    [null, 'null body'],
    [{}, 'missing text'],
    [{ text: '' }, 'empty text'],
    [{ text: '   ' }, 'whitespace-only text'],
  ])('rejects %s (%s)', (body) => {
    const result = parseChatRequest(body);

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('INVALID_CHAT_REQUEST');
    expect(result.error.fields.text).toBeDefined();
  });

  test('rejects text over the 12,000 character boundary', () => {
    const result = parseChatRequest({ text: 'x'.repeat(12_001) });

    expect(result.ok).toBe(false);
    expect(result.error.fields.text).toBeDefined();
  });

  test('accepts text exactly at the 12,000 character boundary', () => {
    const result = parseChatRequest({ text: 'x'.repeat(12_000) });

    expect(result.ok).toBe(true);
    expect(result.value.text).toHaveLength(12_000);
  });

  test('rejects session ids over 128 characters', () => {
    const result = parseChatRequest({ text: 'hello', sessionId: 's'.repeat(129) });

    expect(result.ok).toBe(false);
    expect(result.error.fields.sessionId).toBeDefined();
  });

  test.each(['session/child', 'session id', '.hidden', ':prefixed', 'session@host']) (
    'rejects unsupported session identifier %s',
    (sessionId) => {
      const result = parseChatRequest({ text: 'hello', sessionId });

      expect(result.ok).toBe(false);
      expect(result.error.fields.sessionId).toBeDefined();
    },
  );

  test('accepts the supported session identifier character set at the boundary', () => {
    const sessionId = `s${'a'.repeat(120)}._:-`;
    const result = parseChatRequest({ text: 'hello', sessionId });

    expect(sessionId).toHaveLength(125);
    expect(result).toEqual({
      ok: true,
      value: { text: 'hello', sessionId },
    });
  });

  test('rejects unknown request fields because the schema is strict', () => {
    const result = parseChatRequest({ text: 'hello', unexpected: true });

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('INVALID_CHAT_REQUEST');
  });
});
