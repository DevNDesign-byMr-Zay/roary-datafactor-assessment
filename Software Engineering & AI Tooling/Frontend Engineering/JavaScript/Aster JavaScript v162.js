/* Aster JavaScript v162
Authenticated historical derivative: content-aware OCR profile selection.
Only caller-supplied canvas pixels are sampled; no network image is fetched or read.
*/
(function(global){
  "use strict";
  if(global.AsterOCRProfileSelector) return;

  function luminance(data,index){
    return .299*data[index] + .587*data[index+1] + .114*data[index+2];
  }

  function edgeDensity(canvas,step=4,threshold=50){
    if(!(canvas instanceof HTMLCanvasElement)) return 1;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    const width=canvas.width, height=canvas.height;
    if(!ctx || width<2 || height<2) return 1;

    const pixels=ctx.getImageData(0,0,width,height).data;
    let edges=0, samples=0;

    for(let y=1;y<height;y+=step){
      for(let x=1;x<width;x+=step){
        const p=4*(y*width+x);
        const left=4*(y*width+x-1);
        const up=4*((y-1)*width+x);
        const score=
          Math.abs(luminance(pixels,p)-luminance(pixels,left)) +
          Math.abs(luminance(pixels,p)-luminance(pixels,up));
        if(score>threshold) edges++;
        samples++;
      }
    }
    return edges/Math.max(1,samples);
  }

  function looksLikeDocument(name,canvas){
    const filename=String(name||"").toLowerCase();
    const ratio=canvas?.height ? canvas.width/canvas.height : 1;
    return ratio<.7 || /\b(receipt|invoice|bill|ticket)\b/.test(filename);
  }

  function choose(canvas,name,options={}){
    const whitelist=String(
      options.whitelist || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-&"
    );

    if(looksLikeDocument(name,canvas)){
      return {oem:"1",psm:"3",whitelist:"",dpiScale:2.25,mode:"document"};
    }

    try{
      const ratio=canvas.width/canvas.height;
      const sparse=edgeDensity(canvas)<.18 && ratio>.7 && ratio<1.3;
      if(sparse){
        return {oem:"1",psm:"8",whitelist,dpiScale:2.5,mode:"sparse"};
      }
    }catch(_){}

    return {oem:"1",psm:"6",whitelist:"",dpiScale:2,mode:"block"};
  }

  global.AsterOCRProfileSelector={
    luminance,
    edgeDensity,
    looksLikeDocument,
    choose
  };
})(window);
