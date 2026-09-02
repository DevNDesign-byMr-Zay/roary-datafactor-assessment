async function saveThread(t){
    t.updatedAt = Date.now();
    await dbPut("threads", t);
  }
