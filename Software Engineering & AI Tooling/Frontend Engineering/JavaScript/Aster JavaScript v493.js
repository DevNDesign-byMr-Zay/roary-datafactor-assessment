/* Aster JavaScript v493
Authenticated historical derivative: calculate effective export quality with an optional compression cap.
*/
function effectiveExportQuality(settings = {}) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let quality = clamp(parseInt(settings.quality ?? 95, 10), 40, 100);
  if (settings.compress) quality = Math.min(quality, 85);
  return quality;
}
