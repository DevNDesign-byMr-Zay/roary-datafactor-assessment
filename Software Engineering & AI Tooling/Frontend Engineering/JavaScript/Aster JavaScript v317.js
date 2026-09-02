/* Aster JavaScript v317 — authenticated buyer-safe derivative: body-level tool-state attribute synchronization. Host state/dependencies are intentionally external. */
function setBodyAttr(name,val){
    try{ document.body && document.body.setAttribute(name,val); }catch(_){ }
  }
