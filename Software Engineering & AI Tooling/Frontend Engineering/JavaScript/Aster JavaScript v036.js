/* Aster JavaScript v036
Authenticated historical derivative: resilient multipart object-removal transport with response-type parsing.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
Port policy: only 127.0.0.1/localhost:5151 is accepted.
*/
(function(){
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function normalizeBase(value){
    const raw = String(value || "").trim().replace(/\/+$/, "").replace(/\/tool$/i, "");
    return /^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(raw)
      ? raw
      : DEFAULT_BASE;
  }

  function pickBases(){
    const bases = [];
    const add = value => {
      const base = normalizeBase(value);
      if(!bases.includes(base)) bases.push(base);
    };

    try{ add(localStorage.getItem("aster.imageToolBase")); }catch(_){}
    try{ add(localStorage.getItem("aster.imageBackendBase")); }catch(_){}
    add(DEFAULT_BASE);
    return bases;
  }

  function parseOutputUrl(value){
    try{
      if(!value) return "";
      const url =
        value?.images?.[0]?.url ||
        value?.image?.url ||
        value?.image_url ||
        value?.url ||
        "";
      return typeof url === "string" ? url : "";
    }catch(_){
      return "";
    }
  }

  async function postMultipart(base, path, buildForm, timeoutMs=45000){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try{
      const response = await fetch(normalizeBase(base) + path, {
        method:"POST",
        body:buildForm(),
        signal:controller.signal,
        cache:"no-store",
        credentials:"omit",
        mode:"cors"
      });

      if(response.status === 404 || response.status === 405){
        return {ok:false, skip:true, status:response.status};
      }

      if(!response.ok){
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status} ${text || response.statusText || ""}`.trim());
      }

      const type = String(response.headers.get("content-type") || "").toLowerCase();

      if(type.includes("application/json")){
        const json = await response.json().catch(() => ({}));
        const url = parseOutputUrl(json);
        if(url) return {ok:true, url};
        throw new Error("Removal returned JSON without an image URL.");
      }

      if(type.startsWith("image/")){
        const blob = await response.blob();
        return {ok:true, url:URL.createObjectURL(blob)};
      }

      const text = await response.text().catch(() => "");
      try{
        const json = JSON.parse(text);
        const url = parseOutputUrl(json);
        if(url) return {ok:true, url};
      }catch(_){}

      if(/^https?:\/\//i.test(text.trim())){
        return {ok:true, url:text.trim()};
      }

      throw new Error("Removal returned an unrecognized response.");
    }finally{
      clearTimeout(timer);
    }
  }

  async function removeViaBackend(prompt, options={}){
    const input = window.asterRemovalInput;
    if(!input) throw new Error("Removal input adapter is unavailable.");

    const {blob:imageBlob, src} = await input.getActiveImageBlob();
    const maskDataUrl = input.getMaskDataURL();
    const maskBlob = maskDataUrl ? input.dataUrlToBlob(maskDataUrl) : null;

    const imageUrlFallback =
      (!imageBlob || !imageBlob.size) && src && !/^data:/i.test(src)
        ? src
        : "";

    if((!imageBlob || !imageBlob.size) && !imageUrlFallback){
      throw new Error("No image is available for removal.");
    }

    function buildForm(){
      const form = new FormData();
      const cleanPrompt = String(prompt || "").trim();
      if(cleanPrompt) form.append("prompt", cleanPrompt);
      form.append("backend_hint", "object_removal");

      if(imageBlob?.size){
        form.append(
          "image",
          new File([imageBlob], "image.png", {type:imageBlob.type || "image/png"})
        );
      }else if(imageUrlFallback){
        form.append("image_url", imageUrlFallback);
        form.append("fetch_and_upload", "1");
        form.append("force_upload", "1");
      }

      if(maskBlob?.size){
        form.append("mask", new File([maskBlob], "mask.png", {type:"image/png"}));
      }

      for(const key of ["strength", "guidance", "seed", "steps"]){
        if(options[key] != null) form.append(key, String(options[key]));
      }
      return form;
    }

    const paths = maskBlob?.size
      ? ["/tool/remove", "/tool/erase", "/tool/inpaint_remove", "/tool/object_remove"]
      : ["/tool/remove", "/tool/inpaint_remove", "/tool/object_remove", "/tool/erase"];

    let lastError = null;
    for(const base of pickBases()){
      for(const path of paths){
        try{
          const result = await postMultipart(base, path, buildForm);
          if(result?.ok && result.url){
            try{ localStorage.setItem("aster.imageToolBase", normalizeBase(base)); }catch(_){}
            return result.url;
          }
        }catch(error){
          lastError = error;
        }
      }
    }

    throw lastError || new Error("Object-removal backend call failed.");
  }

  window.asterRemoveTransport = {
    postMultipart,
    removeViaBackend
  };
})();
