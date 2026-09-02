/* Aster JavaScript v262 — authenticated buyer-safe derivative: relight-panel open-state detection. Host state/dependencies are intentionally external. */
function isRelightOpen(){
    try{
      const p=getPanel();
      if(!p) return false;
      const tool=(p.getAttribute('data-tool')||p.dataset.tool||'').toLowerCase();
      return tool==='relight' && !!document.getElementById('imageModalImg');
    }catch(e){return false;}
  }
