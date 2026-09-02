/* Aster JavaScript v538
Buyer-safe historical derivative: decode a base64 Data URL into a typed Blob without retaining product-specific globals.
*/
function dataUrlToBlob(dataUrl) {
  try {
    const [meta, payload] = String(dataUrl || "").split(",", 2);
    if (!meta || !payload) return null;
    const mime = (/^data:([^;]+)/i.exec(meta) || [])[1] || "application/octet-stream";
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}
