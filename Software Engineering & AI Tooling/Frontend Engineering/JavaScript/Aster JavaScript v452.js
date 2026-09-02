function line(a,b){
    const dx=b.x-a.x, dy=b.y-a.y;
    const dist=Math.hypot(dx,dy);
    const step=Math.max(1,(Number(brushSize)||1)/3);
    const n=Math.max(1,Math.ceil(dist/step));
    for(let i=0;i<=n;i++){
      const t=i/n;
      stamp({x:a.x+dx*t, y:a.y+dy*t});
    }
  }
