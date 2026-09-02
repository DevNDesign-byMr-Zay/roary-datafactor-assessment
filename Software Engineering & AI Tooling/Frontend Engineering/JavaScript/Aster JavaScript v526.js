/* Aster JavaScript v526
Buyer-safe historical derivative: collect visible generated media, de-duplicate sources, and ignore tiny interface icons before ingestion.
*/
async function ingestVisibleGeneratedMedia({ root = document, selectors, persist, threadId = null, minimumDimension = 96 } = {}) {
  if (typeof persist !== "function") return 0;
  const query = (Array.isArray(selectors) ? selectors : []).filter(Boolean).join(",");
  if (!query) return 0;
  const seen = new Set();
  let count = 0;
  for (const image of Array.from(root.querySelectorAll(query))) {
    const source = image.currentSrc || image.src || "";
    if (!source || seen.has(source)) continue;
    seen.add(source);
    const width = image.naturalWidth || image.width || 0;
    const height = image.naturalHeight || image.height || 0;
    if (width && height && (width < minimumDimension || height < minimumDimension)) continue;
    await persist(source, { kind: "variation", ...(threadId ? { threadId } : {}) });
    count += 1;
  }
  return count;
}
