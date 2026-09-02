export interface ModelEndpointEntry {
  id: string;
}

export async function discoverCompatibleModels(
  baseUrl: string,
  headers: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<ModelEndpointEntry[]> {
  const root = baseUrl.replace(/\/+$/, '');
  const response = await fetch(`${root}/models`, { headers, signal });
  if (!response.ok) {
    throw new Error(`model discovery failed with HTTP ${response.status}`);
  }

  const payload = await response.json() as { data?: unknown };
  if (!Array.isArray(payload.data)) return [];

  return payload.data.flatMap((entry) => {
    const id = typeof entry === 'string'
      ? entry
      : typeof (entry as { id?: unknown })?.id === 'string'
        ? (entry as { id: string }).id
        : '';
    return id.trim() ? [{ id: id.trim() }] : [];
  });
}
