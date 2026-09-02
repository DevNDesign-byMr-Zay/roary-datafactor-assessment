async function dbGet(store, key){
    const db = await openDB();
    return await new Promise(res=>{
      const tx = db.transaction(store,"readonly");
      const g = tx.objectStore(store).get(key);
      g.onsuccess = ()=> res(g.result || null);
      g.onerror = ()=> res(null);
    });
  }
