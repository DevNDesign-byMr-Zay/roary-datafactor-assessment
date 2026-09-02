function clearMask(){
    const w = maskCanvas.getBoundingClientRect().width;
    const h = maskCanvas.getBoundingClientRect().height;
    maskCtx.clearRect(0,0,w,h);
    invertMask=false;
    $("#runMeta").textContent = "Model: fal-ai/object-removal/mask (backend)";
  }
