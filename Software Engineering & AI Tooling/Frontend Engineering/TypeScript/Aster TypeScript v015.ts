export interface CompatibleModelRecord {
  transportId: string;
  displayId: string;
  label: string;
}

function basename(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/\/+$/, '');
  return normalized.slice(normalized.lastIndexOf('/') + 1) || value;
}

function stripArtifactSuffix(value: string): string {
  return value.replace(/\.(?:bin|gguf|safetensors)$/i, '');
}

export function normalizeCompatibleModelList(payload: unknown): CompatibleModelRecord[] {
  const data = (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];

  const out: CompatibleModelRecord[] = [];
  const seen = new Set<string>();

  for (const entry of data) {
    const id = typeof entry === 'string'
      ? entry
      : typeof (entry as { id?: unknown })?.id === 'string'
        ? (entry as { id: string }).id
        : '';
    const transportId = id.trim();
    if (!transportId || seen.has(transportId)) continue;
    seen.add(transportId);

    const displayId = stripArtifactSuffix(basename(transportId));
    out.push({ transportId, displayId, label: displayId || transportId });
  }

  return out;
}
