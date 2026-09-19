import { readFile } from 'node:fs/promises';
import { test } from '@jest/globals';
import assert from 'node:assert/strict';

const WORKFLOW = new URL('../.github/workflows/import-drive.yml', import.meta.url);
const IMPORTER = new URL('../.github/scripts/import_drive.py', import.meta.url);
const VERIFY_WORKFLOW = new URL('../.github/workflows/verify-drive.yml', import.meta.url);
const FAILURES = new URL('../IMPORT_FAILURES.json', import.meta.url);

test('Drive import automation cannot bypass review or exact-head CI', async () => {
  const workflow = await readFile(WORKFLOW, 'utf8');

  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /pull-requests:\s*write/u);
  assert.match(workflow, /gh pr create/u);
  assert.doesNotMatch(workflow, /\[skip ci\]/iu);
  assert.doesNotMatch(workflow, /git push origin HEAD:main/u);
});


test('Drive verification reports also require review before main changes', async () => {
  const workflow = await readFile(VERIFY_WORKFLOW, 'utf8');

  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /pull-requests:\s*write/u);
  assert.match(workflow, /gh pr create/u);
  assert.doesNotMatch(workflow, /\[skip ci\]/iu);
  assert.doesNotMatch(workflow, /git push origin HEAD:main/u);
});

test('Drive importer stages a complete mirror before replacing the live corpus', async () => {
  const source = await readFile(IMPORTER, 'utf8');
  const normalized = source.toLowerCase();

  assert.doesNotMatch(normalized, /datafactor/u);
  assert.match(source, /tempfile\.mkdtemp/u);
  assert.doesNotMatch(source, /shutil\.rmtree\(STAGING_ROOT\)/u);

  const failureGuard = source.indexOf('if failures:');
  const liveSwap = source.indexOf('STAGING_ROOT.rename(backup_root)');
  assert.ok(failureGuard >= 0, 'transaction must explicitly stop on blocked downloads');
  assert.ok(liveSwap > failureGuard, 'live corpus swap must occur only after the failure guard');
});

test('mainline import status has no unresolved repository gaps', async () => {
  const failures = JSON.parse(await readFile(FAILURES, 'utf8'));
  assert.deepEqual(failures, []);
});
