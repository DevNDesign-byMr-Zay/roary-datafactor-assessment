/* Aster JavaScript v031
Authenticated historical derivative: active-image/mask packaging bridge for object-removal requests.
This artifact reuses the previously captured error-preserving endpoint fallback instead of duplicating it.
Original product identity, private prompts, credentials, personal paths, and protected reasoning architecture removed.
Image tool backend remains locked to 127.0.0.1:5151.
*/
(function(){
  function getImageBackendBase(){
    try{
      const stored =
        localStorage.getItem("aster.imageBackendBase") ||
        localStorage.getItem("aster.imageToolBase") ||
        "http://127.0.0.1:5151";
      return String(stored).trim().replace(/\/+$/, "").replace(/\/tool$/i, "");
    }catch(_){
      return "http://127.0.0.1:5151";
    }
  }

  function dataUrlToBlob(dataUrl){
    try{
      const parts = String(dataUrl || "").split(",");
      if(parts.length < 2) return null;
      const match = parts[0].match(/data:([^;]+)/);
      const mime = match?.[1] || "image/png";
      const binary = atob(parts[1] || "");
      const bytes = new Uint8Array(binary.length);
      for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], {type:mime});
    }catch(_){
      return null;
    }
  }

  async function srcToBlob(src){
    const value = String(src || "").trim();
    if(!value) return null;
    try{
      if(/^data:image\//i.test(value)) return dataUrlToBlob(value);
      if(/^blob:/i.test(value)){
        const response = await fetch(value);
        return await response.blob();
      }
      if(/^https?:\/\//i.test(value)){
        const response = await fetch(value, {cache:"no-store"});
        return await response.blob();
      }
    }catch(_){}
    return null;
  }

  function getModalImageSrc(){
    try{
      const image =
        (typeof getModalImageEl === "function" ? getModalImageEl() : null) ||
        document.getElementById("imageModalImg");
      if(image && (image.currentSrc || image.src)) return image.currentSrc || image.src;
    }catch(_){}
    return "";
  }

  window.asterRemoveCurrentModalImage = async function(prompt, opts){
    const options = opts || {};
    const base = getImageBackendBase();
    const src = getModalImageSrc();
    const form = new FormData();

    const blob = await srcToBlob(src);
    if(blob?.size){
      form.append("image", new File([blob], "image.png", {type:blob.type || "image/png"}));
    }else if(src && !/^(blob:|data:)/i.test(src)){
      form.append("image_url", src);
      form.append("force_upload", "1");
      form.append("fetch_and_upload", "1");
    }else if(/^data:image\//i.test(src)){
      const dataBlob = dataUrlToBlob(src);
      if(dataBlob?.size){
        form.append("image", new File([dataBlob], "image.png", {type:dataBlob.type || "image/png"}));
      }
    }

    form.append("prompt", String(prompt || "").trim());

    try{
      const maskUrl =
        window.__asterErase &&
        typeof window.__asterErase.getMaskDataURL === "function"
          ? window.__asterErase.getMaskDataURL()
          : "";
      if(/^data:image\//i.test(maskUrl)){
        const maskBlob = dataUrlToBlob(maskUrl);
        if(maskBlob?.size){
          form.append("mask", new File([maskBlob], "mask.png", {type:maskBlob.type || "image/png"}));
          form.append("mask_url", maskUrl);
        }
      }
    }catch(_){}

    if(!form.has("image") && !form.has("image_url")){
      throw new Error("Remove could not access the current image.");
    }

    if(typeof window.asterRemoveWithFallback !== "function"){
      throw new Error("Remove transport is unavailable.");
    }
    return await window.asterRemoveWithFallback(base, form, options);
  };
})();
