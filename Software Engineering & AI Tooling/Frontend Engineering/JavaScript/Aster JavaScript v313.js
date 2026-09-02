/* Aster JavaScript v313 — authenticated buyer-safe derivative: relight control event wiring. Host state/dependencies are intentionally external. */
function wire(){
    const g=document.getElementById('asterRelightMoodGrid');
    if(g && !g.dataset.rtPreviewWired){
      g.dataset.rtPreviewWired='1';
      g.addEventListener('click',e=>{ if(e.target.closest && e.target.closest('[data-mood]')) schedule(); });
    }
    const r=document.getElementById('asterRelightIntensity');
    if(r && !r.dataset.rtPreviewWired){
      r.dataset.rtPreviewWired='1';
      r.addEventListener('input',schedule,{passive:true});
      r.addEventListener('change',schedule);
    }
    const i=img();
    if(i && !i.dataset.rtPreviewImgWired){
      i.dataset.rtPreviewImgWired='1';
      new MutationObserver(schedule).observe(i,{attributes:true,attributeFilter:['src']});
      i.addEventListener('load',schedule,{passive:true});
    }
  }
