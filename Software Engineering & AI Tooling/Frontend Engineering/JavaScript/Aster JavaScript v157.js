/* Aster JavaScript v157
Authenticated historical derivative: resilient image export/download pipeline.
Server-side conversion is preferred when available; browser canvas conversion and original-blob save are fallbacks.
Image Orb remains locked to the configured 5151 tool backend.
*/
(function(global){
  "use strict";
  if(global.AsterImageExport) return;

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,Number(value)));
  }

  function normalizeSettings(input={}){
    const format = ["png","jpg","webp"].includes(String(input.format||"").toLowerCase())
      ? String(input.format).toLowerCase()
      : "png";
    let scale = Number.parseInt(input.scale ?? 100,10);
    if([1,2,3,4].includes(scale)) scale *= 100;
    if(![100,200,300,400].includes(scale)) scale = 100;

    return {
      format,
      scale,
      quality:clamp(Number.parseInt(input.quality ?? 95,10),40,100),
      transparent:!!input.transparent,
      compress:!!input.compress
    };
  }

  function effectiveQuality(settings){
    let quality = clamp(Number.parseInt(settings.quality ?? 95,10),40,100);
    if(settings.compress) quality = Math.min(quality,85);
    return quality;
  }

  function filenameFromDisposition(value){
    try{
      const match=/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(String(value||""));
      const raw=match ? (match[1]||match[2]||"").trim() : "";
      return raw ? decodeURIComponent(raw) : "";
    }catch(_){
      return "";
    }
  }

  async function blobDownload(blob,name){
    if(!blob) throw new Error("No export blob");
    const url=URL.createObjectURL(blob);
    try{
      const anchor=document.createElement("a");
      anchor.href=url;
      anchor.download=name || "image-export";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }finally{
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }
  }

  async function serverConvert(src,settings,options={}){
    const base=String(options.toolBase||"http://127.0.0.1:5151").replace(/\/+$/,"");
    if(!/:5151$/i.test(base)) throw new Error("Image tool backend must use port 5151");

    const response=await fetch(`${base}/tool/download_convert`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials:"omit",
      body:JSON.stringify({
        src,
        format:settings.format,
        scale:settings.scale,
        quality:effectiveQuality(settings),
        transparent:settings.transparent,
        compress:settings.compress,
        filename:"image-export"
      }),
      signal:options.signal
    });

    if(!response.ok) throw new Error(`download_convert failed: ${response.status}`);
    const blob=await response.blob();
    const filename=
      filenameFromDisposition(response.headers.get("content-disposition")) ||
      `image-export.${settings.format}`;
    await blobDownload(blob,filename);
    return {mode:"server",filename};
  }

  async function fetchBlob(url,signal){
    const response=await fetch(url,{
      mode:"cors",
      credentials:"omit",
      cache:"no-store",
      signal
    });
    if(!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
    return response.blob();
  }

  function blobToDataUrl(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||""));
      reader.onerror=()=>reject(reader.error||new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
  }

  function imageFromUrl(url){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.crossOrigin="anonymous";
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error("Image decode failed"));
      image.src=url;
    });
  }

  async function browserConvert(src,settings,options={}){
    const blob=await fetchBlob(src,options.signal);
    const dataUrl=await blobToDataUrl(blob);
    const image=await imageFromUrl(dataUrl);

    const scale=settings.scale/100;
    const width=Math.max(1,Math.round((image.naturalWidth||image.width)*scale));
    const height=Math.max(1,Math.round((image.naturalHeight||image.height)*scale));
    const canvas=document.createElement("canvas");
    canvas.width=width;
    canvas.height=height;

    const context=canvas.getContext("2d");
    const opaque=settings.format!=="png" || !settings.transparent;
    if(opaque){
      context.fillStyle="#ffffff";
      context.fillRect(0,0,width,height);
    }else{
      context.clearRect(0,0,width,height);
    }
    context.drawImage(image,0,0,width,height);

    const mime=settings.format==="webp"
      ? "image/webp"
      : settings.format==="jpg"
        ? "image/jpeg"
        : "image/png";

    const output=await new Promise(resolve=>{
      canvas.toBlob(
        resolve,
        mime,
        mime==="image/png" ? undefined : effectiveQuality(settings)/100
      );
    });
    if(!output) throw new Error("Canvas export failed");

    const filename=`image-export-${width}x${height}.${settings.format}`;
    await blobDownload(output,filename);
    return {mode:"browser",filename,width,height};
  }

  async function download(src,inputSettings={},options={}){
    const settings=normalizeSettings(inputSettings);

    if(options.serverAvailable !== false){
      try{
        return await serverConvert(src,settings,options);
      }catch(_){}
    }

    try{
      return await browserConvert(src,settings,options);
    }catch(_){}

    try{
      const original=await fetchBlob(src,options.signal);
      await blobDownload(original,"image-export-original");
      return {mode:"original"};
    }catch(_){}

    if(options.openOnFailure !== false){
      try{ window.open(src,"_blank","noopener,noreferrer"); }catch(_){}
    }
    return {mode:"failed"};
  }

  global.AsterImageExport = {
    normalizeSettings,
    effectiveQuality,
    filenameFromDisposition,
    blobDownload,
    serverConvert,
    browserConvert,
    download
  };
})(window);
