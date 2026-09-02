function saveBackupThreads(threads){
    try{
      const compact = threads.map(t=>({
        id:t.id, title:t.title, createdAt:t.createdAt, updatedAt:t.updatedAt,
        messages:(t.messages||[]).map(m=>({id:m.id,role:m.role,content:m.content,mediaIds:m.mediaIds||[],ts:m.ts}))
      }));
      localStorage.setItem(LS_BACKUP, JSON.stringify({savedAt:Date.now(), threads:compact}));
    }catch(e){}
  }
