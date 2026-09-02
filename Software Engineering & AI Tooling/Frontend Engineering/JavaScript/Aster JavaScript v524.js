/* Aster JavaScript v524
Buyer-safe historical derivative: recover a stable original source for a DOM image currently rendered from a Blob URL.
*/
function findStableSourceForBlobImage(blobUrl, root = document) {
  try {
    for (const image of Array.from(root.images || [])) {
      const rendered = image.currentSrc || image.src || "";
      if (rendered !== blobUrl) continue;
      const data = image.dataset || {};
      const candidates = [data.origSrc, data.originalSrc, data.source, image.getAttribute("data-orig-src")];
      const stable = candidates.find(value => value && !/^blob:/i.test(value));
      if (stable) return stable;
    }
  } catch {}
  return "";
}
