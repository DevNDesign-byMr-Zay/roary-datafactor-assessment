/* Aster JavaScript v529
Buyer-safe historical derivative: recursively extract image references from strings, arrays, and nested message/thread objects.
*/
function extractImageSourcesDeep(node, { isImageSource, output = [], seenObjects = new WeakSet() } = {}) {
  if (node == null) return output;
  if (typeof node === "string") {
    const text = node.trim();
    if (!text) return output;
    for (const match of text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) output.push(match[1]);
    for (const match of text.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["']/gi)) output.push(match[1]);
    if (isImageSource?.(text)) output.push(text);
    return output;
  }
  if (typeof node !== "object") return output;
  if (seenObjects.has(node)) return output;
  seenObjects.add(node);
  if (Array.isArray(node)) {
    for (const value of node) extractImageSourcesDeep(value, { isImageSource, output, seenObjects });
  } else {
    for (const value of Object.values(node)) extractImageSourcesDeep(value, { isImageSource, output, seenObjects });
  }
  return output;
}
