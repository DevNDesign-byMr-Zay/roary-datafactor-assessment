/* Aster JavaScript v088
Authenticated historical derivative: stabilized fixed-model/no-drawer controller.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterNoDrawerStabilityV1) return;
  window.__asterNoDrawerStabilityV1 = true;

  function install(options={}){
    const modelId = String(options.defaultModelId || "");
    const mode = String(options.defaultMode || "instant");
    const storagePrefix = String(options.storagePrefix || "aster");
    const applyModel = typeof options.applyModel === "function" ? options.applyModel : null;
    if(!modelId) return;

    try{
      localStorage.setItem(storagePrefix + ".model", modelId);
      localStorage.setItem(storagePrefix + ".modelMode", mode);
    }catch(_){}
    try{ if(applyModel) applyModel(modelId); }catch(_){}

    window.__ASTER_MODEL_DRAWER_DISABLED = true;
  }

  window.addEventListener("unhandledrejection", event => {
    try{ console.warn("[Aster][stability] Unhandled rejection:", event.reason); }catch(_){}
  });

  window.installAsterNoDrawerStability = install;
})();
