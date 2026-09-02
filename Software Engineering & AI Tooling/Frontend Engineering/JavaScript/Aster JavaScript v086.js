/* Aster JavaScript v086
Authenticated historical derivative: advanced model-state synchronization.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterAdvancedModelSyncV1) return;
  window.__asterAdvancedModelSyncV1 = true;

  function install(options={}){
    const instantId = String(options.instantModelId || "");
    const advancedId = String(options.advancedModelId || "");
    const registry = options.modelRegistry || null;
    const applyModel = typeof options.applyModel === "function" ? options.applyModel : null;
    const refresh = typeof options.refresh === "function" ? options.refresh : null;
    const setLabels = typeof options.setLabels === "function" ? options.setLabels : null;
    const storagePrefix = String(options.storagePrefix || "aster");
    const advancedMatchers = Array.isArray(options.advancedMatchers) ? options.advancedMatchers : [];

    if(!instantId || !advancedId) return null;

    const isAdvanced = value => {
      const id = String(value || "");
      if(id.toLowerCase() === advancedId.toLowerCase()) return true;
      return advancedMatchers.some(matcher => {
        try{ return matcher instanceof RegExp ? matcher.test(id) : id.toLowerCase().includes(String(matcher).toLowerCase()); }
        catch(_){ return false; }
      });
    };

    function aliasMissing(modelId){
      if(!registry || typeof registry !== "object" || registry[modelId]) return;
      const fallbackId = isAdvanced(modelId) ? advancedId : instantId;
      if(registry[fallbackId]) registry[modelId] = registry[fallbackId];
    }

    return function selectModel(modelId){
      const id = String(modelId || "");
      if(!id) return;
      const mode = isAdvanced(id) ? "advanced" : "instant";
      aliasMissing(id);
      try{
        localStorage.setItem(storagePrefix + ".model", id);
        localStorage.setItem(storagePrefix + ".modelMode", mode);
      }catch(_){}
      try{ if(applyModel) applyModel(id); }catch(_){}
      try{ if(refresh) refresh(id, mode); }catch(_){}
      try{ if(setLabels) setLabels(id, mode); }catch(_){}
    };
  }

  window.installAsterAdvancedModelSync = install;
})();
