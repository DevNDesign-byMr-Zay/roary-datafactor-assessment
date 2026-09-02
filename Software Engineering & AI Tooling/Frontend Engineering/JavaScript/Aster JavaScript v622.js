/**
 * Provider-neutral named-preset controller for a bounded numeric parameter.
 * Maps simple named modes onto an existing numeric control while preserving
 * the control as the source of truth for downstream bindings.
 */
export function normalizeNumericPresets(presets = []) {
  const out = [];
  const seen = new Set();
  for (const item of presets) {
    const id = String(item?.id ?? '').trim();
    const label = String(item?.label ?? id).trim();
    const value = Number(item?.value);
    if (!id || seen.has(id) || !Number.isFinite(value)) continue;
    seen.add(id);
    out.push({ id, label: label || id, value });
  }
  if (!out.length) throw new Error('At least one valid numeric preset is required.');
  return out;
}

export function inferPresetByBoundaries(value, presets, boundaries = []) {
  const list = normalizeNumericPresets(presets);
  const n = Number(value);
  const resolved = Number.isFinite(n) ? n : list[Math.floor(list.length / 2)].value;
  for (let i = 0; i < Math.min(boundaries.length, list.length - 1); i += 1) {
    if (resolved <= Number(boundaries[i])) return list[i].id;
  }
  return list[Math.min(boundaries.length, list.length - 1)].id;
}

export function createNumericPresetController({
  presets,
  boundaries = [],
  min = -Infinity,
  max = Infinity,
  readValue,
  writeValue,
  restorePreset,
  persistPreset,
  emitChange,
  renderState,
} = {}) {
  const list = normalizeNumericPresets(presets);
  const byId = new Map(list.map((item) => [item.id, item]));
  const clamp = (n) => Math.max(Number(min), Math.min(Number(max), n));

  function resolveInitialPreset() {
    const stored = String(restorePreset?.() ?? '').trim();
    if (byId.has(stored)) return stored;
    return inferPresetByBoundaries(readValue?.(), list, boundaries);
  }

  function apply(presetId, { persist = true } = {}) {
    const preset = byId.get(String(presetId)) ?? list[Math.floor(list.length / 2)];
    const value = clamp(preset.value);
    writeValue?.(value);
    emitChange?.(value, preset);
    if (persist) persistPreset?.(preset.id);
    renderState?.({ activeId: preset.id, value, preset, presets: list });
    return { activeId: preset.id, value, preset };
  }

  return {
    presets: list,
    resolveInitialPreset,
    apply,
    initialize() { return apply(resolveInitialPreset(), { persist: true }); },
  };
}
