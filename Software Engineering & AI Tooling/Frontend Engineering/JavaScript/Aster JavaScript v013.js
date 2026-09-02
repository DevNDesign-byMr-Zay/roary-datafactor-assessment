/* ASTER Erase: binary mask export (white=remove, black=keep) + abort-signal resilience.
   Does NOT touch memory/localStorage. */
(function () {
  function byId(id){ try { return document.getElementById(id) || null; } catch(_) { return null; } }
  function pickSourceCanvas(){
    // Prefer mask canvases, then visible paint canvas as fallback
    return (
      byId("rtEraseMaskCanvas2") ||
      byId("rtEraseMaskCanvas")  ||
      byId("rtEraseMaskCanvas_legacy") ||
      byId("rtEraseCanvas2") ||
      byId("rtEraseCanvas") ||
      null
    );
  }

  function canvasHasAnyPaint(c){
    if(!c || !c.width || !c.height) return false;
    try{
      const ctx = c.getContext("2d", { willReadFrequently: true });
      const data = ctx.getImageData(0,0,c.width,c.height).data;
      for(let i=0;i<data.length;i+=4){
        const a = data[i+3];
        if(a>0 && (data[i]||data[i+1]||data[i+2]||a>16)) return true;
      }
    }catch(_){}
    return false;
  }

  function toBinaryMaskDataURL(srcCanvas){
    if(!srcCanvas || !srcCanvas.width || !srcCanvas.height) return "";
    const w = srcCanvas.width, h = srcCanvas.height;
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const ctx = tmp.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0,0,w,h);
    try{ ctx.drawImage(srcCanvas, 0,0,w,h); }catch(_){}

    let img;
    try{ img = ctx.getImageData(0,0,w,h); }catch(_){
      try { return srcCanvas.toDataURL("image/png"); } catch(_) { return ""; }
    }
    const d = img.data;
    let any = false;
    for(let i=0;i<d.length;i+=4){
      const r=d[i], g=d[i+1], b=d[i+2], a=d[i+3];
      // Most painters draw with alpha. Treat any visible pixel as "selected".
      const on = (a>20) && ((r+g+b)>10 || a>80);
      if(on){
        d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=255; any=true;
      } else {
        d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=255;
      }
    }
    if(!any) return "";
    ctx.putImageData(img,0,0);
    return tmp.toDataURL("image/png");
  }

  function patch(){
    const src = pickSourceCanvas();
    if(!src) return;
    const api = window.__asterErase || (window.__asterErase = {});
    const prevGet = (typeof api.getMaskDataURL === "function") ? api.getMaskDataURL.bind(api) : null;
    const prevHas = (typeof api.hasMask === "function") ? api.hasMask.bind(api) : null;

    api.getMaskDataURL = function(){
      // Use the most relevant canvas at call time (DOM may rebuild)
      const c = pickSourceCanvas();
      const use = (c && canvasHasAnyPaint(c)) ? c : src;
      const url = toBinaryMaskDataURL(use);
      if(url) return url;

      // Fallback to previous (if any)
      try{
        const u = prevGet ? prevGet() : "";
        return (u && /^data:image\//i.test(u)) ? u : "";
      }catch(_){ return ""; }
    };

    api.hasMask = function(){
      const c = pickSourceCanvas();
      if(canvasHasAnyPaint(c)) return true;
      try{ return prevHas ? !!prevHas() : false; }catch(_){ return false; }
    };

    api.__binaryMaskPatchV1 = true;
    window.__asterErase = api;

    try{
      if(!window.__asterEraseMaskPatchLogged){
        window.__asterEraseMaskPatchLogged = true;
        console.info("[ASTER][ErasePatch] Binary mask export active (white=remove).");
      }
    }catch(_){}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patch, { once: true });
  } else {
    patch();
  }

  // Re-apply after lightbox/tool panel rebuilds
  document.addEventListener("click", function(e){
    try{
      const t = e && e.target;
      if(!t || !t.closest) return;
      if(t.closest('[data-tool="remove"],[data-tool="erase"],#rtSidePanel[data-tool="remove"],#rtSidePanel[data-tool="erase"]')){
        setTimeout(patch, 80);
      }
    }catch(_){}
  }, true);

})();
