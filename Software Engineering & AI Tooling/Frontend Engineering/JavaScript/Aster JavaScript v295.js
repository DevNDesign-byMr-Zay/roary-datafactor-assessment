/* Aster JavaScript v295 — authenticated buyer-safe derivative: active-image Blob resolution. Host state/dependencies are intentionally external. */
async function getActiveImageBlob(){
    const img=document.getElementById('imageModalImg');
    if(!img) return null;
    const src=img.currentSrc||img.src;
    if(!src) return null;
    // try fetch (works for blob:, http:, data:)
    try{
      const res=await fetch(src);
      if(!res.ok) return null;
      return await res.blob();
    }catch(e){
      return null;
    }
  }
