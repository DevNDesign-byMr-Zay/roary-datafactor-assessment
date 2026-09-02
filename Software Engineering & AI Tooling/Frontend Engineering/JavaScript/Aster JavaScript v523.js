/* Aster JavaScript v523
Buyer-safe historical derivative: convert a transient Blob URL into a stable Data URL before persistence.
*/
async function blobUrlToDataUrl(blobUrl, { fetchImpl = fetch } = {}) {
  if (!/^blob:/i.test(String(blobUrl || ""))) return null;
  try {
    const response = await fetchImpl(blobUrl);
    if (!response.ok && typeof response.ok === "boolean") return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}
