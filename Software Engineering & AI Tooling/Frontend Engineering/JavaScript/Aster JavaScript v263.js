/* Aster JavaScript v263 — authenticated buyer-safe derivative: relight preview overlay bootstrap. Host state/dependencies are intentionally external. */
function ensureOverlay(){
    const shell=document.querySelector('.img-modal-image-shell');
    if(!shell) return null;
    let ov=document.getElementById('asterRelightPreviewOverlay');
    if(!ov){
      ov=document.createElement('div');
      ov.id='asterRelightPreviewOverlay';
      ov.style.position='absolute';
      ov.style.inset='0';
      ov.style.pointerEvents='none';
      ov.style.zIndex='11';
      ov.style.opacity='0';
      ov.style.transition='opacity 120ms ease';
      ov.style.mixBlendMode='soft-light';
      shell.appendChild(ov);
    }
    return ov;
  }
