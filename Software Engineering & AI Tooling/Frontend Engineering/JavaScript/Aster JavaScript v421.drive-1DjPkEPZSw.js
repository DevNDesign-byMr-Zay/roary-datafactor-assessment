function analyzeGeometry(canvas){
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  const w = canvas.width, h = canvas.height, cx=w>>1, cy=h>>1;
  const center = ctx.getImageData(cx,cy,1,1).data; const Lc=luma(center);
  const corners=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(([x,y])=>luma(ctx.getImageData(x,y,1,1).data));
  const darkCorners = corners.filter(v=>v<35).length;
  const circularBadgeLikely = darkCorners>=3 && (w/h>0.85 && w/h<1.15);
  const g = ctx.getImageData(0,0,w,h).data;
  let bright=0, dark=0, total=0;
  for(let i=0;i<g.length;i+=16){ const L=luma([g[i],g[i+1],g[i+2]]);
    if(L>240) bright++; else if(L<20) dark++; total++;
  }
  const specular = bright/total, shadow=dark/total;
  return {
    aspect: Number((w/h).toFixed(3)),
    circular_badge_likely: circularBadgeLikely,
    metallic_likely: specular>0.008 && shadow>0.35,
    specular_ratio: Number(specular.toFixed(4)),
    shadow_ratio: Number(shadow.toFixed(4)),
    center_luma: Math.round(Lc)
  };
}
