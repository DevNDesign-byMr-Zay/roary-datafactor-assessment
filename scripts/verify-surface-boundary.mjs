import { access, readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = resolve(root, 'config/repository-surfaces.json');

function exactPath(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} must be a non-empty repository-relative path`);
  }
  if (value.includes('*') || value.includes('?') || value.startsWith('/') || value.includes('..')) {
    throw new TypeError(`${label} must be an exact repository-relative path`);
  }
  const resolved = resolve(root, value);
  if (resolved !== root && !resolved.startsWith(`${root}${sep}`)) {
    throw new TypeError(`${label} escapes the repository root`);
  }
  return resolved;
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 1) throw new TypeError('surface schemaVersion must be 1');

const historicalRoot = exactPath(manifest.historicalCorpusRoot, 'historicalCorpusRoot');
if (!(await stat(historicalRoot)).isDirectory()) {
  throw new TypeError('historicalCorpusRoot must reference a directory');
}

for (const [index, value] of manifest.maintainedRoots.entries()) {
  const path = exactPath(value, `maintainedRoots[${index}]`);
  if (!(await stat(path)).isDirectory()) {
    throw new TypeError(`maintainedRoots[${index}] must reference a directory`);
  }
  if (path === historicalRoot || path.startsWith(`${historicalRoot}${sep}`)) {
    throw new TypeError('historical corpus cannot be classified as a maintained root');
  }
}

for (const [index, value] of manifest.maintainedEntrypoints.entries()) {
  const path = exactPath(value, `maintainedEntrypoints[${index}]`);
  if (!(await stat(path)).isFile()) {
    throw new TypeError(`maintainedEntrypoints[${index}] must reference a file`);
  }
}

const promoted = new Set();
for (const [index, value] of manifest.promotedHistoricalArtifacts.entries()) {
  const path = exactPath(value, `promotedHistoricalArtifacts[${index}]`);
  if (!path.startsWith(`${historicalRoot}${sep}`)) {
    throw new TypeError('promoted historical artifacts must remain under historicalCorpusRoot');
  }
  if (promoted.has(path)) throw new TypeError('promoted historical artifacts must be unique');
  promoted.add(path);
  await access(path);
}

process.stdout.write(
  `surface boundary verified: ${manifest.maintainedRoots.length} maintained roots, ${promoted.size} promoted historical artifacts\n`,
);
