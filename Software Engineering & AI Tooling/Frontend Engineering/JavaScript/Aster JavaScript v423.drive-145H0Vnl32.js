function nameColor([r,g,b]){
  const s = Math.max(r,g,b)-Math.min(r,g,b);
  const L = luma([r,g,b]);
  const sat = s/255;
  if (sat < 0.08) {
    if (L > 235) return "white";
    if (L > 200) return "silver";
    if (L > 160)  return "light steel";
    if (L > 110)  return "brushed steel";
    if (L > 70)  return "graphite";
    if (L > 35)  return "gunmetal";
    return "charcoal";
  }
  const hue = (()=>{ const [R,G,B]=[r/255,g/255,b/255];
    const mx=Math.max(R,G,B), mn=Math.min(R,G,B), d=mx-mn; if(!d) return 0;
    let h = mx===R ? ((G-B)/d)%6 : (mx===G ? ((B-R)/d)+2 : ((R-G)/d)+4); h*=60; if(h<0)h+=360; return h;})();
  if (hue<18||hue>=345) return "red";
  if (hue<45)  return "orange";
  if (hue<70)  return "gold";
  if (hue<160) return "green";
  if (hue<255) return "blue";
  if (hue<290) return "violet";
  return "magenta";
}
