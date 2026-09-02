/**
 * Materialize an image source into uploadable binary data.
 * Prefers a direct blob read and falls back to a pixel/data-URL export.
 */
export async function materializeImageBinary({
  source = '',
  readBlob,
  exportPixels,
  fileName = 'image.png',
} = {}) {
  let blob = null;

  if (typeof readBlob === 'function' && source) {
    try {
      const candidate = await readBlob(String(source));
      if (candidate && typeof candidate.size === 'number' && candidate.size > 0) {
        blob = candidate;
      }
    } catch {
      blob = null;
    }
  }

  if (!blob && typeof exportPixels === 'function') {
    const dataUrl = await exportPixels(source);
    if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(String(dataUrl || ''))) {
      throw new Error('Image bytes could not be materialized.');
    }

    const [header, encoded = ''] = String(dataUrl).split(',', 2);
    const mimeType = (header.match(/^data:([^;]+)/i) || [])[1] || 'image/png';
    const binary = globalThis.atob
      ? globalThis.atob(encoded)
      : Buffer.from(encoded, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    blob = new Blob([bytes], { type: mimeType });
  }

  if (!blob || typeof blob.size !== 'number' || blob.size < 1) {
    throw new Error('Image bytes could not be materialized.');
  }

  return {
    blob,
    fileName: String(fileName || 'image.png'),
    mimeType: blob.type || 'image/png',
  };
}

export function appendImageBinary(formData, image, fieldName = 'image') {
  if (!formData || typeof formData.append !== 'function') {
    throw new TypeError('formData must support append().');
  }
  if (!image?.blob) throw new TypeError('image.blob is required.');
  formData.append(String(fieldName || 'image'), image.blob, image.fileName || 'image.png');
  return formData;
}
