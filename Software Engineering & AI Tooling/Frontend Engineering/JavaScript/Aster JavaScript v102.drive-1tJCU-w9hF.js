/* Aster JavaScript v102
Authenticated historical derivative: relight tile previews use the active image even when template images are hidden.
*/
(function(){
  "use strict";
  function update(options={}){
    const grid=options.grid||document.querySelector(options.gridSelector||'[data-aster-relight-moods]');
    const image=options.image||document.querySelector(options.imageSelector||'[data-aster-relight-image]');
    if(!grid||!image)return;
    const src=String(image.dataset?.originalSrc||image.currentSrc||image.src||'');
    grid.querySelectorAll('[data-mood]').forEach(tile=>{
      const box=tile.querySelector('[data-aster-mood-preview]')||tile;
      const templateImage=box.querySelector('img:not([data-aster-keep])'); if(templateImage){templateImage.style.opacity='0';templateImage.style.pointerEvents='none';}
      let layer=box.querySelector('[data-aster-preview-image-layer]'); if(!layer){layer=document.createElement('span');layer.setAttribute('data-aster-preview-image-layer','');box.prepend(layer);}
      if(src)layer.style.backgroundImage=`url("${src.replace(/"/g,'\\"')}")`;
      if(typeof options.decorate==='function')options.decorate(tile,layer,tile.getAttribute('data-mood')||'');
    });
  }
  window.updateAsterRelightTilePreviews=update;
})();
