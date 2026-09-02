/* Aster JavaScript v206 — authenticated buyer-safe derivative: natural-resolution binary mask export to Blob. Host state/dependencies are intentionally external. */
async function maskToBlob(){
    const it = state.media.find(x=>x.id===state.selectedMediaId);
    if(!it || !it.blob) return null;

    const nw = modalImg.naturalWidth || 0;
    const nh = modalImg.naturalHeight || 0;
    if(!nw || !nh) return null;

    const off = document.createElement("canvas");
    off.width = nw; off.height = nh;
    const ctx = off.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,nw,nh);

    const r = maskCanvas.getBoundingClientRect();
    if(!r.width || !r.height) return null;

    ctx.drawImage(maskCanvas, 0,0,r.width,r.height, 0,0,nw,nh);

    if(invertMask){
      const imgd = ctx.getImageData(0,0,nw,nh);
      const d=imgd.data;
      for(let i=0;i<d.length;i+=4){
        const inv = 255 - d[i];
        d[i]=d[i+1]=d[i+2]=inv; d[i+3]=255;
      }
      ctx.putImageData(imgd,0,0);
    }else{
      const imgd = ctx.getImageData(0,0,nw,nh);
      const d=imgd.data;
      for(let i=0;i<d.length;i+=4) d[i+3]=255;
      ctx.putImageData(imgd,0,0);
    }

    return await new Promise(res=> off.toBlob(b=>res(b), "image/png"));
  }
