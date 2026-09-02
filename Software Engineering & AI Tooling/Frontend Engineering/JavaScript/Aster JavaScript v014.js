/* Aster object-removal transport: image-source normalization, mask attachment, endpoint fallback, and timeout control. */
/* Remove Object (editor-style) — FIX ONLY
   - Keeps your Expand 8-point frame + animation intact
   - Does NOT touch localStorage / IndexedDB keys
   - Guarantees removeCurrentModalImage exists + works even when AbortController is used elsewhere
   - Uses mask from the Eraser brush when present
*/
(function(){
  function log(){ try{ console.log.apply(console, ["[ASTER][Remove]"].concat([].slice.call(arguments))); }catch(e){} }
  function warn(){ try{ console.warn.apply(console, ["[ASTER][Remove]"].concat([].slice.call(arguments))); }catch(e){} }
  function err(){ try{ console.error.apply(console, ["[ASTER][Remove]"].concat([].slice.call(arguments))); }catch(e){} }

  function dataUrlToFile(dataUrl, filename){
    try{
      const parts = String(dataUrl||"").split(",");
      if(parts.length < 2) return null;
      const meta = parts[0] || "";
      const b64 = parts[1] || "";
      const mime = (meta.match(/data:([^;]+)/)||[])[1] || "image/png";
      const bin = atob(b64);
      const u8  = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
      return new File([u8], filename||"image.png", { type: mime });
    }catch(e){ return null; }
  }

  async function imgElToDataUrl(imgEl){
    try{
      if(!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return "";
      const c = document.createElement("canvas");
      c.width  = imgEl.naturalWidth;
      c.height = imgEl.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(imgEl, 0, 0);
      // Use PNG to preserve edges
      return c.toDataURL("image/png");
    }catch(e){
      return "";
    }
  }

  async function srcToFileOrUrl(src, imgEl){
    src = String(src||"").trim();
    if(!src) return { file: null, url: "" };

    // Prefer uploading as file to avoid remote fetch issues from file:// origin
    if(/^data:image\//i.test(src)){
      return { file: dataUrlToFile(src, "image.png"), url: "" };
    }
    if(src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://")){
      try{
        const r = await fetch(src, { method: "GET", cache: "no-store" });
        if(r && r.ok){
          const b = await r.blob();
          const f = new File([b], "image.png", { type: b.type || "image/png" });
          return { file: f, url: "" };
        }
      }catch(e){}
      // If fetch fails (CORS), fall back to sending url
      if(src.startsWith("http")) return { file: null, url: src };
      // blob fetch should usually work; if not, canvas fallback:
      const d = await imgElToDataUrl(imgEl);
      if(d) return { file: dataUrlToFile(d, "image.png"), url: "" };
      return { file: null, url: "" };
    }
    if(src.startsWith("file:")){
      // Can't fetch file:// across unique origins reliably. Use canvas readback.
      const d = await imgElToDataUrl(imgEl);
      if(d) return { file: dataUrlToFile(d, "image.png"), url: "" };
      return { file: null, url: "" };
    }
    // unknown scheme — try url field
    return { file: null, url: src };
  }

  async function getImageBackendBase(){
    try{
      if(typeof asterImageBase === "function"){
        const b = await asterImageBase();
        if(b) return String(b).replace(/\/+$/,'');
      }
    }catch(e){}
    return "http://127.0.0.1:5151";
  }

  function pickModalImageEl(){
    try{
      return (typeof getModalImageEl==="function" && getModalImageEl()) ||
        window.imageModalImg ||
        document.getElementById("imageModalImg") ||
        null;
    }catch(e){ return null; }
  }

  async function callRemove(prompt, opts){
    opts = opts || {};
    const base = await getImageBackendBase();
    const endpoints = [
      base + "/tool/remove",
      base + "/tool/erase",
      base + "/tool/inpaint_remove"
    ];

    const imgEl = pickModalImageEl();
    const src = (imgEl && (imgEl.currentSrc || imgEl.src)) || "";
    const { file: imgFile, url: imgUrl } = await srcToFileOrUrl(src, imgEl);

    const fd = new FormData();
    if(imgFile) fd.append("image", imgFile);
    else if(imgUrl) { fd.append("image_url", imgUrl); fd.append("force_upload","1"); fd.append("fetch_and_upload","1"); }

    const p = String(prompt||"").trim();
    fd.append("prompt", p);

    // mask (from eraser tool)
    let maskDataUrl = "";
    try{
      maskDataUrl = window.__asterErase?.getMaskDataURL?.() || "";
    }catch(e){ maskDataUrl = ""; }

    if(maskDataUrl && /^data:image\//i.test(maskDataUrl)){
      const mf = dataUrlToFile(maskDataUrl, "mask.png");
      if(mf) fd.append("mask", mf);
      // backend supports optional mask_url for debugging
      fd.append("mask_url", maskDataUrl);
    }

    // Make sure we don't get insta-aborted by upstream controllers.
    // We'll time out ourselves.
    const ac = new AbortController();
    const timeoutMs = Math.max(60_000, Number(window.__asterRemoveTimeoutMs||0) || 240_000);
    const to = setTimeout(()=>{ try{ ac.abort(); }catch(e){} }, timeoutMs);

    let lastErr = null;

    for(const url of endpoints){
      try{
        log("POST", url, { hasMask: !!maskDataUrl, promptLen: p.length });
        const r = await fetch(url, { method: "POST", body: fd, signal: ac.signal, cache: "no-store" });
        if(!r) { lastErr = new Error("No response"); continue; }

        if(!r.ok){
          if(r.status === 404 || r.status === 405) { lastErr = new Error("Endpoint not found"); continue; }
          const txt = await r.text().catch(()=> "");
          throw new Error("Remove failed ("+r.status+"): " + (txt || r.statusText));
        }

        const j = await r.json().catch(()=> ({}));
        const out =
          (j && j.images && j.images[0] && (j.images[0].url || j.images[0].data_url || j.images[0].dataUrl)) ||
          (j && j.image && (j.image.url || j.image.data_url || j.image.dataUrl)) ||
          (j && (j.image_url || j.url || j.data_url || j.dataUrl || j.output_url || j.outputUrl || j.output)) ||
          "";
        if(out) return out;

        throw new Error("Remove returned no image URL.");
      }catch(e){
        lastErr = e;
        // if timed out, bail with last err
        if(String(e&&e.name||"").toLowerCase().includes("abort")){
          break;
        }
        continue;
      }
    }

    throw (lastErr || new Error("Remove tool unavailable on the image backend."));
  }

  // Install
  window.removeCurrentModalImage = callRemove;

  // Also create a real global binding (strict scopes need the identifier)
  try{
    // eslint-disable-next-line no-var
    var removeCurrentModalImage = window.removeCurrentModalImage;
    window.removeCurrentModalImage = removeCurrentModalImage;
  }catch(e){}

})();
