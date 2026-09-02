/* Aster JavaScript v201 — authenticated buyer-safe derivative: graceful IndexedDB database reset with blocked/error completion. Host state/dependencies are intentionally external. */
async function deleteDB(){
    try{
      const db = await openDB().catch(()=>null);
      try{ db && db.close && db.close(); }catch(e){}
    }catch(e){}
    dbPromise = null;
    await new Promise(res=>{
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess=()=>res(); req.onerror=()=>res(); req.onblocked=()=>res();
    });
  }
