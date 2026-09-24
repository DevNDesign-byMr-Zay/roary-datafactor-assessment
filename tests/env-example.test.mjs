import { readFile } from 'node:fs/promises';

import { describe, expect, test } from '@jest/globals';

const MAINTAINED_ENV_KEYS = Object.freeze([
  'GOOGLE_CLOUD_PROJECT',
  'VERTEX_LOCATION',
  'PORT',
  'LOG_LEVEL',
]);

const HISTORICAL_REFERENCE_ENV_KEYS = Object.freeze([
  'ALLOWED_ORIGINS',
  'APP_API_TOKEN',
  'ASTER_API_TOKEN',
  'ASTER_EXPAND_MASK_FEATHER',
  'ASTER_EXPAND_PREFILL_BLUR',
  'ASTER_FILL_GUIDANCE',
  'ASTER_PROMPT_MAX_CHARS',
  'BUCKET_NAME',
  'GEMINI_API_KEY',
  'GOOGLE_CLOUD_REGION',
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

describe('environment example', () => {
  test('documents every environment key used by the maintained service', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    const keys = declaredKeys(source);

    for (const key of MAINTAINED_ENV_KEYS) {
      expect(keys.has(key)).toBe(true);
    }
  });

  test('documents reference-only environment names found in the preserved corpus', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    const keys = declaredKeys(source);

    for (const key of HISTORICAL_REFERENCE_ENV_KEYS) {
      expect(keys.has(key)).toBe(true);
    }
  });
});
