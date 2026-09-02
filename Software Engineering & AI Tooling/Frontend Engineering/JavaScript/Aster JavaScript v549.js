/* Aster JavaScript v549
Buyer-safe historical derivative: build a removal request that prefers binary image input, uses a remote URL only as a safe fallback, and sends a painted mask as a file.
*/
async function buildRemovalFormData({ imageSource = "", imageBlob = null, maskDataUrl = "", prompt = "", steps = null } = {}) {
  const form = new FormData();
  const source = String(imageSource || "").trim();
  if (imageBlob instanceof Blob && imageBlob.size) {
    form.append("image", new File([imageBlob], "image.png", { type: imageBlob.type || "image/png" }));
  } else if (/^https?:\/\//i.test(source)) {
    form.append("image_url", source);
  } else {
    throw new Error("No usable image input");
  }
  form.append("prompt", String(prompt || "").trim());
  if (Number.isFinite(Number(steps))) form.append("num_inference_steps", String(Math.max(1, Math.round(Number(steps)))));
  if (maskDataUrl) {
    const maskBlob = dataUrlToBlob(maskDataUrl);
    if (!(maskBlob instanceof Blob) || !maskBlob.size) throw new Error("Mask could not be decoded");
    form.append("mask", new File([maskBlob], "mask.png", { type: maskBlob.type || "image/png" }));
  }
  return form;
}
