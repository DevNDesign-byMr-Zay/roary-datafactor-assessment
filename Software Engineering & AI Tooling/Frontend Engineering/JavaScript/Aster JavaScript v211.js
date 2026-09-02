/* Aster JavaScript v211 — authenticated buyer-safe derivative: pointer-to-canvas coordinate normalization. Host state/dependencies are intentionally external. */
function ptFromEvent(ev){
    const r = maskCanvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height };
  }
