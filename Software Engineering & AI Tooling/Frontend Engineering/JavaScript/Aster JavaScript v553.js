/* Aster JavaScript v553
Buyer-safe historical derivative: interpolate brush stamps between pointer samples so fast removal strokes do not leave gaps.
*/
function interpolateBrushStamps(from, to, brushSize, stamp) {
  if (!from || !to || typeof stamp !== "function") return 0;
  const dx = Number(to.x) - Number(from.x);
  const dy = Number(to.y) - Number(from.y);
  const distance = Math.hypot(dx, dy);
  const spacing = Math.max(1, Number(brushSize) * 0.25 || 1);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    stamp(Number(from.x) + dx * t, Number(from.y) + dy * t);
  }
  return steps + 1;
}
