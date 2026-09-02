/* Aster JavaScript v165
Authenticated historical derivative: dominant-color palette extraction from caller-owned canvas pixels.
Product identity, credentials, private prompts, and protected reasoning/visualization architecture removed.
*/
(function(global){
  "use strict";
  if(global.AsterPaletteExtractor) return;

  function rgbToHex(r,g,b){
    return "#"+[r,g,b]
      .map(value=>Math.max(0,Math.min(255,Math.round(Number(value)||0))).toString(16).padStart(2,"0"))
      .join("")
      .toUpperCase();
  }

  function extract(canvas,count=5,options={}){
    if(!(canvas instanceof HTMLCanvasElement)) return [];
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    if(!ctx || canvas.width<1 || canvas.height<1) return [];

    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const stride=Math.max(4,Number(options.stride)||16);
    const alphaFloor=Math.max(0,Math.min(255,Number(options.alphaFloor)||24));
    const bins=new Map();

    for(let i=0;i<data.length;i+=stride){
      const pixel=i-(i%4);
      const alpha=data[pixel+3];
      if(alpha<alphaFloor) continue;

      // Four-bit/channel quantization keeps the histogram compact while preserving
      // enough visual separation for useful dominant-color summaries.
      const qr=data[pixel]>>4;
      const qg=data[pixel+1]>>4;
      const qb=data[pixel+2]>>4;
      const key=(qr<<8)|(qg<<4)|qb;

      let entry=bins.get(key);
      if(!entry){
        entry={count:0,sum:[0,0,0]};
        bins.set(key,entry);
      }

      entry.count++;
      entry.sum[0]+=data[pixel];
      entry.sum[1]+=data[pixel+1];
      entry.sum[2]+=data[pixel+2];
    }

    const ranked=[...bins.values()]
      .map(entry=>({
        rgb:entry.sum.map(value=>Math.round(value/entry.count)),
        count:entry.count
      }))
      .sort((a,b)=>b.count-a.count);

    const total=ranked.reduce((sum,item)=>sum+item.count,0)||1;
    return ranked.slice(0,Math.max(1,Number(count)||5)).map(item=>({
      rgb:item.rgb,
      hex:rgbToHex(...item.rgb),
      percent:Math.round(100*item.count/total)
    }));
  }

  global.AsterPaletteExtractor={rgbToHex,extract};
})(window);
