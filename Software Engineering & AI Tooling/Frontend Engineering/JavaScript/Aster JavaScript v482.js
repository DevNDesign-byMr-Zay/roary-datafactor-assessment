/* Aster JavaScript v482
Authenticated historical derivative: canonical local image-tool base selection locked to port 5151.
Legacy alternate ports and product-scoped storage keys removed.
*/
const DEFAULT_IMAGE_TOOL_BASE = "http://127.0.0.1:5151";
function normalizeImageToolBase(value) {
  try {
    const url = new URL(String(value || DEFAULT_IMAGE_TOOL_BASE));
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return "";
    if (url.port !== "5151") return "";
    return `${url.protocol}//${url.host}`.replace(/\/+$/, "");
  } catch {
    return "";
  }
}
function getImageApiBases(lastGood = "") {
  return Array.from(new Set([DEFAULT_IMAGE_TOOL_BASE, normalizeImageToolBase(lastGood)].filter(Boolean)));
}
