/* Aster JavaScript v149
Authenticated historical derivative: strict binary eraser-mask exporter.
Canvas readback is limited to the local user-drawn mask canvas; no remote image is drawn or sampled.
*/
(function(global){
  'use strict';
  function hasPaint(canvas){
    if(!(canvas instanceof HTMLCanvasElement)||!canvas.width||!canvas.height)return false;
    try{const d=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>20)return true;}catch(_){return false;}return false;
  }
  function toBinaryDataURL(canvas){
    if(!(canvas instanceof HTMLCanvasElement)||!canvas.width||!canvas.height)return'';
    const tmp=document.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;
    const ctx=tmp.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,tmp.width,tmp.height);ctx.drawImage(canvas,0,0);
    let img;try{img=ctx.getImageData(0,0,tmp.width,tmp.height);}catch(_){return'';}
    let any=false;const d=img.data;
    for(let i=0;i<d.length;i+=4){const on=d[i+3]>20;if(on){d[i]=d[i+1]=d[i+2]=d[i+3]=255;any=true;}else{d[i]=d[i+1]=d[i+2]=0;d[i+3]=255;}}
    if(!any)return'';ctx.putImageData(img,0,0);return tmp.toDataURL('image/png');
  }
  function install(api,resolveCanvas){
    if(!api||typeof resolveCanvas!=='function')return api;
    const previousGet=typeof api.getMaskDataURL==='function'?api.getMaskDataURL.bind(api):null;
    const previousHas=typeof api.hasMask==='function'?api.hasMask.bind(api):null;
    api.getMaskDataURL=()=>{const c=resolveCanvas();const out=hasPaint(c)?toBinaryDataURL(c):'';if(out)return out;try{return previousGet?.()||'';}catch(_){return'';}};
    api.hasMask=()=>{const c=resolveCanvas();if(hasPaint(c))return true;try{return!!previousHas?.();}catch(_){return false;}};
    return api;
  }
  global.AsterBinaryEraseMask={hasPaint,toBinaryDataURL,install};
})(window);
