/* Aster JavaScript v498
Authenticated historical derivative: load and normalize saved image-export settings with strict defaults.
*/
function loadExportSettings(storage, key = "aster.exportSettings", defaults = {}) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let settings = { format: "png", scale: 100, quality: 95, transparent: false, compress: false, ...defaults };
  try {
    const raw = storage?.getItem?.(key);
    if (raw) settings = { ...settings, ...(JSON.parse(raw) || {}) };
  } catch {}
  const format = String(settings.format || "png").toLowerCase();
  settings.format = ["png", "jpg", "webp"].includes(format) ? format : "png";
  let scale = parseInt(settings.scale || 100, 10);
  if ([1, 2, 3, 4].includes(scale)) scale *= 100;
  settings.scale = [100, 200, 300, 400].includes(scale) ? scale : 100;
  settings.quality = clamp(parseInt(settings.quality || 95, 10), 40, 100);
  settings.transparent = !!settings.transparent;
  settings.compress = !!settings.compress;
  return settings;
}
