/* Aster JavaScript v561
Buyer-safe historical derivative: install a mask-export adapter that resolves the live canvas at call time and can be safely re-applied after dynamic tool-panel rebuilds.
*/
function installLiveMaskAdapter({ api, canvasProvider, serializer = canvasToBinaryMaskDataUrl } = {}) {
  if (!api || typeof canvasProvider !== "function" || typeof serializer !== "function") return false;
  const previousGet = typeof api.getMaskDataURL === "function" ? api.getMaskDataURL.bind(api) : null;
  const previousHas = typeof api.hasMask === "function" ? api.hasMask.bind(api) : null;
  api.getMaskDataURL = function getMaskDataURL() {
    const canvas = canvasProvider();
    const encoded = canvas ? serializer(canvas) : "";
    if (encoded) return encoded;
    try { return previousGet?.() || ""; } catch (_) { return ""; }
  };
  api.hasMask = function hasMask() {
    const canvas = canvasProvider();
    if (canvas && serializer(canvas)) return true;
    try { return !!previousHas?.(); } catch (_) { return false; }
  };
  return true;
}
