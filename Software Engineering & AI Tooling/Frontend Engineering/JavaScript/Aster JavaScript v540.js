/* Aster JavaScript v540
Buyer-safe historical derivative: translate a screen-space expansion frame into natural-image pixel padding without arbitrary UI clamps.
*/
function computeNaturalPixelPadding({ imageRect, frameRect, naturalWidth, naturalHeight } = {}) {
  if (!imageRect || !frameRect || !(naturalWidth > 0) || !(naturalHeight > 0) || !(imageRect.width > 0) || !(imageRect.height > 0)) return null;
  const scaleX = naturalWidth / imageRect.width;
  const scaleY = naturalHeight / imageRect.height;
  return {
    left: Math.max(0, Math.round((imageRect.left - frameRect.left) * scaleX)),
    right: Math.max(0, Math.round((frameRect.right - imageRect.right) * scaleX)),
    top: Math.max(0, Math.round((imageRect.top - frameRect.top) * scaleY)),
    bottom: Math.max(0, Math.round((frameRect.bottom - imageRect.bottom) * scaleY))
  };
}
