function stampLine(a,b, isErase){
    const s = brushSize();
    const dist = Math.hypot(b.x-a.x, b.y-a.y);
    const step = Math.max(2, s*0.18);
    const n = Math.max(1, Math.ceil(dist/step));
    for(let i=0;i<=n;i++){
      const t = n===1 ? 1 : (i/n);
      const x = a.x + (b.x-a.x)*t;
      const y = a.y + (b.y-a.y)*t;
      stampDot(x,y,isErase);
    }
  }
