function ensure(){
    const sh=shell();
    if(!sh) return null;
    if(!canvas){
      canvas=document.createElement("canvas");
      canvas.id="rtEraseCanvas2";
      sh.appendChild(canvas);
      ctx=canvas.getContext("2d",{willReadFrequently:true});
      ctx.imageSmoothingEnabled=true;

      maskCanvas=document.createElement("canvas");
      maskCanvas.id="rtEraseMaskCanvas2";
      maskCanvas.style.display="none";
      sh.appendChild(maskCanvas);
      maskCtx=maskCanvas.getContext("2d",{willReadFrequently:true});
      maskCtx.imageSmoothingEnabled=false;
      clear();

      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up, {passive:true});
      window.addEventListener("pointercancel", up, {passive:true});
      window.addEventListener("resize", resize, {passive:true});
    }
    resize();
    return canvas;
  }
