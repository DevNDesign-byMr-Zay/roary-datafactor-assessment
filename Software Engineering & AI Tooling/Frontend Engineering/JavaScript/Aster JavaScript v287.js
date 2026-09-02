/* Aster JavaScript v287 — authenticated buyer-safe derivative: safe local-storage retrieval. Host state/dependencies are intentionally external. */
function asterLsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
