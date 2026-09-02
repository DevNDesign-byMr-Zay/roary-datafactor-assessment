/* Aster JavaScript v528
Buyer-safe historical derivative: classify strings that plausibly contain or reference image media.
*/
function isLikelyImageSource(value) {
  if (!value) return false;
  const source = String(value);
  if (/data:image/i.test(source) || /^blob:/i.test(source)) return true;
  if (/^https?:/i.test(source) && (/(\.(?:png|jpe?g|webp|gif))(?:\?|#|$)/i.test(source) || /\/(?:media|images?|img|output)\b/i.test(source))) return true;
  if (/^(?:png|jpe?g|webp|gif)[.;:]base64,/i.test(source)) return true;
  if (/!\[[^\]]*\]\([^)]+\)/.test(source)) return true;
  if (/<img[^>]+src\s*=/i.test(source)) return true;
  return false;
}
