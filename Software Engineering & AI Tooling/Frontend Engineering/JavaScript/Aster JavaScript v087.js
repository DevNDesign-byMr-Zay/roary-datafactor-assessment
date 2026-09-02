/* Aster JavaScript v087
Authenticated historical derivative: fixed-model state while the model drawer is intentionally removed.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  function install(options={}){
    const modelId = String(options.defaultModelId || "");
    const mode = String(options.defaultMode || "instant");
    const storagePrefix = String(options.storagePrefix || "aster");
    if(!modelId) return;
    try{
      localStorage.setItem(storagePrefix + ".model", modelId);
      localStorage.setItem(storagePrefix + ".modelMode", mode);
    }catch(_){}
  }
  window.installAsterFixedModelNoDrawer = install;
})();
