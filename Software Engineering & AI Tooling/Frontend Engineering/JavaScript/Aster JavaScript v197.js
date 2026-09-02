/* Aster JavaScript v197 — authenticated buyer-safe derivative: transaction-safe IndexedDB record deletion. Host state/dependencies are intentionally external. */
async function dbDel(store,key){
    const db = await openDB();
    return await new Promise(res=>{
      const tx=db.transaction(store,"readwrite");
      tx.oncomplete=()=>res(true);
      tx.onerror=()=>res(false);
      tx.objectStore(store).delete(key);
    });
  }
