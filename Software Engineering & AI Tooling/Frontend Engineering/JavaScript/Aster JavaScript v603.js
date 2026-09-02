export async function parseJsonResponseSafely(response) {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}
