/* Aster JavaScript v284 — authenticated buyer-safe derivative: object-removal mask canvas resolution. Host state/dependencies are intentionally external. */
function getMaskCanvas(){
    return document.getElementById("rtEraseMaskCanvas2")
      || document.getElementById("rtEraseMaskCanvas")
      || document.getElementById("rtRemoveMaskCanvas")
      || document.querySelector("canvas[data-remove-mask]")
      || null;
  }
