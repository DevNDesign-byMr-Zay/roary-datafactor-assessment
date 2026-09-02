export function isLocalOnlyImageSource(source) {
  return /^(?:blob:|data:)/i.test(String(source || ''));
}

export async function convertImageWithFallback(source, settings, {
  serverConvert,
  localConvert,
  preferServer = true,
} = {}) {
  if (!source) throw new Error('source is required.');
  if (typeof localConvert !== 'function') throw new TypeError('localConvert must be a function.');

  const localOnly = isLocalOnlyImageSource(source);
  if (preferServer && !localOnly && typeof serverConvert === 'function') {
    try {
      return await serverConvert(source, settings);
    } catch (_) {
      // Fall through to local conversion so export remains available.
    }
  }
  return localConvert(source, settings);
}

export async function withObjectUrl(blob, useUrl, {
  createObjectURL = (value) => URL.createObjectURL(value),
  revokeObjectURL = (url) => URL.revokeObjectURL(url),
} = {}) {
  if (!blob) throw new Error('blob is required.');
  if (typeof useUrl !== 'function') throw new TypeError('useUrl must be a function.');
  const url = createObjectURL(blob);
  try {
    return await useUrl(url);
  } finally {
    revokeObjectURL(url);
  }
}
