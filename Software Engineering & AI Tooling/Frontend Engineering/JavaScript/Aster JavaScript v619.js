export const IMAGE_EXPORT_SCALE_PRESETS = Object.freeze([100, 200, 300, 400]);

export function normalizeImageExportScale(scale, {
  presets = IMAGE_EXPORT_SCALE_PRESETS,
  fallback = 100,
} = {}) {
  let value = parseInt(scale, 10);
  if (value >= 1 && value <= 4) value *= 100;
  return presets.includes(value) ? value : fallback;
}

export function scaledImageDimensions(width, height, scale = 100) {
  const sourceWidth = Math.max(1, Math.round(Number(width) || 1));
  const sourceHeight = Math.max(1, Math.round(Number(height) || 1));
  const normalizedScale = normalizeImageExportScale(scale);
  const factor = normalizedScale / 100;
  return {
    width: Math.max(1, Math.round(sourceWidth * factor)),
    height: Math.max(1, Math.round(sourceHeight * factor)),
    scale: normalizedScale,
  };
}

export function describeImageExportScale(width, height, scale = 100) {
  const dimensions = scaledImageDimensions(width, height, scale);
  return `${dimensions.scale / 100}x · ${dimensions.width}×${dimensions.height}`;
}
