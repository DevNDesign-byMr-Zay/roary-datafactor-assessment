/* Aster JavaScript v492
Authenticated historical derivative: clamped cubic smoothstep interpolation used by depth-preview blending.
*/
function smoothstep01(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
