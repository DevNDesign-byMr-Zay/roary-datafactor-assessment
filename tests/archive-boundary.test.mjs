import { readFile } from 'node:fs/promises';
import { test } from '@jest/globals';
import assert from 'node:assert/strict';

const ROOT = 'Software Engineering & AI Tooling/';
const PROMOTED = Object.freeze([
  "Software Engineering & AI Tooling/Authentication & Security/Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs",
  "Software Engineering & AI Tooling/API Foundations/Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs",
  "Software Engineering & AI Tooling/Storage & File Services/Signed URL File Access/06 FINAL CORRECTED CODE/sign_route.mjs"
]);

const PACKAGE = new URL('../package.json', import.meta.url);
const JEST_CONFIG = new URL('../jest.config.mjs', import.meta.url);
const ESLINT_CONFIG = new URL('../eslint.config.js', import.meta.url);
const ARCHIVE = new URL('../ARCHIVE.md', import.meta.url);

function corpusPaths(source) {
  return [...source.matchAll(/['"]((?:Software Engineering & AI Tooling\/)[^'"]+)['"]/gu)]
    .map((match) => match[1]);
}

test('coverage measures only exact promoted corpus artifacts', async () => {
  const source = await readFile(JEST_CONFIG, 'utf8');
  const paths = corpusPaths(source);

  assert.deepEqual(paths, PROMOTED);
  assert.ok(paths.every((path) => !path.includes('*')));
  assert.match(source, /'src\/\*\*\/\*\.mjs'/u);
});

test('lint does not bulk-promote the historical corpus', async () => {
  const pkg = JSON.parse(await readFile(PACKAGE, 'utf8'));
  const eslint = await readFile(ESLINT_CONFIG, 'utf8');
  const lint = pkg?.scripts?.lint ?? '';

  for (const path of PROMOTED) {
    assert.ok(lint.includes(path), `lint script must include exact promoted artifact: ${path}`);
    assert.ok(eslint.includes(path), `ESLint config must include exact promoted artifact: ${path}`);
  }

  assert.doesNotMatch(lint, /Software Engineering & AI Tooling\/[^'"]*\*/u);
  assert.ok(corpusPaths(eslint).every((path) => !path.includes('*')));
});

test('archive contract documents the same promoted paths', async () => {
  const source = await readFile(ARCHIVE, 'utf8');

  assert.match(source, /Historical Corpus Boundary/u);
  assert.match(source, /Historical\/versioned provenance/u);
  for (const path of PROMOTED) {
    assert.ok(source.includes(`${ROOT}${path.slice(ROOT.length)}`));
  }
});
