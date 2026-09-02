/* Aster JavaScript v554
Buyer-safe historical derivative: mount an eight-point resize frame without replacing the host tool surface.
*/
function mountEightPointResizeFrame(frame, { onPointerDown } = {}) {
  if (!(frame instanceof HTMLElement)) return [];
  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  return handles.map(direction => {
    let handle = frame.querySelector(`[data-resize-handle="${direction}"]`);
    if (!(handle instanceof HTMLElement)) {
      handle = document.createElement("div");
      handle.dataset.resizeHandle = direction;
      frame.appendChild(handle);
    }
    if (typeof onPointerDown === "function" && !handle.dataset.resizeBound) {
      handle.dataset.resizeBound = "1";
      handle.addEventListener("pointerdown", event => onPointerDown(event, direction));
    }
    return handle;
  });
}
