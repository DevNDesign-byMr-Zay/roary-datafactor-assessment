/* Aster JavaScript v490
Authenticated historical derivative: visibility switch for an image-preview canvas using opacity rather than DOM replacement.
*/
function setPreviewCanvasVisible(canvas, visible) {
  if (!canvas) return false;
  canvas.style.opacity = visible ? "1" : "0";
  return !!visible;
}
