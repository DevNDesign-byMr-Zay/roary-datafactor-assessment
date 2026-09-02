function clear(){
    if(!canvas || !maskCanvas) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    maskCtx.globalCompositeOperation="source-over";
    maskCtx.fillStyle="black";
    maskCtx.fillRect(0,0,maskCanvas.width,maskCanvas.height);
  }
