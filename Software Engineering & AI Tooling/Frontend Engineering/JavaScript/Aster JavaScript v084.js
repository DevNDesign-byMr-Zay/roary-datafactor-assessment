/* Aster JavaScript v084
Authenticated historical derivative: force-write model selection with hover-hold protection.
Selection is intercepted on window-capture pointerdown, state is persisted before app switching,
and competing outside-click/leave handlers are blocked while the drawer is active.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerForceWriteV1) return;
  window.__asterDrawerForceWriteV1 = true;

  function isDisabled(option){
    return !!(
      option.classList.contains("is-disabled") ||
      option.hasAttribute("disabled") ||
      option.getAttribute("aria-disabled") === "true" ||
      option.getAttribute("aria-disabled") === "1"
    );
  }

  function modeFor(option, modelId){
    const slot = (option.getAttribute("data-slot") || "").toLowerCase();
    if(slot === "advanced") return "advanced";
    if(slot === "instant") return "instant";
    return String(modelId || "").toLowerCase().includes("advanced") ? "advanced" : "instant";
  }

  function syncDefinitionsFromDrawer(options){
    try{
      const drawer = document.querySelector(options.drawerSelector);
      const definitions = options.modelDefinitions;
      if(!drawer || !Array.isArray(definitions) || definitions.length < 2) return;

      const instant = drawer.querySelector('[data-slot="instant"][data-model]');
      const advanced = drawer.querySelector('[data-slot="advanced"][data-model]');
      const instantId = instant && instant.getAttribute("data-model");
      const advancedId = advanced && advanced.getAttribute("data-model");
      if(!instantId || !advancedId) return;

      if(definitions[0] && typeof definitions[0] === "object") definitions[0].value = instantId;
      if(definitions[1] && typeof definitions[1] === "object") definitions[1].value = advancedId;
    }catch(_){}
  }

  function stopHoverAutoClose(options){
    const wrap = document.querySelector(options.wrapSelector);
    const drawer = document.querySelector(options.drawerSelector);
    if(!wrap || !drawer) return;

    const killLeave = event => {
      if(drawer.classList.contains("open") && event.stopImmediatePropagation){
        event.stopImmediatePropagation();
      }
    };

    wrap.addEventListener("pointerleave", killLeave, true);
    drawer.addEventListener("pointerleave", killLeave, true);
  }

  function install(options={}){
    const config = {
      wrapSelector: options.wrapSelector || "[data-aster-model-wrap]",
      toggleSelector: options.toggleSelector || "[data-aster-model-toggle]",
      drawerSelector: options.drawerSelector || "[data-aster-model-drawer]",
      modelDefinitions: options.modelDefinitions || null,
      applyModel: typeof options.applyModel === "function" ? options.applyModel : null
    };

    syncDefinitionsFromDrawer(config);
    stopHoverAutoClose(config);

    const toggle = document.querySelector(config.toggleSelector);
    const drawer = document.querySelector(config.drawerSelector);
    if(!drawer) return;

    window.addEventListener("pointerdown", event => {
      const option = event.target && event.target.closest
        ? event.target.closest(`${config.drawerSelector} [data-model]`)
        : null;
      if(!option || isDisabled(option)) return;

      const modelId = option.getAttribute("data-model");
      if(!modelId) return;

      const mode = modeFor(option, modelId);

      try{
        localStorage.setItem("aster.model", modelId);
        localStorage.setItem("aster.modelMode", mode);
      }catch(_){}

      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();

      if(config.applyModel){
        try{ config.applyModel(modelId); }catch(_){}
      }

      if(toggle && drawer.classList.contains("open")){
        setTimeout(() => {
          try{ toggle.click(); }catch(_){}
        }, 0);
      }
    }, true);
  }

  function boot(options={}){
    const run = () => {
      install(options);
      setTimeout(() => install(options), 350);
      setTimeout(() => install(options), 1200);
    };
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", run, {once:true});
    }else{
      run();
    }
  }

  window.installAsterDrawerForceWrite = boot;
})();
