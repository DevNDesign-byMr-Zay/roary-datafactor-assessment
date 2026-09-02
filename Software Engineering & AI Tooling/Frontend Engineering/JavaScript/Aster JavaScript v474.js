/* Aster JavaScript v474
Authenticated historical derivative: stable live-preview signature from depth controls.
Product-scoped globals removed.
*/
function makeDepthPreviewSignature({ strength = 0.30, bokeh = 35, guidance = 3.5, steps = 22 } = {}) {
  const s = Number(strength);
  const b = Number(bokeh);
  const g = Number(guidance);
  const st = Number(steps);
  return `${s.toFixed(2)}|${Math.round(b)}|${g.toFixed(1)}|${Math.round(st)}`;
}
