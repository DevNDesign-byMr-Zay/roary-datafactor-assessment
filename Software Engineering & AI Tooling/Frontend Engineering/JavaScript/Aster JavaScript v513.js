/* Aster JavaScript v513
Authenticated historical derivative: preserve native File-like objects in a stable shared attachment array and migrate compatible entries without wrapping them.
*/
function createRawFileAttachmentStore(target = globalThis, { publicKey = "sessionAttachments", stableKey = "__attachmentFiles" } = {}) {
  const isFileLike = value => !!(value && typeof value === "object" && typeof value.name === "string" && typeof value.size === "number");
  let stable = target[stableKey];
  if (!Array.isArray(stable)) stable = target[stableKey] = [];
  const incoming = target[publicKey];
  if (Array.isArray(incoming) && incoming !== stable) {
    const seen = new Set(stable);
    for (const item of incoming) {
      if (isFileLike(item) && !seen.has(item)) {
        stable.push(item);
        seen.add(item);
      }
    }
  }
  target[publicKey] = stable;
  return { files: stable, isFileLike };
}
