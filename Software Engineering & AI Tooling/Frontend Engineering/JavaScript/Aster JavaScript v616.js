export function normalizeImageExportFormat(format, fallback = 'png') {
  const value = String(format || '').toLowerCase();
  if (value === 'jpeg') return 'jpg';
  return ['png', 'jpg', 'webp'].includes(value) ? value : fallback;
}

export function exportMimeType(format) {
  const normalized = normalizeImageExportFormat(format);
  if (normalized === 'jpg') return 'image/jpeg';
  if (normalized === 'webp') return 'image/webp';
  return 'image/png';
}

export function exportQuality(format, quality = 95) {
  const normalized = normalizeImageExportFormat(format);
  if (normalized === 'png') return undefined;
  const value = Math.max(0, Math.min(100, Number(quality) || 95));
  return value / 100;
}

export async function encodeCanvasForExport(canvas, {
  format = 'png',
  quality = 95,
  fallbackBlob = null,
} = {}) {
  if (!canvas || typeof canvas.toBlob !== 'function') {
    throw new TypeError('A canvas with toBlob() is required.');
  }
  const mime = exportMimeType(format);
  const q = exportQuality(format, quality);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, q));
  if (blob) return blob;
  if (fallbackBlob) return fallbackBlob;
  throw new Error('Canvas export produced no blob.');
}
