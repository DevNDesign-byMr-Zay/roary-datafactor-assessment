/* Aster JavaScript v299 — authenticated buyer-safe derivative: expand-overlay stacking synchronization. Host state/dependencies are intentionally external. */
function placeExpandOverlayBehind(){
    try{
      const ov = document.getElementById("asterExpandOverlay");
      const img = document.getElementById("imageModalImg") || document.querySelector(".image-modal img");
      if(!ov || !img) return;
      const shell = img.parentElement;
      if(!shell) return;
      if(ov.parentElement !== shell || shell.firstChild !== ov){
        shell.insertBefore(ov, img);
      }
      try{
        img.style.position = img.style.position || "relative";
        img.style.zIndex = img.style.zIndex || "6";
      }catch(e){}
    }catch(e){}
  }
