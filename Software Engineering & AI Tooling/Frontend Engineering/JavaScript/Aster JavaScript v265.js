/* Aster JavaScript v265 — authenticated buyer-safe derivative: relight preview filter application. Host state/dependencies are intentionally external. */
function applyPreview(mood, level){
    const img=getActiveImg();
    if(!img) return;
    const i=clamp(parseFloat(level)||3,1,6);
    const p=presetFor(mood);
    img.style.transition='filter 90ms linear';
    img.style.filter=p.filter(i);
    const ov=ensureOverlay();
    if(ov){
      ov.style.background=p.overlay(i);
      ov.style.opacity=String(clamp(p.op(i),0,0.85));
    }
    try{ window.__asterUpdateRelightTilePreviews && window.__asterUpdateRelightTilePreviews(i); }catch(e){}
  }
