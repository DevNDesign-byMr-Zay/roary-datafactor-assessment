/* Aster JavaScript v484
Authenticated historical derivative: lazily mount a dedicated realtime-preview canvas above the active image.
*/
function ensurePreviewCanvas(shell, id = "asterImagePreviewCanvas") {
  if (!shell) return null;
  let canvas = shell.querySelector(`#${id}`);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.className = "aster-image-preview-canvas";
    Object.assign(canvas.style, {
      position: "absolute", inset: "0", pointerEvents: "none", zIndex: "12",
      opacity: "0", transition: "opacity 120ms ease"
    });
    shell.appendChild(canvas);
  }
  return canvas;
}
