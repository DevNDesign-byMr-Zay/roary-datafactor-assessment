/* Aster JavaScript v172
Authenticated historical derivative: temporary Data-URL compatibility wrapper for JSON-only image executors.
Converts blob/file-backed active images locally, swaps only for the wrapped call, and restores the original source in finally.
*/
(function(global){
  "use strict";
  if(global.AsterTemporaryImageSourceSwap) return;

  function blobToDataUrl(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||""));
      reader.onerror=()=>reject(reader.error||new Error("File read failed"));
      reader.readAsDataURL(blob);
    });
  }

  async function normalizeSource(src,options={}){
    const value=String(src||"").trim();
    if(!value) return "";
    if(/^data:image\//i.test(value)) return value;

    if(/^blob:/i.test(value)){
      try{
        const response=await fetch(value,{method:"GET",cache:"no-store",signal:options.signal});
        if(response.ok) return await blobToDataUrl(await response.blob());
      }catch(_){}
    }

    if(options.allowCanvas===true && options.image instanceof HTMLImageElement){
      try{
        const image=options.image;
        if(image.complete && image.naturalWidth>0){
          const max=Math.max(256,Number(options.maxDimension)||1600);
          const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
          const width=Math.max(1,Math.round(image.naturalWidth*scale));
          const height=Math.max(1,Math.round(image.naturalHeight*scale));
          const canvas=document.createElement("canvas");
          canvas.width=width;
          canvas.height=height;
          const ctx=canvas.getContext("2d",{alpha:false});
          ctx.imageSmoothingEnabled=true;
          ctx.imageSmoothingQuality="high";
          ctx.drawImage(image,0,0,width,height);
          return canvas.toDataURL("image/jpeg",Number(options.quality)||0.92);
        }
      }catch(_){}
    }

    return "";
  }

  function wrap(executor,resolveImage,options={}){
    if(typeof executor!=="function") throw new TypeError("executor required");

    return async function(...args){
      const image=typeof resolveImage==="function" ? resolveImage() : resolveImage;
      if(!(image instanceof HTMLImageElement)){
        return executor.apply(this,args);
      }

      const attrBefore=image.getAttribute("src")||"";
      const currentBefore=image.currentSrc||image.src||attrBefore;
      let swapped=false;

      try{
        const replacement=await normalizeSource(currentBefore,{...options,image});
        if(replacement && /^data:image\//i.test(replacement) && !/^data:image\//i.test(currentBefore)){
          image.setAttribute("src",replacement);
          swapped=true;
        }
        return await executor.apply(this,args);
      }finally{
        if(swapped){
          const restore=currentBefore||attrBefore;
          if(restore) image.setAttribute("src",restore);
        }
      }
    };
  }

  global.AsterTemporaryImageSourceSwap={
    blobToDataUrl,
    normalizeSource,
    wrap
  };
})(window);
