/* Aster JavaScript v514
Authenticated historical derivative: keep attachment preview metadata in a separate signature-keyed cache so native File objects remain untouched.
*/
function createAttachmentMetadataCache(target = globalThis, key = "__attachmentMetadata") {
  const cache = target[key] && typeof target[key] === "object" ? target[key] : (target[key] = Object.create(null));
  const signature = file => [file?.name || "", Number(file?.size) || 0, Number(file?.lastModified) || 0, file?.type || ""].join("::");
  return {
    signature,
    get(file) { return cache[signature(file)] || null; },
    set(file, metadata) { cache[signature(file)] = { ...(metadata || {}) }; return cache[signature(file)]; },
    delete(file) { delete cache[signature(file)]; }
  };
}
