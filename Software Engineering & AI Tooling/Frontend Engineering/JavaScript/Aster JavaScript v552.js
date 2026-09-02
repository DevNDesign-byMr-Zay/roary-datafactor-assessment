/* Aster JavaScript v552
Buyer-safe historical derivative: map pointer coordinates from a displayed image surface into the natural-resolution mask coordinate system.
*/
function displayPointToMaskPoint(point, displayRect, maskWidth, maskHeight) {
  if (!point || !displayRect || !(displayRect.width > 0) || !(displayRect.height > 0) || !(maskWidth > 0) || !(maskHeight > 0)) return null;
  const x = Number(point.x) - Number(displayRect.left || 0);
  const y = Number(point.y) - Number(displayRect.top || 0);
  const scaleX = maskWidth / displayRect.width;
  const scaleY = maskHeight / displayRect.height;
  return {
    x: Math.max(0, Math.min(maskWidth, x * scaleX)),
    y: Math.max(0, Math.min(maskHeight, y * scaleY)),
    scaleX,
    scaleY,
  };
}
