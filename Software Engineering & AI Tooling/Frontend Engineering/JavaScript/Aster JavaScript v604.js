export async function probeServiceHealth({
  fetchImpl = globalThis.fetch,
  baseUrl = '',
  path = '/health',
  headers = {},
  parseResponse = async (response) => {
    const raw = await response.text();
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return { raw };
    }
  },
} = {}) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const endpoint = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetchImpl(endpoint, { headers });
    const data = await parseResponse(response);

    return {
      ok: Boolean(response.ok),
      status: response.status,
      data,
      error: response.ok ? null : data?.error || data?.message || 'Health check failed',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
