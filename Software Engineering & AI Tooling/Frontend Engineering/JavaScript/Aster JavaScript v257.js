/* Aster JavaScript v257 — authenticated buyer-safe derivative: persisted operation-duration estimate storage. Host state/dependencies are intentionally external. */
function saveEma(obj){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(obj||{})); }catch(e){}
  }
