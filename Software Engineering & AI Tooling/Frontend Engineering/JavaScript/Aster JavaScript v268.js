/* Aster JavaScript v268 — authenticated buyer-safe derivative: relight intensity preview synchronization. Host state/dependencies are intentionally external. */
function updateRelightTilePreviews(level){
    try{
      ensureRelightMoodTileStyle();
      const grid=document.getElementById('asterRelightMoodGrid');
      if(!grid) return;
      const img=(typeof getActiveImg==='function'?getActiveImg():null) || document.getElementById('imageModalImg');
      const src=(img && (img.dataset?.origSrc || img.currentSrc || img.src)) || '';
      const tiles=Array.from(grid.querySelectorAll('[data-mood]'));
      if(!tiles.length) return;
      const i=clamp(parseFloat(level)||3,1,6);
      tiles.forEach(tile=>{
        const mood=(tile.getAttribute('data-mood')||tile.dataset?.mood||'Cinematic').trim()||'Cinematic';
        const box=(tile.querySelector && (tile.querySelector('.rtp-mood-preview') || tile.querySelector('.relight-mood-thumb') || tile.querySelector('.rtp-mood-thumb'))) || tile;
        if(!box) return;
        box.classList.add('rt-relight-thumb');
        try{
          const exImg = box.querySelector && box.querySelector('img');
          if(exImg && !exImg.classList.contains('rt-relight-keep')){
            exImg.style.opacity='0';
            exImg.style.pointerEvents='none';
          }
        }catch(e){}
        let imgL=box.querySelector('.rt-relight-thumb-img');
        if(!imgL){ imgL=document.createElement('div'); imgL.className='rt-relight-thumb-img'; box.prepend(imgL); }
        let fx=box.querySelector('.rt-relight-thumb-fx');
        if(!fx){ fx=document.createElement('div'); fx.className='rt-relight-thumb-fx'; box.prepend(fx); }
        if(src) imgL.style.backgroundImage = `url(${src})`;
        const p=presetFor(mood);
        imgL.style.filter = p.filter(i);
        fx.style.background = p.overlay(i);
        fx.style.opacity = String(clamp(p.op(i),0,0.85));
      });
    }catch(e){}
  }
