/* Aster JavaScript v544
Buyer-safe historical derivative: enforce the locked local Image Tool service origin and port before a frontend request is issued.
*/
function resolveLockedImageToolBase(configuredBase) {
  const fallback = "http://127.0.0.1:5151";
  const candidate = String(configuredBase || fallback).trim().replace(/\/$/, "");
  try {
    const parsed = new URL(candidate);
    const hostOk = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    const portOk = parsed.port === "5151";
    const protocolOk = parsed.protocol === "http:";
    return hostOk && portOk && protocolOk ? `${parsed.protocol}//${parsed.hostname}:5151` : fallback;
  } catch {
    return fallback;
  }
}
