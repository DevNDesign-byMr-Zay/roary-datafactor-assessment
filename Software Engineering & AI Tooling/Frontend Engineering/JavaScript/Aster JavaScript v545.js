/* Aster JavaScript v545
Buyer-safe historical derivative: post an image preview request to the locked local service using FormData and normalize common response URL shapes.
*/
async function requestLocalImagePreview({ base, endpoint = "/tool/preview", source, fields = {}, signal, fetchImpl = fetch } = {}) {
  const origin = resolveLockedImageToolBase(base);
  const blob = await imageSourceToBlob(source, { fetchImpl });
  if (!blob) return null;
  const body = new FormData();
  body.append("image", new File([blob], "image.png", { type: blob.type || "image/png" }));
  for (const [key, value] of Object.entries(fields || {})) {
    if (value != null) body.append(key, String(value));
  }
  const response = await fetchImpl(`${origin}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, { method: "POST", body, signal });
  if (!response.ok) throw new Error(`preview request failed: ${response.status}`);
  const payload = await response.json();
  return payload?.image_url || payload?.url || payload?.output || payload?.result || null;
}
