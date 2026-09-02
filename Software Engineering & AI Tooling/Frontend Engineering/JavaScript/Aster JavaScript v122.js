/* Aster JavaScript v122
Authenticated historical derivative: hard binary mask export with bounded dilation from a local painting canvas.
No cross-origin image pixels are read.
*/
(function(global){
  'use strict';
  const blobOf=c=>new Promise(resolve=>c.toBlob(b=>resolve(b),'image/png'));
  async function build(canvas,options={}){
    if(!(canvas instanceof HTMLCanvasElement)||!canvas.width||!canvas.height) return null;
    const w=canvas.width,h=canvas.height, src=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h);
    const threshold=Math.max(0,Math.min(255,Number(options.alphaThreshold)||24));
    const radius=Math.max(0,Math.min(18,Math.round(Number(options.growPx)||2)));
    const on=new Uint8Array(w*h); for(let i=0,p=0;i<src.data.length;i+=4,p++)on[p]=src.data[i+3]>threshold?1:0;
    const dil=new Uint8Array(on); if(radius){for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!on[y*w+x])continue;for(let yy=Math.max(0,y-radius);yy<=Math.min(h-1,y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<=Math.min(w-1,x+radius);xx++)dil[yy*w+xx]=1;}}
    const out=document.createElement('canvas'); out.width=w;out.height=h; const ctx=out.getContext('2d'), data=ctx.createImageData(w,h);
    for(let p=0,i=0;p<dil.length;p++,i+=4){const v=dil[p]?255:0;data.data[i]=255;data.data[i+1]=255;data.data[i+2]=255;data.data[i+3]=v;}
    ctx.putImageData(data,0,0); return blobOf(out);
  }
  global.AsterHardMask={build};
})(window);
