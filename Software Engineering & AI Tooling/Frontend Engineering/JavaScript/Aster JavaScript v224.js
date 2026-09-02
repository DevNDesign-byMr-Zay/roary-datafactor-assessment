/* Aster JavaScript v224 — authenticated buyer-safe derivative: distance-adaptive brush stroke interpolation. Host state/dependencies are intentionally external. */
function stampLine(a,b, isErase){
    const s = brushSize();
    const dist = Math.hypot(b.x-a.x, b.y-a.y);
    const step = Math.max(2, s*0.18);
    const n = Math.max(1, Math.ceil(dist/step));
    for(let i=0;i<=n;i++){
      const t = n===1 ? 1 : (i/n);
      stampDot(a.x + (b.x-a.x)*t, a.y + (b.y-a.y)*t, isErase);
    }
  }
