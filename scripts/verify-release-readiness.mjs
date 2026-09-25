import { access, readFile } from 'node:fs/promises';

const REQUIRED_ENV_KEYS = Object.freeze([
  'GOOGLE_CLOUD_PROJECT',
  'VERTEX_LOCATION',
  'PORT',
  'LOG_LEVEL',
  'GITHUB_SHA',
  'RELEASE_TAG',
]);
const REQUIRED_FILES = Object.freeze([
  'Dockerfile',
  'compose.yaml',
  'docker-compose.yml',
  '.env.example',
  '.repo-class.json',
  'docs/PROJECT_SCOPE.md',
  'jsconfig.json',
  'ARCHIVE.md',
  'config/repository-surfaces.json',
  'provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json',
  'docs/HISTORICAL_CORPUS_SEPARATION.md',
  'docs/RELEASE_READINESS.md',
  '.github/workflows/release.yml',
  '.github/dependabot.yml',
  'SECURITY.md',
  'CONTRIBUTING.md',
  '.github/CODEOWNERS',
  '.github/pull_request_template.md',
  'scripts/create-release-manifest.mjs',
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

  const [
    pkg,
    surfaces,
    archiveManifest,
    env,
    changelog,
    ci,
    codeql,
    release,
    dependabot,
    classification,
    projectScope,
    readme,
    typeConfig,
    appSource,
  ] = await Promise.all([
    json('package.json'),
    json('config/repository-surfaces.json'),
    json('provenance/HISTORICAL_CORPUS_V1_1_2_MANIFEST.json'),
    text('.env.example'),
    text('CHANGELOG.md'),
    text('.github/workflows/ci.yml'),
    text('.github/workflows/codeql.yml'),
    text('.github/workflows/release.yml'),
    text('.github/dependabot.yml'),
    json('.repo-class.json'),
    text('docs/PROJECT_SCOPE.md'),
    text('README.md'),
    json('jsconfig.json'),
    text('src/app.mjs'),
  ]);

  assert(/^\d+\.\d+\.\d+$/u.test(pkg.version), 'package version must be stable semantic version');
  assert(
    appSource.includes(`const SERVICE_VERSION = '${pkg.version}';`),
    'health service version must match package.json',
  );
  assert(
    /uptimeSeconds/u.test(appSource) && /status:\s*'ok'/u.test(appSource),
    'health endpoint must expose conventional status and uptime metadata',
  );
  assert(
    classification.primaryClass === 'application-service',
    'repository classification must remain application-service',
  );
  assert(
    classification.excludedClasses?.includes('infrastructure-as-code'),
    'repository classification must explicitly exclude infrastructure-as-code',
  );
  assert(
    /not an infrastructure-as-code repository/iu.test(projectScope),
    'project scope must preserve the application-vs-IaC boundary',
  );
  assert(/^# ROARY Conversational AI Service$/mu.test(readme), 'README must lead with the maintained ROARY application');
  assert(/application service/iu.test(readme.slice(0, 1200)), 'README opening must identify ROARY as an application service');
  assert(/historical engineering corpus/iu.test(readme.slice(0, 1600)), 'README opening must preserve the historical-corpus boundary');
  assert(typeConfig.compilerOptions?.checkJs === true, 'maintained JavaScript checkJs must remain enabled');
  for (const path of [
    'src/app.mjs',
    'src/server.mjs',
    'src/cloud.mjs',
    'src/holographic/contracts.mjs',
    'src/holographic/planner.mjs',
    'src/holographic/calibration.mjs',
    'src/holographic/adapters.mjs',
    'src/holographic/runtime.mjs',
    'src/holographic/scene-packet.mjs',
    'src/services/renewable-opportunity-advisory.mjs',
    'src/services/workload-flexibility-evidence.mjs',
  ]) {
    assert(typeConfig.files?.includes(path), `critical maintained typecheck surface missing: ${path}`);
  }

  assert(pkg.private === true, 'package must remain private');
  assert(typeof pkg.engines?.node === 'string' && pkg.engines.node.includes('22'), 'Node 22+ runtime contract is required');
  for (const name of REQUIRED_SCRIPTS) {
    assert(typeof pkg.scripts?.[name] === 'string' && pkg.scripts[name].trim(), `missing package script: ${name}`);
  }

  assert(surfaces.schemaVersion === 2, 'repository surface manifest must use external-archive schema');
  assert(
    surfaces.historicalArchive?.releaseCommit === archiveManifest.release_commit,
    'historical archive release commit must match the full corpus manifest',
  );
  assert(
    surfaces.historicalArchive?.releaseTree === archiveManifest.release_tree,
    'historical archive release tree must match the full corpus manifest',
  );
  assert(
    surfaces.historicalArchive?.fileCount === 1610 &&
      archiveManifest.corpus_file_count === 1610 &&
      archiveManifest.files?.length === 1610,
    'historical archive manifest must preserve all 1610 released corpus files',
  );
  assert(
    surfaces.historicalArchive?.canonicalInventorySha256 ===
      archiveManifest.canonical_inventory_sha256,
    'historical archive inventory digest must match the repository surface contract',
  );
  let corpusPresent = true;
  try {
    await access(new URL('../Software Engineering & AI Tooling/', import.meta.url));
  } catch (error) {
    if (error?.code === 'ENOENT') corpusPresent = false;
    else throw error;
  }
  assert(!corpusPresent, 'historical corpus must remain outside the scored application tree');

  assert(/## Unreleased/u.test(changelog), 'changelog must describe the current unreleased state');
  assert(
    /candidate is not published until the gated manual release workflow publishes it/iu.test(
      changelog,
    ),
    'changelog must distinguish the current candidate from hosted releases',
  );
  assert(
    changelog.includes(`Current package candidate: \`${pkg.version}\``),
    'changelog candidate version must match package.json',
  );

  const configured = envKeys(env);
  for (const key of REQUIRED_ENV_KEYS) {
    assert(configured.has(key), `.env.example is missing maintained runtime key: ${key}`);
  }

  assert(/pull_request:/u.test(ci), 'quality workflow must run for pull requests');
  assert(/npm ci --ignore-scripts/u.test(ci), 'quality workflow must use reproducible npm install');
  assert(/npm audit --audit-level=moderate/u.test(ci), 'quality workflow must enforce dependency audit');
  assert(/package-ecosystem:\s*npm/u.test(dependabot), 'Dependabot must track npm dependencies');
  assert(/package-ecosystem:\s*github-actions/u.test(dependabot), 'Dependabot must track GitHub Actions');
  const weeklySchedules = dependabot.match(/interval:\s*weekly/gu) ?? [];
  assert(weeklySchedules.length >= 2, 'Dependabot must run weekly for npm and GitHub Actions');
  assert(/npm run typecheck/u.test(ci), 'quality workflow must enforce maintained JavaScript type-checking');
  assert(/npm run verify:surface/u.test(ci), 'quality workflow must verify the maintained/archive split');
  assert(/npm test/u.test(ci), 'quality workflow must expose the conventional npm test suite');
  assert(/npm run test:coverage/u.test(ci), 'quality workflow must enforce coverage');
  assert(/env -u GOOGLE_APPLICATION_CREDENTIALS npm run test:coverage/u.test(ci), 'coverage tests must explicitly run without Google credential environment');
  assert(/actions\/upload-artifact@v7/u.test(ci) && /path:\s*coverage\//u.test(ci), 'quality workflow must retain Jest coverage evidence');
  assert(/docker compose -f docker-compose\.yml config --quiet/u.test(ci), 'quality workflow must validate canonical docker-compose.yml');
  assert(/docker compose up --build --detach/u.test(ci), 'quality workflow must prove container startup');
  assert(/pull_request:/u.test(codeql), 'CodeQL must run for pull requests');
  assert(/javascript-typescript/u.test(codeql), 'CodeQL must analyze the maintained JavaScript surface');
  assert(/workflow_dispatch:/u.test(release), 'GitHub release workflow must remain manual-only');
  assert(/github\.ref == 'refs\/heads\/main'/u.test(release), 'release workflow must require main');
  assert(/Requested tag must equal/u.test(release), 'release workflow must bind the tag to package version');
  assert(/npm sbom --sbom-format=cyclonedx/u.test(release), 'release workflow must generate a dependency SBOM');
  assert(/release-artifacts\.sha256/u.test(release), 'release workflow must checksum attached evidence');
  assert(/release-manifest\.json/u.test(release), 'release workflow must attach an exact provenance manifest');
  assert(/RELEASE_TAG/u.test(release) && /GITHUB_SHA/u.test(release), 'release manifest must bind requested tag and exact commit');
  assert(
    /sha256sum --check release-artifacts\.sha256/u.test(release),
    'release workflow must verify its evidence checksums before publication',
  );
  assert(
    /actions\/upload-artifact@v7/u.test(release),
    'release workflow must retain the verified evidence bundle as a workflow artifact',
  );
  assert(/retention-days: 30/u.test(release), 'release evidence retention must remain explicit');

  assert(
    /node scripts\/create-release-manifest\.mjs/u.test(release),
    'release workflow must use the validated manifest generator',
  );
  assert(
    /node scripts\/create-release-manifest\.mjs/u.test(ci),
    'quality workflow must smoke-test release manifest generation',
  );
  assert(/gh release create/u.test(release), 'release workflow must publish through GitHub Releases');

  process.stdout.write(
    `release readiness verified: v${pkg.version}, ${archiveManifest.corpus_file_count} historical files preserved outside the scored application tree\n`,
  );
}

await main();
