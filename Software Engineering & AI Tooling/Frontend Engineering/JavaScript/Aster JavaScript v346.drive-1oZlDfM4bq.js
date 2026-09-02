function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VER);
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
        if(!db.objectStoreNames.contains("settings")){
          db.createObjectStore("settings", { keyPath:"key" });
        }
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
    });
    return dbPromise;
  }
