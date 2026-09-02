/* Aster JavaScript v104
Authenticated historical derivative: normalize blob-like active images to a bounded JPEG data URL before JSON relight execution.
Unsafe cross-origin canvas readback is excluded; conversion operates on fetched Blob data.
*/
(function(){
  "use strict";
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
  async function blobToJpeg(blob,options={}){
    if(!(blob instanceof Blob)||!blob.size)throw new Error('A non-empty Blob is required');
    const bitmap=await createImageBitmap(blob); const w=bitmap.width||0,h=bitmap.height||0; if(!w||!h){bitmap.close?.();throw new Error('Invalid image dimensions');}
    const maxWidth=clamp(options.maxWidth||1400,512,2048), quality=clamp(options.quality||.92,.7,.98), scale=Math.min(1,maxWidth/w);
    const canvas=document.createElement('canvas');canvas.width=Math.max(2,Math.round(w*scale));canvas.height=Math.max(2,Math.round(h*scale));
    const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
    return canvas.toDataURL('image/jpeg',quality);
  }
  async function normalize(source,options={}){
    const src=String(source||'').trim(); if(!src)return ''; if(/^data:image\//i.test(src)||/^https?:\/\//i.test(src))return src;
    const response=await fetch(src,{mode:'cors',credentials:'omit',cache:'no-store'}); if(!response.ok)throw new Error(`Image fetch failed (${response.status})`);
    return blobToJpeg(await response.blob(),options);
  }
  window.normalizeAsterRelightImage=normalize; window.asterBlobToJpegDataUrl=blobToJpeg;
})();
