/* Aster JavaScript v477
Authenticated historical derivative: obtain image bytes by fetch first, then fall back to exporting already-loaded pixels.
*/
async function bestEffortImageBlob(src, exportDataUrl) {
  try {
    const response = await fetch(String(src || ""));
    if (response.ok) return await response.blob();
  } catch {}
  try {
    const dataUrl = await exportDataUrl?.();
    if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
      const [header, encoded = ""] = dataUrl.split(",", 2);
      const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
  } catch {}
  return null;
}
