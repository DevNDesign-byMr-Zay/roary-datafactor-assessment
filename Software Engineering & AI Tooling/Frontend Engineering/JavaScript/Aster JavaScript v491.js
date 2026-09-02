/* Aster JavaScript v491
Authenticated historical derivative: bounded signature for image-source cache invalidation without embedding full data URLs.
*/
function imageSourceSignature(src) {
  const value = String(src || "");
  if (!value) return "";
  if (value.startsWith("data:")) return `data:${value.slice(0, 64)}…len=${value.length}`;
  return value;
}
