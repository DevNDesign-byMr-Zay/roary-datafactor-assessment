/* Aster JavaScript v563
Buyer-safe historical derivative: resolve heterogeneous image sources into an uploadable file when possible, preserving a remote URL only as the final safe fallback.
*/
async function resolveImageUploadInput(source, image, { fetchImpl = fetch, filename = "image.png" } = {}) {
  const src = String(source || "").trim();
  if (!src) return { file: null, url: "" };
  if (/^data:image\//i.test(src)) {
    const blob = dataUrlToBlob(src);
    return { file: blob?.size ? new File([blob], filename, { type: blob.type || "image/png" }) : null, url: "" };
  }
  if (/^(blob:|https?:\/\/)/i.test(src)) {
    try {
      const response = await fetchImpl(src, { method: "GET", cache: "no-store" });
      if (response?.ok) {
        const blob = await response.blob();
        if (blob?.size) return { file: new File([blob], filename, { type: blob.type || "image/png" }), url: "" };
      }
    } catch (_) {}
    if (/^https?:\/\//i.test(src)) return { file: null, url: src };
  }
  const fallbackFile = await imageElementToUploadFile(image, { filename });
  if (fallbackFile) return { file: fallbackFile, url: "" };
  return { file: null, url: /^https?:\/\//i.test(src) ? src : "" };
}
