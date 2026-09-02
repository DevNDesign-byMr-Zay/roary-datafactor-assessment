/* Aster JavaScript v478
Authenticated historical derivative: lazily mount a reusable image-processing busy overlay into the active image shell.
*/
function ensureImageBusyOverlay(shell) {
  if (!shell) return null;
  if (!shell.style.position) shell.style.position = "relative";
  let overlay = shell.querySelector(":scope > .aster-image-busy-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "aster-image-busy-overlay";
    overlay.innerHTML = '<div class="aster-image-busy-card" aria-hidden="true"><div class="aster-image-shimmer"></div><div class="aster-image-busy-label">Generating…</div></div>';
    shell.appendChild(overlay);
  }
  return overlay;
}
