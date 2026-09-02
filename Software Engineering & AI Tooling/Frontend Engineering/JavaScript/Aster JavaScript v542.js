/* Aster JavaScript v542
Buyer-safe historical derivative: acquire a Blob from the active image source across data:, blob:, and HTTP(S) URLs through one fetch path.
*/
async function imageSourceToBlob(source, { fetchImpl = fetch } = {}) {
  const value = String(source || "").trim();
  if (!value || typeof fetchImpl !== "function") return null;
  try {
    const response = await fetchImpl(value);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}
