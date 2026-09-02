/* Aster JavaScript v297 — authenticated buyer-safe derivative: debounced relight preview scheduling. Host state/dependencies are intentionally external. */
function schedulePreview(){
    if(previewTimer) clearTimeout(previewTimer);
    previewTimer=setTimeout(runPreview, 280);
  }
