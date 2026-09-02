/* Aster JavaScript v035
Authenticated historical derivative: standalone active-image and mask acquisition for object removal.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
The image-tool backend is restricted to port 5151.
*/
(function(){
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function normalizeBase(value){
    const raw = String(value || "").trim().replace(/\/+$/, "").replace(/\/tool$/i, "");
    if(/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(raw)) return raw;
    return DEFAULT_BASE;
  }

  function getBase(){
    try{
      return normalizeBase(
        localStorage.getItem("aster.imageToolBase") ||
        localStorage.getItem("aster.imageBackendBase") ||
        DEFAULT_BASE
      );
    }catch(_){
      return DEFAULT_BASE;
    }
  }

  function dataUrlToBlob(dataUrl){
    try{
      const parts = String(dataUrl || "").split(",");
      if(parts.length < 2) return null;
      const match = parts[0].match(/data:([^;]+);base64/i);
      const mime = match?.[1] || "image/png";
      const binary = atob(parts.slice(1).join(","));
      const bytes = new Uint8Array(binary.length);
      for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], {type:mime});
    }catch(_){
      return null;
    }
  }

  async function fetchAsBlob(url){
    const value = String(url || "").trim();
    if(!value) return null;
    if(/^data:/i.test(value)) return dataUrlToBlob(value);
    try{
      const response = await fetch(value, {cache:"no-store"});
      if(response.ok) return await response.blob();
    }catch(_){}
    return null;
  }

  async function imageElementToBlob(image){
    try{
      const width = image?.naturalWidth || image?.width || 0;
      const height = image?.naturalHeight || image?.height || 0;
      if(!width || !height) return null;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);

      return await new Promise(resolve => {
        try{
          canvas.toBlob(blob => resolve(blob || null), "image/png");
        }catch(_){
          resolve(null);
        }
      });
    }catch(_){
      return null;
    }
  }

  function getModalImageElement(){
    try{
      return document.getElementById("imageModalImg") ||
        document.querySelector("#imageModal img") ||
        document.querySelector(".img-modal img") ||
        null;
    }catch(_){
      return null;
    }
  }

  async function getActiveImageBlob(){
    const image = getModalImageElement();
    const src = String(image?.currentSrc || image?.src || "").trim();
    let blob = null;

    if(src && !/^file:/i.test(src)){
      blob = await fetchAsBlob(src);
    }

    if(!blob && image){
      // Cross-origin canvas export can throw; that failure is intentionally non-fatal.
      blob = await imageElementToBlob(image);
    }

    if(!blob && src){
      blob = await fetchAsBlob(src);
    }

    return {image, src, blob};
  }

  function getMaskDataURL(){
    try{
      const eraser = window.__asterErase || window.__asterRemove || null;
      const methods = [
        "getMaskDataURL",
        "exportMaskDataURL",
        "getMaskPngDataURL",
        "getMask",
        "maskDataURL",
        "toDataURL"
      ];
      if(eraser){
        for(const name of methods){
          try{
            if(typeof eraser[name] === "function"){
              const value = eraser[name]();
              if(/^data:image\//i.test(String(value || ""))) return String(value);
            }
          }catch(_){}
        }
      }
    }catch(_){}

    const ids = [
      "asterRemoveMaskCanvas",
      "rtRemoveMaskCanvas",
      "rtEraseMaskCanvas2",
      "rtEraseMaskCanvas"
    ];
    for(const id of ids){
      try{
        const canvas = document.getElementById(id);
        if(canvas && typeof canvas.toDataURL === "function"){
          const value = canvas.toDataURL("image/png");
          if(/^data:image\//i.test(value)) return value;
        }
      }catch(_){}
    }

    try{
      const canvas = document.querySelector(
        'canvas[data-remove-mask], canvas[data-mask="remove"], canvas[data-tool-mask]'
      );
      if(canvas && typeof canvas.toDataURL === "function"){
        const value = canvas.toDataURL("image/png");
        if(/^data:image\//i.test(value)) return value;
      }
    }catch(_){}

    return "";
  }

  window.asterRemovalInput = {
    getBase,
    dataUrlToBlob,
    getActiveImageBlob,
    getMaskDataURL
  };
})();
