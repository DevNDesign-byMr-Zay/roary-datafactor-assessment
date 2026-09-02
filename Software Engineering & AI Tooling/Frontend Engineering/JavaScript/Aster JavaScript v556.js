/* Aster JavaScript v556
Buyer-safe historical derivative: apply an eight-direction resize delta while keeping the expansion frame outside the visible image.
*/
function resizeFrameOutward(state, { clientX, clientY, imageRect, hostRect, minSize = 50 } = {}) {
  if (!state || !imageRect || !hostRect) return null;
  const dx = Number(clientX) - state.startX;
  const dy = Number(clientY) - state.startY;
  let left = state.left, top = state.top, width = state.width, height = state.height;
  const d = state.direction;
  if (["w", "nw", "sw"].includes(d)) { left += dx; width -= dx; }
  if (["e", "ne", "se"].includes(d)) width += dx;
  if (["n", "ne", "nw"].includes(d)) { top += dy; height -= dy; }
  if (["s", "sw", "se"].includes(d)) height += dy;
  width = Math.max(minSize, width); height = Math.max(minSize, height);
  const imageLeft = imageRect.left - hostRect.left;
  const imageTop = imageRect.top - hostRect.top;
  let right = Math.max(left + width, imageLeft + imageRect.width);
  let bottom = Math.max(top + height, imageTop + imageRect.height);
  left = Math.min(left, imageLeft); top = Math.min(top, imageTop);
  return { left, top, width: Math.max(minSize, right - left), height: Math.max(minSize, bottom - top) };
}
