/* Aster JavaScript v041
Authenticated historical derivative: resilient object-removal transport with source acquisition fallbacks and an independent timeout.
Original product identity, third-party comparison branding, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
Image-tool traffic is restricted to http://127.0.0.1:5151.
*/
(function(){
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function normalizeBase(value){
    const candidate = String(value || "").trim().replace(/\/+$/, "");
    return /^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(candidate)
      ? candidate
      : DEFAULT_BASE;
  }

  async function getImageBackendBase(){
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

  function dataUrlToFile(dataUrl, filename){
    try{
      const parts = String(dataUrl || "").split(",");
      if(parts.length < 2) return null;
      const meta = parts[0] || "";
      const encoded = parts.slice(1).join(",");
      const mime = (meta.match(/data:([^;]+)/) || [])[1] || "image/png";
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
      }
      return new File([bytes], filename || "image.png", {type:mime});
    }catch(_){
      return null;
    }
  }

  async function imageElementToDataUrl(image){
    try{
      if(!image || !image.naturalWidth || !image.naturalHeight) return "";
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png");
    }catch(_){
      return "";
    }
  }

  async function sourceToFileOrUrl(source, image){
    const src = String(source || "").trim();
    if(!src) return {file:null, url:""};

    if(/^data:image\//i.test(src)){
      return {file:dataUrlToFile(src, "image.png"), url:""};
    }

    if(/^blob:/i.test(src) || /^https?:\/\//i.test(src)){
      try{
        const response = await fetch(src, {method:"GET", cache:"no-store"});
        if(response?.ok){
          const blob = await response.blob();
          return {
            file:new File([blob], "image.png", {type:blob.type || "image/png"}),
            url:""
          };
        }
      }catch(_){}

      if(/^https?:\/\//i.test(src)){
        return {file:null, url:src};
      }

      const dataUrl = await imageElementToDataUrl(image);
      return dataUrl
        ? {file:dataUrlToFile(dataUrl, "image.png"), url:""}
        : {file:null, url:""};
    }

    if(/^file:/i.test(src)){
      const dataUrl = await imageElementToDataUrl(image);
      return dataUrl
        ? {file:dataUrlToFile(dataUrl, "image.png"), url:""}
        : {file:null, url:""};
    }

    return {file:null, url:src};
  }

  function activeImage(){
    try{
      return (
        (typeof window.getModalImageEl === "function" && window.getModalImageEl()) ||
        document.getElementById("imageModalImg") ||
        null
      );
    }catch(_){
      return null;
    }
  }

  function parseOutputUrl(value){
    return (
      value?.images?.[0]?.url ||
      value?.images?.[0]?.data_url ||
      value?.image?.url ||
      value?.image?.data_url ||
      value?.image_url ||
      value?.url ||
      value?.data_url ||
      value?.output_url ||
      value?.output ||
      ""
    );
  }

  async function removeCurrentImage(prompt, options){
    const opts = options || {};
    const base = await getImageBackendBase();
    const endpoints = [
      base + "/tool/remove",
      base + "/tool/erase",
      base + "/tool/inpaint_remove"
    ];

    const image = activeImage();
    const source = String(image?.currentSrc || image?.src || "");
    const prepared = await sourceToFileOrUrl(source, image);

    let maskDataUrl = "";
    try{
      maskDataUrl = window.__asterErase?.getMaskDataURL?.() || "";
    }catch(_){}

    const controller = new AbortController();
    const configured = Number(opts.timeoutMs || 0);
    const timeoutMs = Math.max(60000, configured || 240000);
    const timeout = setTimeout(() => {
      try{ controller.abort(); }catch(_){}
    }, timeoutMs);

    let lastError = null;

    try{
      for(const endpoint of endpoints){
        const form = new FormData();

        if(prepared.file){
          form.append("image", prepared.file);
        }else if(prepared.url){
          form.append("image_url", prepared.url);
          form.append("force_upload", "1");
          form.append("fetch_and_upload", "1");
        }else{
          throw new Error("No active image data is available.");
        }

        form.append("prompt", String(prompt || "").trim());

        if(/^data:image\//i.test(maskDataUrl)){
          const maskFile = dataUrlToFile(maskDataUrl, "mask.png");
          if(maskFile) form.append("mask", maskFile);
        }

        try{
          const response = await fetch(endpoint, {
            method:"POST",
            body:form,
            signal:controller.signal,
            cache:"no-store",
            credentials:"omit",
            mode:"cors"
          });

          if(response.status === 404 || response.status === 405){
            lastError = new Error("Endpoint unavailable.");
            continue;
          }

          if(!response.ok){
            const text = await response.text().catch(() => "");
            throw new Error(
              `Removal failed (${response.status}): ${text || response.statusText || ""}`.trim()
            );
          }

          const result = await response.json().catch(() => ({}));
          const output = parseOutputUrl(result);
          if(output) return output;

          lastError = new Error("Removal returned no image URL.");
        }catch(error){
          lastError = error;
          if(String(error?.name || "").toLowerCase().includes("abort")){
            break;
          }
        }
      }
    }finally{
      clearTimeout(timeout);
    }

    throw lastError || new Error("Removal tool is unavailable.");
  }

  window.asterRemoveCurrentModalImage = removeCurrentImage;
})();
