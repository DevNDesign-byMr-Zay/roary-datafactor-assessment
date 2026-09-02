/* Aster JavaScript v532
Buyer-safe historical derivative: observe a rendered image for source changes and persist each distinct, non-noise variant.
*/
function observeImageSourceChanges(image, { normalize = value => value, isNoise = () => false, persist, refresh } = {}) {
  if (!(image instanceof HTMLImageElement) || typeof persist !== "function") return () => {};
  const seen = new Set();
  const push = async () => {
    const source = normalize(image.currentSrc || image.getAttribute("src") || image.src || "");
    if (!source || isNoise(source) || seen.has(source)) return;
    seen.add(source);
    try { await persist(source, { kind: "image", timestamp: Date.now(), origin: "rendered-source" }); } catch {}
    try { await refresh?.(); } catch {}
  };
  const observer = new MutationObserver(() => { void push(); });
  observer.observe(image, { attributes: true, attributeFilter: ["src"] });
  image.addEventListener("load", push, { passive: true });
  void push();
  return () => { observer.disconnect(); image.removeEventListener("load", push); };
}
