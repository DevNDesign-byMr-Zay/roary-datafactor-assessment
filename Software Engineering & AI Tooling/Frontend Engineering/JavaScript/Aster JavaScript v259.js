/* Aster JavaScript v259 — authenticated buyer-safe derivative: exponential moving-average duration update. Host state/dependencies are intentionally external. */
function updateExpected(key, sampleMs){
    if(!(sampleMs>0) || !isFinite(sampleMs)) return;
    const prev = getExpected(key);
    const next = prev*(1-ALPHA) + sampleMs*ALPHA;
    EMA[key] = clamp(next, 250, 60000);
    saveEma(EMA);
  }
