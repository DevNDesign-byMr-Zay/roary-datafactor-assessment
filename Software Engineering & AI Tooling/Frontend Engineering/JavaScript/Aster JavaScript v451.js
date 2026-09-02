function resize(){
    if(!canvas) return;
    const sh=shell(), im=img();
    if(!sh || !im) return;
    const shR=sh.getBoundingClientRect();
    const imR=im.getBoundingClientRect();

    const left=Math.round(imR.left-shR.left);
    const top=Math.round(imR.top-shR.top);
    const w=Math.max(1,Math.round(imR.width));
    const h=Math.max(1,Math.round(imR.height));

    canvas.style.left=left+"px";
    canvas.style.top=top+"px";
    if(canvas.width!==w || canvas.height!==h){
      canvas.width=w; canvas.height=h;
      maskCanvas.width=w; maskCanvas.height=h;
      clear();
    }
  }
