function updateBadge(frame){
    try{
      const img = document.getElementById("imageModalImg");
      const badge = frame.querySelector(`.${BADGE}`);
      if(!img || !badge) return;
      const pads = window.asterComputeExpandFromFrame && window.asterComputeExpandFromFrame();
      if(!pads) { badge.textContent=""; return; }
      const natW = img.naturalWidth||0, natH = img.naturalHeight||0;
      if(!natW||!natH) return;
      const tw = natW + (pads.left||0) + (pads.right||0);
      const th = natH + (pads.top||0) + (pads.bottom||0);
      badge.textContent = `${tw}×${th}`;
    }catch(e){}
  }
