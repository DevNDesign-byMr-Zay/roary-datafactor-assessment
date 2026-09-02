async function restoreFromBackupIfEmpty(){
    const all = await dbAll("threads","updatedAt",null,"prev");
    if(all && all.length) return false;
    let backup=null;
    try{ backup = JSON.parse(localStorage.getItem(LS_BACKUP)||"null"); }catch(e){}
    if(!backup?.threads?.length) return false;
    logDiag("Restoring threads from localStorage backup…");
    for(const t of backup.threads){ await dbPut("threads", t); }
    return true;
  }
