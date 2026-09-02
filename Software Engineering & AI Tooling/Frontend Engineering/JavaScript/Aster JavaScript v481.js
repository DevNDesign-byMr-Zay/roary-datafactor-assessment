/* Aster JavaScript v481
Authenticated historical derivative: safely fetch a source as a Blob and degrade to null on network/CORS failure.
*/
async function fetchImageBlob(src) {
  try {
    const response = await fetch(String(src || ""));
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}
