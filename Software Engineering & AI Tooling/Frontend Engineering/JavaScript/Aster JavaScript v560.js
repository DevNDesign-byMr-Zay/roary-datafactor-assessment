/* Aster JavaScript v560
Buyer-safe historical derivative: serialize a painted selection canvas as a strict black/white PNG while rejecting empty masks.
*/
function canvasToBinaryMaskDataUrl(sourceCanvas, { alphaThreshold = 20, colorThreshold = 10 } = {}) {
  if (!(sourceCanvas instanceof HTMLCanvasElement) || !sourceCanvas.width || !sourceCanvas.height) return "";
  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";
  context.drawImage(sourceCanvas, 0, 0);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  let any = false;
  for (let index = 0; index < image.data.length; index += 4) {
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];
    const on = a > alphaThreshold && (r + g + b > colorThreshold || a > 80);
    image.data[index] = image.data[index + 1] = image.data[index + 2] = on ? 255 : 0;
    image.data[index + 3] = 255;
    any ||= on;
  }
  if (!any) return "";
  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
