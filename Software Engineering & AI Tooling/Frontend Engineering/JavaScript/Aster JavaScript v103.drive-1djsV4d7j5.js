/* Aster JavaScript v103
Authenticated historical derivative: resilient active-image resolution for relight previews.
*/
(function(){
  "use strict";
  function resolve(options={}){
    if(options.image instanceof HTMLImageElement)return options.image;
    const activeSelector=options.activeSelector||'[data-aster-image-carousel] [aria-current="true"] img, [data-aster-image-carousel] .current img';
    return document.querySelector(activeSelector)||document.querySelector(options.primarySelector||'[data-aster-relight-image]')||document.querySelector('img[data-aster-active-image]')||null;
  }
  function source(options={}){const image=resolve(options);return image?String(image.dataset?.originalSrc||image.currentSrc||image.src||''):'';}
  window.resolveAsterActiveImage=resolve; window.getAsterActiveImageSource=source;
})();
