async function buildBinaryMaskBlobV8(){
    const imgEl = getModalImageEl();
    const pr = getPaintedRect(imgEl);
    if(!imgEl || !pr) return null;

    // Prefer the real mask canvas from the erase tool if available.
    let dataUrl = null;
    try{
      if(window.__asterErase && typeof window.__asterErase.getMaskDataURL === "function"){
        dataUrl = window.__asterErase.getMaskDataURL();
      }
    }catch(e){}

    if(!dataUrl){
      const c = document.getElementById("rtEraseCanvas");
      if(!c) return null;
      try{ dataUrl = c.toDataURL("image/png"); }catch(e){ return null; }
    }

    let maskImg;
    try{ maskImg = await loadImage(dataUrl); }catch(e){ return null; }

    const srcC = document.createElement("canvas");
    srcC.width = maskImg.naturalWidth || maskImg.width;
    srcC.height = maskImg.naturalHeight || maskImg.height;
    const sctx = srcC.getContext("2d");
    sctx.drawImage(maskImg, 0, 0);

    // Crop letterbox area so mask lines up with the actual bitmap.
    const sx = srcC.width / pr.w;
    const sy = srcC.height / pr.h;
    const cropX = Math.max(0, Math.round(pr.ox * sx));
    const cropY = Math.max(0, Math.round(pr.oy * sy));
    const cropW = Math.max(1, Math.round(pr.bw * sx));
    const cropH = Math.max(1, Math.round(pr.bh * sy));

    const cropC = document.createElement("canvas");
    cropC.width = cropW;
    cropC.height = cropH;
    const cctx = cropC.getContext("2d");
    cctx.drawImage(srcC, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Scale to natural size
    const outC = document.createElement("canvas");
    outC.width = pr.natW;
    outC.height = pr.natH;
    const octx = outC.getContext("2d");
    octx.imageSmoothingEnabled = true;
    octx.drawImage(cropC, 0, 0, outC.width, outC.height);

    // Optional dilation (makes removal more aggressive so entire objects vanish)
    const grow = 2;
    let workC = outC;
    if(grow > 0){
      const dil = document.createElement("canvas");
      dil.width = outC.width;
      dil.height = outC.height;
      const dctx = dil.getContext("2d");
      dctx.filter = `blur(${grow}px)`;
      dctx.drawImage(outC, 0, 0);
      workC = dil;
    }

    // Threshold to strict black/white mask with opaque alpha.
    const wctx = workC.getContext("2d");
    const imgData = wctx.getImageData(0, 0, workC.width, workC.height);
    const d = imgData.data;
    for(let i=0;i<d.length;i+=4){
      const a = d[i+3];
      const v = (d[i] + d[i+1] + d[i+2]) / 3;
      const on = (a > 8) && (v > 8);
      if(on){
        d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=255;
      }else{
        d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=255;
      }
    }
    wctx.putImageData(imgData, 0, 0);

    return await new Promise(resolve=> workC.toBlob(b=>resolve(b), "image/png"));
  }
