/* Aster JavaScript v485
Authenticated historical derivative: generate a lightweight radial fallback depth field for realtime preview when no depth map is available.
*/
function buildRadialFallbackDepth(width, height, scale = 0.35) {
  const rw = Math.max(1, Number(width) || 512);
  const rh = Math.max(1, Number(height) || 512);
  const dw = Math.max(64, Math.min(360, Math.round(rw * scale)));
  const dh = Math.max(64, Math.round(dw * (rh / rw)));
  const depth = new Float32Array(dw * dh);
  const cx = (dw - 1) * 0.5, cy = (dh - 1) * 0.5;
  const maxDistance = Math.hypot(cx, cy) || 1;
  let index = 0;
  for (let y = 0; y < dh; y += 1) {
    for (let x = 0; x < dw; x += 1) {
      depth[index++] = Math.min(1, Math.hypot(x - cx, y - cy) / maxDistance);
    }
  }
  return { depth, width: dw, height: dh, defaultFocus: 0.22, invert: false };
}
