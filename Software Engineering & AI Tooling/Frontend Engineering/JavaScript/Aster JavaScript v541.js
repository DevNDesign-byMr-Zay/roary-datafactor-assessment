/* Aster JavaScript v541
Buyer-safe historical derivative: lazily mount a non-interactive preview image over the active image while preserving parent layout.
*/
function ensureImagePreviewOverlay(image, { id = "tool-preview-overlay", className = "tool-preview-overlay" } = {}) {
  if (!(image instanceof HTMLImageElement) || !image.parentElement) return null;
  const shell = image.parentElement;
  let overlay = shell.querySelector(`#${CSS.escape(id)}`);
  if (overlay instanceof HTMLImageElement) return overlay;
  if (getComputedStyle(shell).position === "static") shell.style.position = "relative";
  overlay = document.createElement("img");
  overlay.id = id;
  overlay.className = className;
  overlay.alt = "";
  overlay.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;opacity:0;transition:opacity 160ms ease;";
  shell.appendChild(overlay);
  return overlay;
}
