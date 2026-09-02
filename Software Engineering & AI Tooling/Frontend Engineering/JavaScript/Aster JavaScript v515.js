/* Aster JavaScript v515
Authenticated historical derivative: scope delegated file-input handling to approved controls or approved UI roots instead of every file input on the page.
*/
function isRelevantFileInput(input, { ids = [], roots = [] } = {}) {
  if (!input || input.tagName !== "INPUT" || String(input.type || "").toLowerCase() !== "file") return false;
  const allowedIds = new Set(ids.filter(Boolean));
  if (input.id && allowedIds.has(input.id)) return true;
  for (const root of roots) {
    const node = typeof root === "string" ? input.closest?.(root) : root;
    if (!node) continue;
    if (typeof root === "string" || node.contains?.(input)) return true;
  }
  return false;
}
