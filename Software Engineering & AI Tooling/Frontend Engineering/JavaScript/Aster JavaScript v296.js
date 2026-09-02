/* Aster JavaScript v296 — authenticated buyer-safe derivative: image-tool backend base resolution. Host state/dependencies are intentionally external. */
function getImageBackendBase(){
    try{ return localStorage.getItem('aster.imageBackendBase') || localStorage.getItem('aster.imageToolBase') || 'http://127.0.0.1:5151'; }catch(e){ return 'http://127.0.0.1:5151'; }
  }
