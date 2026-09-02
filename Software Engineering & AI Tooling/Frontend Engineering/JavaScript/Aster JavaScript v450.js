function stamp(p){
    const s=Math.max(1,Number(brushSize)||1);
    ctx.fillStyle=PURPLE;
    maskCtx.fillStyle="white";

    if(brushShape==="square"){
      ctx.fillRect(p.x-s/2,p.y-s/2,s,s);
      maskCtx.fillRect(p.x-s/2,p.y-s/2,s,s);
      return;
    }
    if(brushShape==="tri"){
      ctx.beginPath();
      ctx.moveTo(p.x, p.y-s/2);
      ctx.lineTo(p.x-s/2, p.y+s/2);
      ctx.lineTo(p.x+s/2, p.y+s/2);
      ctx.closePath(); ctx.fill();

      maskCtx.beginPath();
      maskCtx.moveTo(p.x, p.y-s/2);
      maskCtx.lineTo(p.x-s/2, p.y+s/2);
      maskCtx.lineTo(p.x+s/2, p.y+s/2);
      maskCtx.closePath(); maskCtx.fill();
      return;
    }
    // circle
    ctx.beginPath(); ctx.arc(p.x,p.y,s/2,0,Math.PI*2); ctx.fill();
    maskCtx.beginPath(); maskCtx.arc(p.x,p.y,s/2,0,Math.PI*2); maskCtx.fill();
  }
