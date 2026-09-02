/* Aster JavaScript v209 — authenticated buyer-safe derivative: IndexedDB open/upgrade bootstrap with thread/media stores. Host state/dependencies are intentionally external. */
function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject)=>{
      let req;
      try{ req = indexedDB.open(DB_NAME, DB_VER); }catch(e){ reject(e); return; }
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains("threads")){
          const st = db.createObjectStore("threads", { keyPath:"id" });
          st.createIndex("updatedAt","updatedAt",{unique:false});
        }
        if(!db.objectStoreNames.contains("media")){
          const st = db.createObjectStore("media", { keyPath:"id" });
          st.createIndex("ts","ts",{unique:false});
          st.createIndex("threadId","threadId",{unique:false});
        }
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
      req.onblocked = ()=> reject(new Error("IndexedDB blocked (close other tabs)."));
    });
    return dbPromise;
  }
