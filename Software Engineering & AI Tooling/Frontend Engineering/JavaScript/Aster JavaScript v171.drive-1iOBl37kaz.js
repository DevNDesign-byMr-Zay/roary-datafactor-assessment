/* Aster JavaScript v171
Authenticated historical derivative: image source normalization to Blob.
Supports data URLs, blob URLs, and CORS-readable HTTP(S) sources.
*/
(function(global){
  "use strict";
  if(global.AsterImageSourceBlob) return;

  function dataUrlToBlob(src){
    const value=String(src||"").trim();
    if(!/^data:/i.test(value)) return null;
    const parts=value.split(",",2);
    const header=parts[0]||"";
    const body=parts[1]||"";
    const mime=(header.match(/^data:([^;,]+)/i)||[])[1]||"application/octet-stream";

    try{
      if(/;base64/i.test(header)){
        const binary=atob(body);
        const bytes=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
        return new Blob([bytes],{type:mime});
      }
      return new Blob([decodeURIComponent(body)],{type:mime});
    }catch(_){
      return null;
    }
  }

  async function toBlob(src,options={}){
    const value=String(src||"").trim();
    if(!value) return null;

    if(/^data:/i.test(value)) return dataUrlToBlob(value);

    if(/^blob:/i.test(value) || /^https?:\/\//i.test(value)){
      try{
        const response=await fetch(value,{
          method:"GET",
          mode:/^https?:/i.test(value)?"cors":"same-origin",
          credentials:"omit",
          cache:"no-store",
          signal:options.signal
        });
        return response.ok ? await response.blob() : null;
      }catch(_){
        return null;
      }
    }

    return null;
  }

  global.AsterImageSourceBlob={dataUrlToBlob,toBlob};
})(window);
