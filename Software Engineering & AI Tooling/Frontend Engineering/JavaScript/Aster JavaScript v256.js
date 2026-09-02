/* Aster JavaScript v256 — authenticated buyer-safe derivative: persisted operation-duration estimate loading. Host state/dependencies are intentionally external. */
function loadEma(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }catch(e){ return {}; }
  }
