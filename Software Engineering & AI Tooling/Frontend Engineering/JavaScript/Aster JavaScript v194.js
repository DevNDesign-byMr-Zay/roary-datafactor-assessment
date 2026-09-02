/* Aster JavaScript v194 — authenticated buyer-safe derivative: mask-canvas reset and status synchronization. Host state/dependencies are intentionally external. */
function clearMask(){
    const r = maskCanvas.getBoundingClientRect();
    maskCtx.clearRect(0,0,r.width,r.height);
    invertMask=false;
    $("#maskStats").textContent = "Mask: cleared";
  }
