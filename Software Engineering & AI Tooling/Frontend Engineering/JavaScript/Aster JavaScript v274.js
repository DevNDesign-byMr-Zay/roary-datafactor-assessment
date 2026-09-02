/* Aster JavaScript v274 — authenticated buyer-safe derivative: bounded Blob-to-JPEG data-URL conversion. Host state/dependencies are intentionally external. */
async function blobToJpegDataURL(blob, maxW, quality){
    maxW = clamp(maxW||1400, 512, 2048);
    quality = clamp(quality||0.92, 0.7, 0.98);
    // decode
    const bmp = await createImageBitmap(blob).catch(async ()=>{
      // fallback path
      return await new Promise((resolve,reject)=>{
        const img = new Image();
        img.onload=()=>resolve(img);
        img.onerror=reject;
        img.src = URL.createObjectURL(blob);
      });
    });
    const w = (bmp.width||bmp.naturalWidth||0) || 0;
    const h = (bmp.height||bmp.naturalHeight||0) || 0;
    if(!w || !h) throw new Error('bad image');
    const scale = Math.min(1, maxW / w);
    const cw = Math.max(2, Math.round(w*scale));
    const ch = Math.max(2, Math.round(h*scale));
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const ctx = c.getContext('2d', {alpha:false});
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, cw, ch);
    try{ if(bmp.close) bmp.close(); }catch(e){}
    // toDataURL (jpeg)
    return c.toDataURL('image/jpeg', quality);
  }
