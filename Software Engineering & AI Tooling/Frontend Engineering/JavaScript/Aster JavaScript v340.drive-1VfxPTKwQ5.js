function maskToBlob(){
    // Build a proper black/white mask the same size as the *natural* image.
    const it = state.media.find(x=>x.id===state.selectedMediaId);
    if(!it || !it.blob) return null;
    const img = modalImg;
    const nw = img.naturalWidth || 0;
    const nh = img.naturalHeight || 0;
    if(!nw || !nh) return null;

    // Render current maskPreview to offscreen at natural size
    const off = document.createElement("canvas");
    off.width = nw; off.height = nh;
    const ctx = off.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    // Fill background black
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,nw,nh);

    // draw scaled white mask from preview
    const r = maskCanvas.getBoundingClientRect();
    // If preview size is 0, fail
    if(!r.width || !r.height) return null;

    // Export preview alpha as white on black
    // (maskPreview already has white paint on transparent)
    ctx.drawImage(maskCanvas, 0, 0, r.width, r.height, 0, 0, nw, nh);

    if(invertMask){
      const imgd = ctx.getImageData(0,0,nw,nh);
      const d=imgd.data;
      for(let i=0;i<d.length;i+=4){
        // invert luminance based on red channel
        const v = d[i];
        const inv = 255 - v;
        d[i]=d[i+1]=d[i+2]=inv;
        d[i+3]=255;
      }
      ctx.putImageData(imgd,0,0);
    }

    return new Promise(res=> off.toBlob(b=>res(b), "image/png"));
  }
