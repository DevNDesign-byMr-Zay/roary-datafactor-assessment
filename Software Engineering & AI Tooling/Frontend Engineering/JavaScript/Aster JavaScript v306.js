/* Aster JavaScript v306 — authenticated buyer-safe derivative: animation-frame preview synchronization. Host state/dependencies are intentionally external. */
function tick(){
    try{
      if(isRelightOpen()){
        ensureMoodGrid();
        ensureICLightControls();
        bindIntensity();
        // keep preview synced
        const mood=window.__asterRelightMood||'Cinematic';
        const lvl=clamp(parseFloat(document.getElementById('asterRelightIntensity')?.value||window.__asterRelightLevel||3),1,6);
        applyPreview(mood,lvl);
      } else {
        clearPreview();
      }
    }catch(e){}
  }
