async function dbPut(store, obj){
    const db = await openDB();
    return await new Promise(res=>{
      const tx = db.transaction(store,"readwrite");
      tx.oncomplete = ()=> res(true);
      tx.onerror = ()=> res(false);
      tx.objectStore(store).put(obj);
    });
  }
