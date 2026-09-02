/* Aster JavaScript v210 — authenticated buyer-safe derivative: media-editor open flow with image availability checks and mask reset. Host state/dependencies are intentionally external. */
function openEditor(mediaId){
    if(!mediaId){ toast("Select an image first.", "bad"); return; }
    const u = mediaURL(mediaId);
    if(!u){ toast("Image not available.", "bad"); return; }
    state.selectedMediaId = mediaId;
    modalImg.src = u;
    modal.classList.add("show");
    $("#imgBaseShow").textContent = state.cfg.imageBase;
    setTimeout(()=>{ resizeMaskCanvas(); clearMask(); measureMaskCoverage(); }, 60);
  }
