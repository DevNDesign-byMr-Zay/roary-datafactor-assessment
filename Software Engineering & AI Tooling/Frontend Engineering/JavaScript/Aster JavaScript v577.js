export async function importWhenHealthy({
  healthUrl,
  moduleUrl,
  fetchImpl = fetch,
  importImpl = (url) => import(url),
}) {
  const response = await fetchImpl(healthUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    return { loaded: false, status: response.status, module: null };
  }

  const module = await importImpl(moduleUrl);
  return { loaded: true, status: response.status, module };
}
