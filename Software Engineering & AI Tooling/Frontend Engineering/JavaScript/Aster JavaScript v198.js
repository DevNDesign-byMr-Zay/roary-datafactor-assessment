/* Aster JavaScript v198 — authenticated buyer-safe derivative: promise-wrapped IndexedDB keyed read. Host state/dependencies are intentionally external. */
async function dbGet(store, key){
    const db = await openDB();
    return await new Promise(res=>{
      const tx = db.transaction(store, "readonly");
      const st = tx.objectStore(store);
      const req = st.get(key);
      req.onsuccess = ()=> res(req.result || null);
      req.onerror = ()=> res(null);
    });
  }
