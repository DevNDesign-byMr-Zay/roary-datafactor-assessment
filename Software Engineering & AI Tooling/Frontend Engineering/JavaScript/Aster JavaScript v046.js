/* Aster JavaScript v046
Authenticated historical derivative: preload-first processed-image reveal through the 5151 media proxy.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
The visible image is not committed until the replacement has fired onload.
*/
(function(){
  const DEFAULT_BASE = "http://127.0.0.1:5151";

  function backendBase(){
    const candidate = String(
      window.__asterToolBackendBase ||
      window.__asterImageBackendBase ||
      DEFAULT_BASE
    ).trim().replace(/\/+$/, "");

    return /^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(candidate)
      ? candidate
      : DEFAULT_BASE;
  }

  function pickModalImage(){
    const selectors = [
      "#rtLightbox img.rt-main",
      "#rtLightbox img",
      ".rt-lightbox img",
      "#imageModalImg",
      "#imageModal img",
      ".rt-modal img"
    ];
    for(const selector of selectors){
      const element = document.querySelector(selector);
      if(element?.tagName === "IMG") return element;
    }
    return null;
  }

  function proxiedUrl(rawUrl){
    const value = String(rawUrl || "");
    const separator = value.includes("?") ? "&" : "?";
    const cacheBusted = value + separator + "aster_cb=" + Date.now();
    return backendBase() + "/media?url=" + encodeURIComponent(cacheBusted);
  }

  function preloadImage(url, timeoutMs=9000){
    return new Promise((resolve, reject)=>{
      const image = new Image();
      let settled = false;

      const finish = (fn, value)=>{
        if(settled) return;
        settled = true;
        clearTimeout(timer);
        fn(value);
      };

      const timer = setTimeout(()=>{
        try{ image.src = ""; }catch(_){}
        finish(reject, new Error("Image preload timed out."));
      }, timeoutMs);

      image.onload = ()=>finish(resolve, image);
      image.onerror = ()=>finish(reject, new Error("Image preload failed."));
      // Deliberately omit crossOrigin: this path is for display, not pixel readback.
      image.src = url;

      if(image.complete && image.naturalWidth > 0){
        finish(resolve, image);
      }
    });
  }

  function commitAfterLoad(element, url, timeoutMs=9000){
    return new Promise((resolve, reject)=>{
      let settled = false;

      const finish = (fn, value)=>{
        if(settled) return;
        settled = true;
        clearTimeout(timer);
        element.onload = null;
        element.onerror = null;
        fn(value);
      };

      const timer = setTimeout(
        ()=>finish(reject, new Error("Visible image load timed out.")),
        timeoutMs
      );

      element.onload = async ()=>{
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        finish(resolve, true);
      };
      element.onerror = ()=>finish(reject, new Error("Visible image load failed."));
      element.src = url;

      if(element.complete && element.naturalWidth > 0){
        requestAnimationFrame(()=>requestAnimationFrame(()=>finish(resolve, true)));
      }
    });
  }

  async function swapProcessedImage(rawUrl, options={}){
    const element = options.imageElement || pickModalImage();
    if(!element) throw new Error("No visible image element is available.");

    const proxy = proxiedUrl(rawUrl);

    try{
      await preloadImage(proxy, options.preloadTimeoutMs || 9000);
      await commitAfterLoad(element, proxy, options.loadTimeoutMs || 9000);
      return proxy;
    }catch(_){
      const value = String(rawUrl || "");
      const separator = value.includes("?") ? "&" : "?";
      const direct = value + separator + "aster_cb=" + Date.now();
      await preloadImage(direct, options.preloadTimeoutMs || 9000);
      await commitAfterLoad(element, direct, options.loadTimeoutMs || 9000);
      return direct;
    }
  }

  window.asterSwapProcessedImageWhenLoaded = swapProcessedImage;
})();
