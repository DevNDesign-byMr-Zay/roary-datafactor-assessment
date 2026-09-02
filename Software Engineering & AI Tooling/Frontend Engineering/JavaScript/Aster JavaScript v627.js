/**
 * Convert stored-file references into short-lived signed-read message parts.
 * Individual signing failures can be skipped without discarding successful files.
 */

function normalizeMimeType(value) {
  const text = String(value || '').trim().toLowerCase();
  return text && text.includes('/') ? text : 'application/octet-stream';
}

function locatorOf(ref) {
  if (!ref || typeof ref !== 'object') return '';
  return String(ref.locator ?? ref.objectName ?? ref.key ?? '').trim();
}

export async function materializeSignedFileParts(
  references,
  { signReadUrl, ttlMs = 45 * 60 * 1000, now = Date.now, onError } = {},
) {
  if (!Array.isArray(references)) throw new TypeError('references must be an array');
  if (typeof signReadUrl !== 'function') throw new TypeError('signReadUrl must be a function');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new RangeError('ttlMs must be positive');

  const expiresAt = Number(now()) + ttlMs;
  const parts = [];

  for (let index = 0; index < references.length; index += 1) {
    const ref = references[index];
    const locator = locatorOf(ref);
    if (!locator) continue;
    try {
      const fileUri = String(await signReadUrl(locator, { expiresAt, ref, index })).trim();
      if (!fileUri) throw new Error('signReadUrl returned an empty URL');
      parts.push({
        fileData: {
          fileUri,
          mimeType: normalizeMimeType(ref.mimeType ?? ref.type),
        },
      });
    } catch (error) {
      if (typeof onError === 'function') onError(error, { ref, index, locator });
    }
  }

  return parts;
}
