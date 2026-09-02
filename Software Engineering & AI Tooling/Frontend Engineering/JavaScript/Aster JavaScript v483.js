/* Aster JavaScript v483
Authenticated historical derivative: bounded health probe for the locked local image-tool backend.
*/
async function checkBackendHealth(base = "http://127.0.0.1:5151", timeoutMs = 750) {
  const url = new URL(String(base));
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== "5151") return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${url.protocol}//${url.host}/health`, { method: "GET", cache: "no-store", signal: controller.signal });
    return !!response?.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
