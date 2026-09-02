/* Aster JavaScript v065
Authenticated historical derivative: model selection migration and multi-selector synchronization.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterModelSelectionSyncV1) return;
  window.__asterModelSelectionSyncV1 = true;

  const MODEL_KEY = "aster.model";
  const MODE_KEY = "aster.modelMode";

  function read(key,fallback=""){
    try{ return localStorage.getItem(key) || fallback; }
    catch(_){ return fallback; }
  }

  function write(key,value){
    try{ localStorage.setItem(key,String(value)); return true; }
    catch(_){ return false; }
  }

  function normalizeModel(value,aliases={}){
    const raw = String(value || "").trim();
    if(!raw) return "";
    return String(aliases[raw] || aliases[raw.toLowerCase()] || raw).trim();
  }

  function resolveMode(model,options={}){
    const normalized = normalizeModel(model,options.aliases || {});
    const advanced = new Set(options.advancedModels || []);
    if(advanced.has(normalized)) return "advanced";
    const requested = String(options.mode || "").toLowerCase();
    return requested === "advanced" ? "advanced" : "instant";
  }

  function migrateStoredModel(options={}){
    const aliases = options.aliases || {};
    const fallbackInstant = String(options.instantModel || "");
    const fallbackAdvanced = String(options.advancedModel || "");

    let current = normalizeModel(read(MODEL_KEY,""),aliases);
    let mode = read(MODE_KEY,"instant").toLowerCase() === "advanced"
      ? "advanced"
      : "instant";

    if(!current){
      current = mode === "advanced" ? fallbackAdvanced : fallbackInstant;
    }

    current = normalizeModel(current,aliases);
    mode = resolveMode(current,{
      aliases,
      advancedModels: options.advancedModels ||
        (fallbackAdvanced ? [fallbackAdvanced] : []),
      mode
    });

    if(current) write(MODEL_KEY,current);
    write(MODE_KEY,mode);

    return {model:current,mode};
  }

  function syncSelectors(options={}){
    const aliases = options.aliases || {};
    const state = migrateStoredModel(options);
    const selectors = Array.from(document.querySelectorAll(
      options.selector ||
      "[data-aster-model], [data-model]"
    ));

    for(const node of selectors){
      const raw =
        node.getAttribute("data-aster-model") ||
        node.getAttribute("data-model") ||
        "";
      const id = normalizeModel(raw,aliases);
      const selected = !!state.model && id === state.model;

      node.classList.toggle("is-selected",selected);
      node.classList.toggle("active",selected);
      node.setAttribute("aria-selected",selected ? "true" : "false");
    }

    document.querySelectorAll("[data-aster-model-label]").forEach(label=>{
      const value = state.mode === "advanced"
        ? (options.advancedLabel || "ADVANCED")
        : (options.instantLabel || "INSTANT");
      label.textContent = value;
    });

    return state;
  }

  async function applyModel(model,options={}){
    const aliases = options.aliases || {};
    const normalized = normalizeModel(model,aliases);
    if(!normalized) return null;

    const mode = resolveMode(normalized,{
      aliases,
      advancedModels:options.advancedModels || [],
      mode:options.mode
    });

    write(MODEL_KEY,normalized);
    write(MODE_KEY,mode);

    if(typeof options.onApply === "function"){
      await options.onApply(normalized,mode);
    }else if(typeof window.asterApplyModel === "function"){
      await window.asterApplyModel(normalized,mode);
    }

    const state = syncSelectors({...options,mode});
    document.dispatchEvent(new CustomEvent("aster:model-change",{
      detail:{model:state.model,mode:state.mode}
    }));
    return state;
  }

  function bindSelectors(options={}){
    const selector = options.selector || "[data-aster-model], [data-model]";

    document.querySelectorAll(selector).forEach(node=>{
      if(node.dataset.asterModelSyncBound === "1") return;
      node.dataset.asterModelSyncBound = "1";

      node.addEventListener("click",event=>{
        if(
          node.disabled ||
          node.getAttribute("aria-disabled") === "true" ||
          node.classList.contains("is-disabled")
        ) return;

        const raw =
          node.getAttribute("data-aster-model") ||
          node.getAttribute("data-model") ||
          "";
        if(!raw) return;

        event.preventDefault();
        applyModel(raw,options).catch(()=>{});
      });
    });

    return syncSelectors(options);
  }

  window.asterModelSelection = {
    normalizeModel,
    migrateStoredModel,
    syncSelectors,
    applyModel,
    bindSelectors
  };
})();
