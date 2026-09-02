/* Aster JavaScript v551
Buyer-safe historical derivative: keep an offscreen removal mask at natural image resolution and reset it only when natural dimensions actually change.
*/
function ensureNaturalMaskCanvas(maskCanvas, image, { background = "black" } = {}) {
  if (!(maskCanvas instanceof HTMLCanvasElement) || !(image instanceof HTMLImageElement)) return false;
  const width = Math.max(1, Math.round(image.naturalWidth || image.width || 1));
  const height = Math.max(1, Math.round(image.naturalHeight || image.height || 1));
  if (maskCanvas.width === width && maskCanvas.height === height) return false;
  maskCanvas.width = width;
  maskCanvas.height = height;
  const context = maskCanvas.getContext("2d");
  if (context) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
  return true;
}
