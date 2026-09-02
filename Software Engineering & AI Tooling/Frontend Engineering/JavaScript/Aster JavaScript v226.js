/* Aster JavaScript v226 — authenticated buyer-safe derivative: timestamp-plus-random local identifier helper. Host state/dependencies are intentionally external. */
function uuid(prefix="id"){
    return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);
  }
