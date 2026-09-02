function smoothstep(a, b, x) {
  if (b <= a) return x >= b ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function buildDepthBlurMask(depth, depthWidth, depthHeight, outWidth, outHeight, {
  invert = false,
  focus = 0.35,
  transition = 0.18,
} = {}) {
  if (!depth || depth.length < depthWidth * depthHeight) throw new RangeError('Invalid depth buffer.');
  if (![depthWidth, depthHeight, outWidth, outHeight].every(Number.isInteger)) {
    throw new TypeError('Dimensions must be integers.');
  }
  if (Math.min(depthWidth, depthHeight, outWidth, outHeight) < 1) throw new RangeError('Dimensions must be positive.');

  const alpha = new Uint8ClampedArray(outWidth * outHeight);
  for (let y = 0; y < outHeight; y += 1) {
    const sy = Math.min(depthHeight - 1, Math.floor((y / Math.max(1, outHeight - 1)) * (depthHeight - 1)));
    for (let x = 0; x < outWidth; x += 1) {
      const sx = Math.min(depthWidth - 1, Math.floor((x / Math.max(1, outWidth - 1)) * (depthWidth - 1)));
      const raw = Math.max(0, Math.min(1, Number(depth[sy * depthWidth + sx]) || 0));
      const far = invert ? 1 - raw : raw;
      alpha[y * outWidth + x] = Math.round(smoothstep(focus, focus + transition, far) * 255);
    }
  }
  return alpha;
}

export function derivePreviewBlur({ strength = 0.3, bokeh = 35 } = {}) {
  const normalizedStrength = Math.max(0, Math.min(1, (Number(strength) - 0.05) / 0.70));
  const blurPx = (Math.max(0, Math.min(100, Number(bokeh))) / 100) * (3 + 14 * normalizedStrength);
  const transition = 0.10 + (1 - normalizedStrength) * 0.22;
  const overlayAlpha = 0.75 + 0.25 * normalizedStrength;
  return { normalizedStrength, blurPx, transition, overlayAlpha };
}
