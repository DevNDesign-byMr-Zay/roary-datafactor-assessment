/* Aster JavaScript v487
Authenticated historical derivative: request and validate a depth-map result through the locked local backend.
*/
async function requestDepthMap(formData, base = "http://127.0.0.1:5151") {
  const url = new URL(String(base));
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== "5151") throw new Error("Invalid local image-tool base");
  const response = await fetch(`${url.protocol}//${url.host}/tool/depthmap`, { method: "POST", body: formData, mode: "cors", credentials: "omit", cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  const depthMapUrl = data?.depth_map_url || data?.url || "";
  if (!response.ok || !depthMapUrl) throw new Error(data?.detail || data?.error || `Depth-map request failed (${response.status})`);
  return String(depthMapUrl);
}
