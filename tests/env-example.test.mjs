import { readFile } from 'node:fs/promises';

import { describe, expect, test } from '@jest/globals';

const MAINTAINED_ENV_KEYS = Object.freeze([
  'GOOGLE_CLOUD_PROJECT',
  'VERTEX_LOCATION',
  'PORT',
  'LOG_LEVEL',
]);

const CI_RELEASE_ENV_KEYS = Object.freeze(['GITHUB_SHA', 'RELEASE_TAG']);

const PROMOTED_ARTIFACT_ENV_KEYS = Object.freeze([
  'ALLOWED_ORIGINS',
  'APP_API_TOKEN',
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

  test('documents CI-only release metadata names for complete environment discovery', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    const keys = declaredKeys(source);

    for (const key of CI_RELEASE_ENV_KEYS) {
      expect(keys.has(key)).toBe(true);
    }
  });

  test('documents environment names required by promoted maintained artifacts', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    const keys = declaredKeys(source);

    for (const key of PROMOTED_ARTIFACT_ENV_KEYS) {
      expect(keys.has(key)).toBe(true);
    }
  });
});
