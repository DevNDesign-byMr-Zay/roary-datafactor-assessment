/* Aster JavaScript v507
Authenticated historical derivative: place an anchored floating drawer above its composer when possible, then clamp it inside the viewport.
*/
function positionAnchoredDrawer(drawer, anchor, { padding = 12, gap = 14, contextSelector = ".composer, .composer-wrap" } = {}) {
  if (!drawer || !anchor) return null;
  const anchorRect = anchor.getBoundingClientRect();
  const context = anchor.closest?.(contextSelector);
  const contextRect = context?.getBoundingClientRect?.() || null;
  const drawerRect = drawer.getBoundingClientRect();
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  let left = anchorRect.left;
  let top = (contextRect ? contextRect.top : anchorRect.top) - gap - drawerRect.height;
  if (top < padding) top = (contextRect ? contextRect.bottom : anchorRect.bottom) + gap;
  left = Math.max(padding, Math.min(left, Math.max(padding, width - drawerRect.width - padding)));
  top = Math.max(padding, Math.min(top, Math.max(padding, height - drawerRect.height - padding)));
  drawer.style.left = `${Math.round(left)}px`;
  drawer.style.top = `${Math.round(top)}px`;
  return { left, top };
}
