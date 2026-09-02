/* Aster JavaScript v218 — authenticated buyer-safe derivative: device-pixel-ratio-aware mask canvas resizing. Host state/dependencies are intentionally external. */
function resizeMaskCanvas(){
    const r = modalImg.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio||1));
    maskCanvas.width  = Math.round(w*dpr);
    maskCanvas.height = Math.round(h*dpr);
    maskCanvas.style.width = w+"px";
    maskCanvas.style.height = h+"px";
    maskCtx = maskCanvas.getContext("2d");
    maskCtx.setTransform(dpr,0,0,dpr,0,0);
    maskCtx.lineCap="round";
    maskCtx.lineJoin="round";
  }
