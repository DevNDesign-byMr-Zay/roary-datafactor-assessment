/* Aster JavaScript v291 — authenticated buyer-safe derivative: safe local-storage persistence. Host state/dependencies are intentionally external. */
function asterLsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
