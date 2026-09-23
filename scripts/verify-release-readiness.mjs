import { access, readFile } from 'node:fs/promises';

const REQUIRED_ENV_KEYS = Object.freeze([
  'GOOGLE_CLOUD_PROJECT',
  'VERTEX_LOCATION',
  'PORT',
  'LOG_LEVEL',
]);
const REQUIRED_FILES = Object.freeze([
  'Dockerfile',
  'compose.yaml',
  '.env.example',
  'ARCHIVE.md',
  'VERIFY_REPORT.json',
  'IMPORT_FAILURES.json',
  'docs/RELEASE_READINESS.md',
]);
const REQUIRED_SCRIPTS = Object.freeze([
  'start',
  'lint',
  'verify:integrity',
  'verify:surface',
  'typecheck',
  'test:coverage',
  'check',
  'verify:release',
]);

async function json(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function envKeys(source) {
  return new Set(
    source
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => line.slice(0, line.indexOf('='))),
  );
}

async function main() {
  const root = new URL('../', import.meta.url);
  await Promise.all(REQUIRED_FILES.map((path) => access(new URL(path, root))));

  const [pkg, verify, failures, env, ci, codeql] = await Promise.all([
    json('package.json'),
    json('VERIFY_REPORT.json'),
    json('IMPORT_FAILURES.json'),
    text('.env.example'),
    text('.github/workflows/ci.yml'),
    text('.github/workflows/codeql.yml'),
  ]);

  assert(/^\d+\.\d+\.\d+$/u.test(pkg.version), 'package version must be stable semantic version');
  assert(pkg.private === true, 'package must remain private');
  assert(typeof pkg.engines?.node === 'string' && pkg.engines.node.includes('22'), 'Node 22+ runtime contract is required');
  for (const name of REQUIRED_SCRIPTS) {
    assert(typeof pkg.scripts?.[name] === 'string' && pkg.scripts[name].trim(), `missing package script: ${name}`);
  }

  assert(verify.status === 'PASS — EXACT LIVE MATCH', 'live corpus verification must be an exact PASS');
  assert(verify.missing_repository_files === 0, 'release cannot proceed with missing corpus files');
  assert(verify.unexpected_repository_files === 0, 'release cannot proceed with unexpected corpus files');
  assert(
    verify.eligible_drive_files === verify.repository_files_under_corpus_root,
    'verified corpus counts must match',
  );
  assert(Array.isArray(failures) && failures.length === 0, 'release cannot proceed with unresolved import failures');

  const configured = envKeys(env);
  for (const key of REQUIRED_ENV_KEYS) {
    assert(configured.has(key), `.env.example is missing maintained runtime key: ${key}`);
  }

  assert(/pull_request:/u.test(ci), 'quality workflow must run for pull requests');
  assert(/npm ci --ignore-scripts/u.test(ci), 'quality workflow must use reproducible npm install');
  assert(/npm audit --audit-level=moderate/u.test(ci), 'quality workflow must enforce dependency audit');
  assert(/npm run typecheck/u.test(ci), 'quality workflow must enforce maintained JavaScript type-checking');
  assert(/npm run verify:surface/u.test(ci), 'quality workflow must verify the maintained/historical split');
  assert(/npm run test:coverage/u.test(ci), 'quality workflow must enforce coverage');
  assert(/docker compose up --build --detach/u.test(ci), 'quality workflow must prove container startup');
  assert(/pull_request:/u.test(codeql), 'CodeQL must run for pull requests');
  assert(/javascript-typescript/u.test(codeql), 'CodeQL must analyze the maintained JavaScript surface');

  process.stdout.write(
    `release readiness verified: v${pkg.version}, ${verify.repository_files_under_corpus_root} corpus files, no unresolved import failures\n`,
  );
}

await main();
