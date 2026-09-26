import { access, readFile } from 'node:fs/promises';
import { test } from '@jest/globals';
import assert from 'node:assert/strict';

const CORPUS_ROOT = new URL('../Software Engineering & AI Tooling/', import.meta.url);
const PACKAGE = new URL('../package.json', import.meta.url);
const JEST_CONFIG = new URL('../jest.config.mjs', import.meta.url);
const ESLINT_CONFIG = new URL('../eslint.config.js', import.meta.url);
const SURFACES = new URL('../config/repository-surfaces.json', import.meta.url);
const ARCHIVE = new URL('../ARCHIVE.md', import.meta.url);

const PROMOTED = Object.freeze([
  'src/promoted/auth-middleware.mjs',
  'src/promoted/cors-policy.mjs',
  'src/promoted/sign-route.mjs',
]);

test('historical corpus is externalized from the scored application tree', async () => {
  await assert.rejects(access(CORPUS_ROOT), (error) => error?.code === 'ENOENT');
});

test('coverage measures the maintained source tree', async () => {
  const source = await readFile(JEST_CONFIG, 'utf8');
  assert.match(source, /'src\/\*\*\/\*\.mjs'/u);
  assert.doesNotMatch(source, /Software Engineering & AI Tooling/u);
});

test('lint targets maintained promoted copies without archive paths', async () => {
  const pkg = JSON.parse(await readFile(PACKAGE, 'utf8'));
  const eslint = await readFile(ESLINT_CONFIG, 'utf8');
  const lint = pkg?.scripts?.lint ?? '';

  assert.doesNotMatch(lint, /Software Engineering & AI Tooling/u);
  assert.doesNotMatch(eslint, /Software Engineering & AI Tooling/u);
  for (const path of PROMOTED) {
    assert.ok(eslint.includes(path), `ESLint config must retain promoted globals for ${path}`);
  }
});

test('archive contract binds maintained copies to immutable released provenance', async () => {
  const surfaces = JSON.parse(await readFile(SURFACES, 'utf8'));
  const archive = await readFile(ARCHIVE, 'utf8');

  assert.equal(surfaces.schemaVersion, 2);
  assert.equal(surfaces.historicalArchive.releaseTag, 'v1.1.2');
  assert.equal(
    surfaces.historicalArchive.releaseCommit,
    '67e7a0c297451b438ed950ba743318e3f7454159',
  );
  assert.equal(surfaces.historicalArchive.fileCount, 1610);
  assert.deepEqual(
    surfaces.promotedMaintainedArtifacts.map(({ path }) => path),
    PROMOTED,
  );
  assert.match(archive, /archive\/historical-corpus-v1\.1\.2/u);
  assert.match(archive, /1,610/u);
});
