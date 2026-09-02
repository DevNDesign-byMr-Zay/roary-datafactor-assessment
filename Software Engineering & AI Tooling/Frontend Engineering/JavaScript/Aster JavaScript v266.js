/* Aster JavaScript v266 — authenticated buyer-safe derivative: relight preview reset. Host state/dependencies are intentionally external. */
function clearPreview(){
    const img=getActiveImg();
    if(img) img.style.filter='';
    const ov=document.getElementById('asterRelightPreviewOverlay');
    if(ov) ov.style.opacity='0';
  }
