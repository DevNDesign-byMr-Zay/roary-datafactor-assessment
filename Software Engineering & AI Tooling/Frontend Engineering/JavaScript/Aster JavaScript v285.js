/* Aster JavaScript v285 — authenticated buyer-safe derivative: object-removal panel resolution. Host state/dependencies are intentionally external. */
function getRemovePanel(){
    const sp = document.querySelector("#rtSidePanel");
    if(sp && (sp.dataset?.tool === "remove" || sp.getAttribute("data-tool")==="remove")) return sp;
    return document.querySelector('[data-tool="remove"]') || sp;
  }
