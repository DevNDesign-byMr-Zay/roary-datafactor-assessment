/* Aster JavaScript v258 — authenticated buyer-safe derivative: bounded expected-duration lookup. Host state/dependencies are intentionally external. */
function getExpected(key){
    const v = EMA[key];
    return (typeof v === "number" && isFinite(v) && v > 150) ? v : (DEFAULTS[key] || 4200);
  }
