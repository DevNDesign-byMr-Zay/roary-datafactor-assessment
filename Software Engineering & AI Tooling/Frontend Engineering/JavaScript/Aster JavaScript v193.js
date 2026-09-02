/* Aster JavaScript v193 — authenticated buyer-safe derivative: deterministic ObjectURL cleanup. Host state/dependencies are intentionally external. */
function cleanupObjectURLs(){
    for(const [id,u] of state.objectURLs.entries()){
      try{ URL.revokeObjectURL(u); }catch(e){}
    }
    state.objectURLs.clear();
  }
