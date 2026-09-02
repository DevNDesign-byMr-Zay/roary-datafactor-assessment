/* Aster JavaScript v476
Authenticated historical derivative: decode an image data URL into a Blob for multipart upload.
*/
function dataUrlToBlob(dataUrl) {
  try {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
    const [header, encoded = ""] = dataUrl.split(",", 2);
    const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}
