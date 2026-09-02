/* Aster JavaScript v558
Buyer-safe historical derivative: keep a tool overlay mounted only while its modal and tool state remain active.
*/
function startToolOverlayLifecycle({ getTool, hasModal, ensureOverlay, destroyOverlay, activeTool = "expand", intervalMs = 350 } = {}) {
  const tick = () => {
    try {
      if (!hasModal?.()) return destroyOverlay?.();
      if (String(getTool?.() || "") === activeTool) ensureOverlay?.();
      else destroyOverlay?.();
    } catch {}
  };
  tick();
  const timer = setInterval(tick, intervalMs);
  return () => { clearInterval(timer); try { destroyOverlay?.(); } catch {} };
}
