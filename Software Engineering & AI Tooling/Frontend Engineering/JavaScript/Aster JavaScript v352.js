function stampDot(x,y,isErase){
    const s = brushSize();
    const f = feather();
    maskCtx.save();
    maskCtx.globalCompositeOperation = isErase ? "destination-out" : "source-over";
    maskCtx.fillStyle = "rgba(255,255,255,1)";
    if(f>0 && !isErase){
      maskCtx.shadowColor = "rgba(255,255,255,1)";
      maskCtx.shadowBlur = Math.min(80, f*2.2);
    }else{
      maskCtx.shadowBlur = 0;
    }
    maskCtx.beginPath();
    maskCtx.arc(x,y,s/2,0,Math.PI*2);
    maskCtx.fill();
    maskCtx.restore();
  }
