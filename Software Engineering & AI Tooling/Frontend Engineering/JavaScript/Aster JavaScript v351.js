async function dbAll(store, indexName=null, indexRange=null, direction="prev"){
    const db = await openDB();
    return await new Promise(res=>{
      const out=[];
      const tx = db.transaction(store,"readonly");
      const st = tx.objectStore(store);
      const src = indexName ? st.index(indexName) : st;
      const req = src.openCursor(indexRange || null, direction);
      req.onsuccess = ()=>{
        const cur = req.result;
        if(cur){ out.push(cur.value); cur.continue(); }
        else res(out);
      };
      req.onerror = ()=> res(out);
    });
  }
