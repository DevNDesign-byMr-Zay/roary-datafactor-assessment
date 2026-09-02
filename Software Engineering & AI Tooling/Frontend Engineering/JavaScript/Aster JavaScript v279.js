/* Aster JavaScript v279 — authenticated buyer-safe derivative: painted-mask ink detection. Host state/dependencies are intentionally external. */
function maskHasInk(maskCanvas){
    try{
      const ctx = maskCanvas.getContext("2d", { willReadFrequently: true });
      const w = maskCanvas.width, h = maskCanvas.height;
      if(!ctx || !w || !h) return false;
      const stepX = Math.max(1, Math.floor(w/56));
      const stepY = Math.max(1, Math.floor(h/56));
      const data = ctx.getImageData(0,0,w,h).data;
      for(let y=0; y<h; y+=stepY){
        for(let x=0; x<w; x+=stepX){
          const i = (y*w + x)*4;
          if(data[i] > 200 && data[i+1] > 200 && data[i+2] > 200) return true;
        }
      }
      return false;
    }catch(e){
      return true;
    }
  }
