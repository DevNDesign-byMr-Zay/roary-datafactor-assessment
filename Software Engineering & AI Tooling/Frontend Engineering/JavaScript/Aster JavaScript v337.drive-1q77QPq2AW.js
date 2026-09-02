function cleanupObjectURLs(){
    for(const [id,u] of state.objectURLs.entries()){
      try{ URL.revokeObjectURL(u); }catch(e){}
    }
    state.objectURLs.clear();
  }
