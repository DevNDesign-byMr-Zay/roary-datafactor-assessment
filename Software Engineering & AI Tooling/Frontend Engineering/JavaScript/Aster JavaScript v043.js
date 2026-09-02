/* Aster JavaScript v043
Authenticated historical derivative: binary erase-mask export hardening.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  function pickSourceCanvas(){
    return document.getElementById("asterEraseMaskCanvas2") ||
      document.getElementById("rtEraseMaskCanvas2") ||
      document.getElementById("rtEraseCanvas2") ||
      document.getElementById("rtEraseMaskCanvas") ||
      document.querySelector("canvas[data-remove-mask]") ||
      null;
  }

  function canvasHasAnyPaint(canvas){
    try{
      if(!canvas || !canvas.width || !canvas.height) return false;
      const context = canvas.getContext("2d", {willReadFrequently:true});
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for(let i = 3; i < data.length; i += 4){
        if(data[i] > 20) return true;
      }
    }catch(_){}
    return false;
  }

  function toBinaryMaskDataURL(sourceCanvas){
    if(!sourceCanvas || !sourceCanvas.width || !sourceCanvas.height) return "";

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {willReadFrequently:true});
    context.clearRect(0, 0, width, height);

    try{
      context.drawImage(sourceCanvas, 0, 0, width, height);
    }catch(_){}

    let imageData;
    try{
      imageData = context.getImageData(0, 0, width, height);
    }catch(_){
      try{
        return sourceCanvas.toDataURL("image/png");
      }catch(__){
        return "";
      }
    }

    const pixels = imageData.data;
    let any = false;

    for(let i = 0; i < pixels.length; i += 4){
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      const selected = a > 20 && ((r + g + b) > 10 || a > 80);

      if(selected){
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
        any = true;
      }else{
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 255;
      }
    }

    if(!any) return "";

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function applyPatch(){
    const source = pickSourceCanvas();
    if(!source) return;

    const api = window.__asterErase || (window.__asterErase = {});
    const previousGet = typeof api.getMaskDataURL === "function"
      ? api.getMaskDataURL.bind(api)
      : null;
    const previousHas = typeof api.hasMask === "function"
      ? api.hasMask.bind(api)
      : null;

    api.getMaskDataURL = function(){
      const current = pickSourceCanvas();
      const selected = current && canvasHasAnyPaint(current)
        ? current
        : source;

      const binary = toBinaryMaskDataURL(selected);
      if(binary) return binary;

      try{
        const fallback = previousGet ? previousGet() : "";
        return /^data:image\//i.test(String(fallback || "")) ? fallback : "";
      }catch(_){
        return "";
      }
    };

    api.hasMask = function(){
      const current = pickSourceCanvas();
      if(canvasHasAnyPaint(current)) return true;
      try{
        return previousHas ? !!previousHas() : false;
      }catch(_){
        return false;
      }
    };

    api.binaryMaskExport = true;
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", applyPatch, {once:true});
  }else{
    applyPatch();
  }

  document.addEventListener("click", function(event){
    try{
      const target = event?.target;
      if(!target?.closest) return;
      if(target.closest(
        '[data-tool="remove"],[data-tool="erase"],#rtSidePanel[data-tool="remove"],#rtSidePanel[data-tool="erase"]'
      )){
        setTimeout(applyPatch, 80);
      }
    }catch(_){}
  }, true);
})();
