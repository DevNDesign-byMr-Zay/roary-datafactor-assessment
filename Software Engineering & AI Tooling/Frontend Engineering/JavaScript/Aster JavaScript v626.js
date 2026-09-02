/**
 * Persist one uploaded object with MIME metadata using caller-supplied storage.
 * Storage provider, object naming policy, and byte representation are injected.
 */

function normalizeMimeType(value) {
  const text = String(value || '').trim().toLowerCase();
  return text && text.includes('/') ? text : 'application/octet-stream';
}

export async function persistUploadedObject(
  upload,
  { makeObjectName, saveObject } = {},
) {
  if (!upload || typeof upload !== 'object') {
    throw new TypeError('upload must be an object');
  }
  if (upload.bytes == null) {
    throw new TypeError('upload.bytes is required');
  }
  if (typeof makeObjectName !== 'function') {
    throw new TypeError('makeObjectName must be a function');
  }
  if (typeof saveObject !== 'function') {
    throw new TypeError('saveObject must be a function');
  }

  const originalName = String(upload.originalName || 'file').trim() || 'file';
  const mimeType = normalizeMimeType(upload.mimeType ?? upload.type);
  const objectName = String(await makeObjectName({ originalName, mimeType, upload })).trim();
  if (!objectName) throw new Error('makeObjectName returned an empty object name');

  await saveObject(objectName, upload.bytes, {
    contentType: mimeType,
    originalName,
  });

  return { objectName, originalName, mimeType };
}
