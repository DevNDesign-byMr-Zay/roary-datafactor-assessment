async function removeViaBackend(prompt, opts){
    const base = (opts && opts.base) || "http://127.0.0.1:5151";
    const paths = (opts && opts.paths) || ["/tool/erase", "/tool/remove", "/tool/inpaint_remove"];
    const imgEl = (typeof window.getModalImageEl === "function" && window.getModalImageEl()) || id("imageModalImg");
    const src = imgEl ? (imgEl.currentSrc || imgEl.src || "") : "";
    if(!src) throw new Error("No active image found.");

    const maskDataUrl = (window.__asterErase && typeof window.__asterErase.getMaskDataURL === "function")
      ? window.__asterErase.getMaskDataURL()
      : "";

    // If no mask AND no prompt, don't waste a backend call (common "it returns the same image" scenario)
    if((!maskDataUrl || !String(maskDataUrl).startsWith("data:")) && (!prompt || !String(prompt).trim())){
      throw new Error("Draw a mask first (or add a prompt) before Execute.");
    }

    const imageBlob = await srcToBlob(src, imgEl);
    if(!imageBlob) throw new Error("Could not read active image data.");

    let maskBlob = null;
    if(maskDataUrl && String(maskDataUrl).startsWith("data:")){
      maskBlob = dataUrlToBlob(maskDataUrl);
    }

    // Build form once per attempt (fresh FormData each try)
    const makeForm = ()=>{
      const fd = new FormData();
      fd.append("image", imageBlob, "image.png");
      if(maskBlob) fd.append("mask", maskBlob, "mask.png");
      fd.append("prompt", String(prompt||"remove object"));
      // Hint for newer object-removal inpaint pipelines (backend may ignore safely)
      fd.append("mode", "object_removal");
      fd.append("model", "object-removal-inpaint-latest");
      fd.append("return", "url");
      return fd;
    };

    let lastErr = null;
    for(const path of paths){
      const url = base.replace(/\/+$/,"") + path;
      try{
        const js = await postForm(url, makeForm());
        // raw blob -> objectURL
        if(js && js.blob instanceof Blob){
          return URL.createObjectURL(js.blob);
        }
        const out = parseOutUrl(js);
        if(out){
          return cacheBust(out);
        }
        // Some backends return {ok:true} with no url — treat as failure
        lastErr = new Error("No image returned from backend.");
      }catch(e){
        lastErr = e;
        // 404/405 -> try next endpoint
        if(String(e && e.message || "").includes("HTTP 404") || String(e && e.message || "").includes("HTTP 405")){
          continue;
        }
        // Other errors: keep trying next path too
        continue;
      }
    }
    throw lastErr || new Error("Object removal failed.");
  }
