/**
 * Resilient catalog retrieval with deterministic fallback entries.
 *
 * Keeps a selector usable when its remote catalog endpoint is temporarily
 * unavailable, returns a non-success response, or produces an unusable payload.
 */
export async function fetchCatalogWithFallback({
  fetchImpl = globalThis.fetch,
  url,
  init,
  fallback = [],
  extract = defaultExtract,
} = {}) {
  const local = normalizeEntries(fallback);

  if (typeof fetchImpl !== 'function' || !url) {
    return { entries: local, source: 'fallback' };
  }

  try {
    const response = await fetchImpl(url, init);
    if (!response || !response.ok) {
      return { entries: local, source: 'fallback' };
    }

    const payload = await response.json();
    const remote = normalizeEntries(extract(payload));
    if (!remote.length) {
      return { entries: local, source: 'fallback' };
    }

    return { entries: remote, source: 'remote' };
  } catch {
    return { entries: local, source: 'fallback' };
  }
}

export function normalizeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const seen = new Set();
  const out = [];
  for (const item of entries) {
    const normalized = typeof item === 'string'
      ? { id: item }
      : item && typeof item === 'object'
        ? { ...item }
        : null;

    const id = normalized?.id == null ? '' : String(normalized.id).trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ ...normalized, id });
  }
  return out;
}

function defaultExtract(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
