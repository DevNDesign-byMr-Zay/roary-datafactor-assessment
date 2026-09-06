import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PROMOTED_ARTIFACT_PATHS = Object.freeze([
  'Software Engineering & AI Tooling/Authentication & Security/Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs',
  'Software Engineering & AI Tooling/API Foundations/Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs',
  'Software Engineering & AI Tooling/Storage & File Services/Signed URL File Access/06 FINAL CORRECTED CODE/sign_route.mjs',
]);

export const DEFAULT_INTEGRITY_MANIFEST = path.join(
  ROOT,
  'provenance',
  'PROMOTED_CORPUS_INTEGRITY.json',
);

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function gitBlobSha1(data) {
  const header = Buffer.from(`blob ${data.length}\0`);
  return createHash('sha1').update(header).update(data).digest('hex');
}

function normalizeRequiredPaths(requiredPaths) {
  return [...requiredPaths].sort();
}

export async function readIntegrityManifest(
  manifestPath = DEFAULT_INTEGRITY_MANIFEST,
) {
  const text = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(text);
  if (manifest?.schema_version !== 1 || !Array.isArray(manifest.artifacts)) {
    throw new Error('promoted corpus integrity manifest schema is invalid');
  }
  return manifest;
}

export async function verifyPromotedCorpusIntegrity({
  root = ROOT,
  manifestPath = DEFAULT_INTEGRITY_MANIFEST,
  requiredPaths = PROMOTED_ARTIFACT_PATHS,
} = {}) {
  const manifest = await readIntegrityManifest(manifestPath);
  const paths = manifest.artifacts.map(({ path: artifactPath }) => artifactPath);
  if (new Set(paths).size !== paths.length) {
    throw new Error('promoted corpus integrity manifest contains duplicate paths');
  }

  const expected = normalizeRequiredPaths(requiredPaths);
  const actual = normalizeRequiredPaths(paths);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('promoted corpus integrity manifest does not match required surface');
  }

  const verified = [];
  for (const artifact of manifest.artifacts) {
    const data = await readFile(path.join(root, artifact.path));
    const observed = {
      path: artifact.path,
      bytes: data.length,
      sha256: sha256(data),
      git_blob_sha1: gitBlobSha1(data),
    };

    if (
      observed.bytes !== artifact.bytes ||
      observed.sha256 !== artifact.sha256 ||
      observed.git_blob_sha1 !== artifact.git_blob_sha1
    ) {
      const error = new Error(`promoted corpus integrity drift: ${artifact.path}`);
      error.expected = {
        bytes: artifact.bytes,
        sha256: artifact.sha256,
        git_blob_sha1: artifact.git_blob_sha1,
      };
      error.observed = observed;
      throw error;
    }
    verified.push(observed);
  }

  return {
    ok: true,
    baseMainCommit: manifest.base_main_commit ?? null,
    verified,
  };
}
