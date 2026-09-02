/* Aster JavaScript v574
Buyer-safe historical derivative: append or replace a freshness token on an output URL to prevent stale browser rendering.
*/
function withFreshnessToken(url, { key = "t", value = Date.now() } = {}) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw, typeof location !== "undefined" ? location.href : "http://localhost/");
    parsed.searchParams.set(key, String(value));
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return parsed.href;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    const separator = raw.includes("?") ? "&" : "?";
    return raw + separator + encodeURIComponent(key) + "=" + encodeURIComponent(String(value));
  }
}
