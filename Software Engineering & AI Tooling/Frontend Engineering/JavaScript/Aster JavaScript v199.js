/* Aster JavaScript v199 — authenticated buyer-safe derivative: generic IndexedDB put through a transaction helper. Host state/dependencies are intentionally external. */
async function dbPut(store, obj){ return await dbTx(store, "readwrite", st => st.put(obj)); }
