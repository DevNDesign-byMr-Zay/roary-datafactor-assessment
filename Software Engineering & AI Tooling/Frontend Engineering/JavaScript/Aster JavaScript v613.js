export function buildRadialFallbackDepth(renderWidth, renderHeight, {
  scale = 0.35,
  minDimension = 64,
  maxWidth = 360,
} = {}) {
  const rw = Math.max(1, Number(renderWidth) || 1);
  const rh = Math.max(1, Number(renderHeight) || 1);
  const width = Math.max(minDimension, Math.min(maxWidth, Math.round(rw * scale)));
  const height = Math.max(minDimension, Math.round(width * (rh / rw)));
  const depth = new Float32Array(width * height);
  const cx = (width - 1) * 0.5;
  const cy = (height - 1) * 0.5;
  const maxDistance = Math.hypot(cx, cy) || 1;

  let i = 0;
  for (let y = 0; y < height; y += 1) {
    const dy = y - cy;
    for (let x = 0; x < width; x += 1) {
      const dx = x - cx;
      depth[i++] = Math.min(1, Math.hypot(dx, dy) / maxDistance);
    }
  }
  return { depth, width, height, invert: false, focus: 0.22 };
}
