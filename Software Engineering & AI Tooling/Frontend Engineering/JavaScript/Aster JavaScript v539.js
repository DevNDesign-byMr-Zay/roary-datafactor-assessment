/* Aster JavaScript v539
Buyer-safe historical derivative: scale an image Data URL to an exact pixel size on a temporary canvas.
*/
async function scaleImageDataUrlToSize(dataUrl, targetWidth, targetHeight) {
  const width = Number(targetWidth);
  const height = Number(targetHeight);
  if (!(width > 0) || !(height > 0) || !/^data:image\//i.test(String(dataUrl || ""))) return dataUrl;
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = dataUrl;
    });
    if (Math.abs(image.width - width) < 2 && Math.abs(image.height - height) < 2) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: false });
    if (!context) return dataUrl;
    context.imageSmoothingEnabled = true;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } catch {
    return dataUrl;
  }
}
