/* Aster JavaScript v221 — authenticated buyer-safe derivative: thread updatedAt stamping and persistence. Host state/dependencies are intentionally external. */
async function saveThread(t){ t.updatedAt = Date.now(); await dbPut("threads", t); }
