/* Aster JavaScript v276 — authenticated buyer-safe derivative: lightbox variation-source observation. Host state/dependencies are intentionally external. */
function __observeLightbox(){
    var img = document.getElementById('imageModalImg');
    if(!img || img.__asterVarObs) return;
    img.__asterVarObs = 1;
    var seen = new Set();
    var push = async function(src){
      var norm = asterNormalizeMediaSrc_v167(src);
      if(!norm || asterIsNoiseSrc(norm) || seen.has(norm)) return;
      seen.add(norm);
      try{ if(typeof Xn==='function') await Xn(norm,{kind:'image',src:norm,ts:Date.now(),meta:{origin:'lightbox'}}); }catch(e){}
      try{ if(typeof Hn==='function') Hn(); }catch(e){}
    };
    var mo = new MutationObserver(function(){ push(img.getAttribute('src')||img.currentSrc||''); });
    mo.observe(img,{attributes:true,attributeFilter:['src']});
    img.addEventListener('load', function(){ push(img.currentSrc||img.src||''); }, {passive:true});
  }
