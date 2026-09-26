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

function assert(condition, message) {
  if (!condition) throw new TypeError(message);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert(manifest.schemaVersion === 2, 'surface schemaVersion must be 2');

for (const [index, value] of manifest.maintainedRoots.entries()) {
  const path = exactPath(value, `maintainedRoots[${index}]`);
  assert((await stat(path)).isDirectory(), `maintainedRoots[${index}] must reference a directory`);
}

for (const [index, value] of manifest.maintainedEntrypoints.entries()) {
  const path = exactPath(value, `maintainedEntrypoints[${index}]`);
  assert((await stat(path)).isFile(), `maintainedEntrypoints[${index}] must reference a file`);
}

const archive = manifest.historicalArchive;
assert(archive?.releaseTag === 'v1.1.2', 'historical archive release tag must remain v1.1.2');
assert(
  archive?.releaseCommit === '67e7a0c297451b438ed950ba743318e3f7454159',
  'historical archive release commit drifted',
);
assert(
  archive?.archiveBranch === 'archive/historical-corpus-v1.1.2',
  'historical archive branch drifted',
);
assert(archive?.fileCount === 1610, 'historical archive file count must remain 1610');
assert(archive?.totalBytes === 1731712, 'historical archive byte count drifted');

const archiveManifestPath = exactPath(archive.manifest, 'historicalArchive.manifest');
const archiveManifest = JSON.parse(await readFile(archiveManifestPath, 'utf8'));
assert(archiveManifest.release_tag === archive.releaseTag, 'archive manifest release tag mismatch');
assert(
  archiveManifest.release_commit === archive.releaseCommit,
  'archive manifest release commit mismatch',
);
assert(archiveManifest.release_tree === archive.releaseTree, 'archive manifest release tree mismatch');
assert(
  archiveManifest.corpus_file_count === archive.fileCount,
  'archive manifest corpus file count mismatch',
);
assert(
  archiveManifest.corpus_total_bytes === archive.totalBytes,
  'archive manifest corpus byte count mismatch',
);
assert(
  archiveManifest.canonical_inventory_sha256 === archive.canonicalInventorySha256,
  'archive manifest inventory digest mismatch',
);
assert(
  Array.isArray(archiveManifest.files) && archiveManifest.files.length === archive.fileCount,
  'archive manifest must list every historical file',
);

const corpusRoot = exactPath(archive.corpusRootAtRelease, 'historicalArchive.corpusRootAtRelease');
assert(
  !(await pathExists(corpusRoot)),
  'historical corpus must remain outside the scored application tree',
);

const archiveByPath = new Map(archiveManifest.files.map((entry) => [entry.path, entry]));
const promoted = new Set();
for (const [index, artifact] of manifest.promotedMaintainedArtifacts.entries()) {
  const path = exactPath(artifact.path, `promotedMaintainedArtifacts[${index}].path`);
  assert((await stat(path)).isFile(), `promotedMaintainedArtifacts[${index}] must reference a file`);
  assert(
    artifact.path.startsWith('src/promoted/'),
    'promoted maintained artifacts must live under src/promoted',
  );
  assert(!promoted.has(artifact.path), 'promoted maintained artifacts must be unique');
  promoted.add(artifact.path);

  const archived = archiveByPath.get(artifact.archivePath);
  assert(archived, `archive path missing from full corpus manifest: ${artifact.archivePath}`);
  assert(archived.git_blob_sha1 === artifact.gitBlobSha1, 'promoted archive blob identity mismatch');
  assert(archived.bytes === artifact.bytes, 'promoted archive byte count mismatch');
}

process.stdout.write(
  `surface boundary verified: ${manifest.maintainedRoots.length} maintained roots, ${promoted.size} promoted maintained artifacts, ${archive.fileCount} archived files externalized\n`,
);
