/* Aster JavaScript v550
Buyer-safe historical derivative: execute an image-removal request across compatible route aliases, continuing only when a route is genuinely absent.
*/
async function postRemovalWithFallback(base, form, { routes = ["/tool/remove", "/tool/erase", "/tool/inpaint_remove"], signal, fetchImpl = fetch } = {}) {
  const origin = String(base || "").trim().replace(/\/+$/, "");
  if (!origin || !(form instanceof FormData)) throw new Error("Invalid removal request");
  let lastError = null;
  for (const route of routes) {
    try {
      const response = await fetchImpl(origin + route, { method: "POST", body: form, signal });
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) continue;
        const detail = await response.text().catch(() => "");
        throw new Error(`Removal failed (${response.status}): ${detail || response.statusText}`);
      }
      const payload = await response.json().catch(() => ({}));
      const url = payload?.images?.[0]?.url || payload?.image?.url || payload?.image_url || payload?.url || "";
      if (url) return url;
      throw new Error("Removal response contained no image URL");
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error("No compatible removal route responded");
}
