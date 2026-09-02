/* Aster JavaScript v273 — authenticated buyer-safe derivative: relight intensity input binding. Host state/dependencies are intentionally external. */
function bindIntensity(){
    const el=document.getElementById('asterRelightIntensity');
    if(!el||el.dataset.bound) return;
    el.dataset.bound='1';
    el.addEventListener('input', ()=>{
      const mood=window.__asterRelightMood||'Cinematic';
      const lvl=clamp(parseFloat(el.value||3),1,6);
      window.__asterRelightLevel=lvl;
      applyPreview(mood, lvl);
    });
  }
