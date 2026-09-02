/* Aster JavaScript v548
Buyer-safe historical derivative: verify that a validated local image-tool base exposes a target route without mistaking method errors for missing routes.
*/
async function probeToolRoute(base, { route = "/tool/remove", timeoutMs = 1600, fetchImpl = fetch } = {}) {
  const origin = String(base || "").trim().replace(/\/+$/, "");
  if (!origin || typeof fetchImpl !== "function") return false;
  const url = origin + (String(route || "").startsWith("/") ? route : `/${route}`);
  const request = async (method, init = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(100, Number(timeoutMs) || 1600));
    try { return await fetchImpl(url, { method, cache: "no-store", signal: controller.signal, ...init }); }
    catch (_) { return null; }
    finally { clearTimeout(timer); }
  };
  const getResponse = await request("GET");
  if (getResponse?.ok) return true;
  const postResponse = await request("POST", { body: "", headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  if (!postResponse) return false;
  if (postResponse.status === 404 || postResponse.status === 405) return false;
  return postResponse.ok || [400, 401, 422].includes(postResponse.status);
}
