/* Aster JavaScript v200 — authenticated buyer-safe derivative: promise-wrapped IndexedDB transaction executor. Host state/dependencies are intentionally external. */
async function dbTx(store, mode, fn){
    const db = await openDB();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction(store, mode);
      const st = tx.objectStore(store);
      let out;
      tx.oncomplete = ()=> resolve(out);
      tx.onerror = ()=> reject(tx.error || new Error("IDB tx error"));
      try{ out = fn(st); }catch(e){ reject(e); }
    });
  }
