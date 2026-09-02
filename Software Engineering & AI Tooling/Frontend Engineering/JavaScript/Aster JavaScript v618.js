export const DEFAULT_IMAGE_EXPORT_SETTINGS = Object.freeze({
  format: 'png',
  scale: 100,
  quality: 95,
  transparent: true,
  compress: false,
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function normalizeImageExportSettings(input = {}) {
  const source = { ...DEFAULT_IMAGE_EXPORT_SETTINGS, ...input };
  let format = String(source.format || 'png').toLowerCase();
  if (format === 'jpeg') format = 'jpg';
  if (!['png', 'jpg', 'webp'].includes(format)) format = 'png';
  return {
    format,
    scale: clamp(parseInt(source.scale, 10) || 100, 10, 400),
    quality: clamp(parseInt(source.quality, 10) || 95, 40, 100),
    transparent: Boolean(source.transparent),
    compress: Boolean(source.compress),
  };
}

export function effectiveImageExportQuality(settings = {}) {
  const value = normalizeImageExportSettings(settings);
  if (value.format === 'png') return undefined;
  return value.compress ? Math.min(value.quality, 85) : value.quality;
}

export function createImageExportSettingsStore(storage, {
  settingsKey = 'image-export-settings',
  enabledKey = 'image-export-settings-enabled',
} = {}) {
  return {
    load() {
      try {
        const raw = JSON.parse(storage?.getItem(settingsKey) || 'null');
        return normalizeImageExportSettings(raw || {});
      } catch (_) {
        return normalizeImageExportSettings();
      }
    },
    isEnabled() {
      try { return storage?.getItem(enabledKey) === '1'; } catch (_) { return false; }
    },
    save(settings, enabled = true) {
      const value = normalizeImageExportSettings(settings);
      if (storage) {
        storage.setItem(settingsKey, JSON.stringify(value));
        storage.setItem(enabledKey, enabled ? '1' : '0');
      }
      return value;
    },
  };
}
