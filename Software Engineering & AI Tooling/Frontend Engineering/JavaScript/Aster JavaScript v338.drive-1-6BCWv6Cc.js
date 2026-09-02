function openEditor(mediaId){
    if(!mediaId){
      toast("Select an image first.", "bad");
      return;
    }
    const u = mediaURL(mediaId);
    if(!u){
      toast("Image not available.", "bad");
      return;
    }
    state.selectedMediaId = mediaId;
    modalImg.src = u;
    modal.classList.add("show");
    setTimeout(()=> resizeMaskCanvas(), 40);
    clearMask();
    $("#imgBaseShow").textContent = state.cfg.imageBase;
  }
