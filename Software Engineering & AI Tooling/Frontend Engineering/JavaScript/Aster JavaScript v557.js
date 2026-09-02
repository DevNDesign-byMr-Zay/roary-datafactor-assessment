/* Aster JavaScript v557
Buyer-safe historical derivative: derive requested output dimensions from natural image size plus expansion padding with an optional side cap.
*/
function deriveExpansionTarget({ naturalWidth, naturalHeight, padding, maxSide = Infinity } = {}) {
  const baseWidth = Math.max(1, Math.round(Number(naturalWidth) || 0));
  const baseHeight = Math.max(1, Math.round(Number(naturalHeight) || 0));
  const p = padding || {};
  const left = Math.max(0, Math.round(Number(p.left) || 0));
  const right = Math.max(0, Math.round(Number(p.right) || 0));
  const top = Math.max(0, Math.round(Number(p.top) || 0));
  const bottom = Math.max(0, Math.round(Number(p.bottom) || 0));
  const cap = Number.isFinite(maxSide) && maxSide > 0 ? maxSide : Infinity;
  return {
    baseWidth, baseHeight, left, right, top, bottom,
    targetWidth: Math.min(cap, baseWidth + left + right),
    targetHeight: Math.min(cap, baseHeight + top + bottom)
  };
}
