import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, test } from '@jest/globals';

import {
  PROMOTED_ARTIFACT_PATHS,
  verifyPromotedCorpusIntegrity,
} from '../src/corpus-integrity.mjs';

function gitBlobSha1(data) {
  return createHash('sha1')
    .update(Buffer.from(`blob ${data.length}\0`))
    .update(data)
    .digest('hex');
}

function recordFor(filePath, data) {
  return {
    path: filePath,
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
    git_blob_sha1: gitBlobSha1(data),
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'roary-integrity-'));
  const artifactPath = 'fixture/promoted.mjs';
  const absolute = path.join(root, artifactPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  const data = Buffer.from("export const promoted = true;\n");
  await writeFile(absolute, data);
  const manifestPath = path.join(root, 'manifest.json');
  await writeFile(
    manifestPath,
    JSON.stringify({
      schema_version: 1,
      base_main_commit: 'fixture-base',
      artifacts: [recordFor(artifactPath, data)],
    }),
  );
  return { root, manifestPath, artifactPath, absolute };
}

describe('promoted corpus integrity', () => {
  test('verifies the repository promoted assessment surface', async () => {
    const result = await verifyPromotedCorpusIntegrity();
    expect(result.ok).toBe(true);
    expect(result.verified.map(({ path: filePath }) => filePath).sort()).toEqual(
      [...PROMOTED_ARTIFACT_PATHS].sort(),
    );
    expect(result.verified).toHaveLength(3);
  });

  test('detects content drift with expected and observed evidence', async () => {
    const { root, manifestPath, artifactPath, absolute } = await fixture();
    await writeFile(absolute, "export const promoted = false;\n");

    await expect(
      verifyPromotedCorpusIntegrity({
        root,
        manifestPath,
        requiredPaths: [artifactPath],
      }),
    ).rejects.toMatchObject({
      message: `promoted corpus integrity drift: ${artifactPath}`,
      expected: expect.objectContaining({ sha256: expect.any(String) }),
      observed: expect.objectContaining({ sha256: expect.any(String) }),
    });
  });

  test('rejects duplicate manifest paths before reading artifacts', async () => {
    const { root, manifestPath, artifactPath } = await fixture();
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.artifacts.push({ ...manifest.artifacts[0] });
    await writeFile(manifestPath, JSON.stringify(manifest));

    await expect(
      verifyPromotedCorpusIntegrity({
        root,
        manifestPath,
        requiredPaths: [artifactPath],
      }),
    ).rejects.toThrow('promoted corpus integrity manifest contains duplicate paths');
  });

  test('rejects manifest surface changes that silently drop promoted artifacts', async () => {
    const { root, manifestPath, artifactPath } = await fixture();

    await expect(
      verifyPromotedCorpusIntegrity({
        root,
        manifestPath,
        requiredPaths: [artifactPath, 'fixture/missing.mjs'],
      }),
    ).rejects.toThrow(
      'promoted corpus integrity manifest does not match required surface',
    );
  });

  test('rejects malformed integrity manifests', async () => {
    const { root, manifestPath, artifactPath } = await fixture();
    await writeFile(manifestPath, JSON.stringify({ schema_version: 2 }));

    await expect(
      verifyPromotedCorpusIntegrity({
        root,
        manifestPath,
        requiredPaths: [artifactPath],
      }),
    ).rejects.toThrow('promoted corpus integrity manifest schema is invalid');
  });
});
