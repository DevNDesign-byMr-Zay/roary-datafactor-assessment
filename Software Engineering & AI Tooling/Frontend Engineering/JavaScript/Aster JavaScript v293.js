/* Aster JavaScript v293 — authenticated buyer-safe derivative: relight preview overlay bootstrap. Host state/dependencies are intentionally external. */
function ensurePreviewOverlay(){
    const img=document.getElementById('imageModalImg');
    if(!img) return null;
    const shell=img.parentElement;
    if(!shell) return null;
    let ov=document.getElementById('rtRelightAccuratePreview');
    if(!ov){
      // ensure shell is position:relative
      const cs=getComputedStyle(shell);
      if(cs.position==='static') shell.style.position='relative';
      ov=document.createElement('img');
      ov.id='rtRelightAccuratePreview';
      ov.alt='';
      ov.style.cssText='position:absolute; inset:0; width:100%; height:100%; object-fit:contain; pointer-events:none; opacity:0; transition:opacity 160ms ease; filter:none;';
      shell.appendChild(ov);
    }
    return ov;
  }
