export function normalizeMediaSource(source, baseUrl = globalThis.location?.href) {
  if (source == null) return '';
  const value = String(source).trim();
  if (!value || value === 'undefined' || value === 'null') return '';
  if (/^(?:data:|blob:|https?:)/i.test(value)) return value;

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}
