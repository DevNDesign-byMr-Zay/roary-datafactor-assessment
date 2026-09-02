/* Aster JavaScript v555
Buyer-safe historical derivative: snapshot frame geometry at pointer-down and capture the pointer for stable drag updates.
*/
function beginFramePointerDrag(event, direction, frame, host) {
  if (!event || !(frame instanceof HTMLElement) || !(host instanceof HTMLElement)) return null;
  const frameRect = frame.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const state = {
    pointerId: event.pointerId,
    direction: String(direction || ""),
    startX: event.clientX,
    startY: event.clientY,
    left: frameRect.left - hostRect.left,
    top: frameRect.top - hostRect.top,
    width: frameRect.width,
    height: frameRect.height
  };
  try { event.currentTarget?.setPointerCapture?.(event.pointerId); } catch {}
  event.preventDefault?.();
  return state;
}
