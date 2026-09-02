/* Aster JavaScript v562
Buyer-safe historical derivative: convert a loaded image element into an uploadable file when direct source retrieval is unavailable or origin-restricted.
*/
async function imageElementToUploadFile(image, { filename = "image.png", type = "image/png" } = {}) {
  if (!(image instanceof HTMLImageElement) || !image.naturalWidth || !image.naturalHeight) return null;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  try { context.drawImage(image, 0, 0); } catch (_) { return null; }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, type));
  return blob?.size ? new File([blob], filename, { type: blob.type || type }) : null;
}
