/* Aster JavaScript v208 — authenticated buyer-safe derivative: cached media Blob ObjectURL resolver. Host state/dependencies are intentionally external. */
function mediaURL(mediaId){
    if(!mediaId) return "";
    if(state.objectURLs.has(mediaId)) return state.objectURLs.get(mediaId);
    const it = state.media.find(x=>x.id===mediaId);
    if(!it) return "";
    if(it.blob){
      const u = URL.createObjectURL(it.blob);
      state.objectURLs.set(mediaId, u);
      return u;
    }
    return "";
  }
