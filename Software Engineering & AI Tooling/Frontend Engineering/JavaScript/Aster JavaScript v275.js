/* Aster JavaScript v275 — authenticated buyer-safe derivative: active-image data-URL normalization. Host state/dependencies are intentionally external. */
async function ensureActiveImgDataURL(){
    const img = (typeof getModalImageEl==='function' ? getModalImageEl() : null) || document.getElementById('imageModalImg');
    if(!img) return null;
    const src = String(img.currentSrc || img.src || '').trim();
    if(!src) return null;
    if(/^data:image\//i.test(src) || /^https?:\/\//i.test(src)) return src;

    // blob:/file:/about: etc. -> fetch to blob -> dataURL
    try{
      const res = await fetch(src);
      const blob = await res.blob();
      if(!blob || !blob.size) return null;
      const data = await blobToJpegDataURL(blob, 1400, 0.92);
      return data;
    }catch(e){
      // last resort: try canvas snapshot from the existing element
      try{
        const w = img.naturalWidth || img.width || 0;
        const h = img.naturalHeight || img.height || 0;
        if(w>0 && h>0){
          const maxW = 1400;
          const scale = Math.min(1, maxW / w);
          const cw = Math.max(2, Math.round(w*scale));
          const ch = Math.max(2, Math.round(h*scale));
          const c = document.createElement('canvas');
          c.width=cw; c.height=ch;
          const ctx=c.getContext('2d',{alpha:false});
          ctx.imageSmoothingEnabled=true;
          ctx.imageSmoothingQuality='high';
          ctx.drawImage(img,0,0,cw,ch);
          return c.toDataURL('image/jpeg', 0.92);
        }
      }catch(e2){}
      return null;
    }
  }
