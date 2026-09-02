/* Aster JavaScript v240 — authenticated buyer-safe derivative: persisted active-tool key storage. Host state/dependencies are intentionally external. */
function setStoredTools(keys){
    try{ localStorage.setItem("aster.tools.active", JSON.stringify(keys||[])); }catch(_){}
  }
