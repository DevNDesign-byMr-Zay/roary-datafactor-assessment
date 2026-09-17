import { readFile } from 'node:fs/promises';

import { describe, expect, test } from '@jest/globals';

const MAINTAINED_ENV_KEYS = Object.freeze([
  'GOOGLE_CLOUD_PROJECT',
  'VERTEX_LOCATION',
  'PORT',
  'LOG_LEVEL',
]);

function declaredKeys(source) {
  return new Set(
    source
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split('=', 1)[0]),
  );
}

describe('maintained environment example', () => {
  test('documents every environment key used by the maintained service', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    const keys = declaredKeys(source);

    for (const key of MAINTAINED_ENV_KEYS) {
      expect(keys.has(key)).toBe(true);
    }
  });
});
