/* Aster JavaScript v196 — authenticated buyer-safe derivative: cursor-based ordered IndexedDB collection read. Host state/dependencies are intentionally external. */
async function dbAll(store, indexName=null, range=null, direction="prev"){
    const db = await openDB();
    return await new Promise(res=>{
      const out=[];
      const tx = db.transaction(store,"readonly");
      const st = tx.objectStore(store);
      const src = indexName ? st.index(indexName) : st;
      const req = src.openCursor(range || null, direction);
      req.onsuccess = ()=>{
        const cur = req.result;
        if(cur){ out.push(cur.value); cur.continue(); }
        else res(out);
      };
      req.onerror = ()=> res(out);
    });
  }
