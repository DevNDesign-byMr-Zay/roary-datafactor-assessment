/* Aster JavaScript v054
Authenticated historical derivative: health-gated dynamic import bootstrap for the local image-tool service.
Identity-specific names, credentials, personal paths, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterImageToolImportBootstrapV1) return;
  window.__asterImageToolImportBootstrapV1 = true;

  const IMAGE_TOOL_BASE = "http://127.0.0.1:5151";

  async function serviceIsUp(){
    try{
      const response = await fetch(IMAGE_TOOL_BASE + "/healthz", {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store"
      });
      return !!(response && response.ok);
    }catch(_){
      return false;
    }
  }

  function loadImportModule(){
    return new Promise((resolve,reject)=>{
      const existing = document.querySelector('script[data-aster-image-import="1"]');
      if(existing){
        if(existing.dataset.loaded === "1") return resolve(existing);
        existing.addEventListener("load",()=>resolve(existing),{once:true});
        existing.addEventListener("error",reject,{once:true});
        return;
      }

      const script = document.createElement("script");
      script.dataset.asterImageImport = "1";
      script.src = IMAGE_TOOL_BASE + "/ui/import.js?t=" + Date.now();
      script.addEventListener("load",()=>{
        script.dataset.loaded = "1";
        resolve(script);
      },{once:true});
      script.addEventListener("error",reject,{once:true});
      document.head.appendChild(script);
    });
  }

  async function bootstrap(){
    if(await serviceIsUp()){
      try{
        await loadImportModule();
        document.dispatchEvent(new CustomEvent("aster:image-tool-import-ready"));
        return true;
      }catch(_){}
    }
    return false;
  }

  window.asterImageToolImport = {
    base: IMAGE_TOOL_BASE,
    serviceIsUp,
    load: loadImportModule,
    bootstrap
  };

  bootstrap().catch(()=>{});
})();
