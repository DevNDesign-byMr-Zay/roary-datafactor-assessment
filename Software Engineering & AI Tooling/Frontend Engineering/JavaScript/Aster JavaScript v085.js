/* Aster JavaScript v085
Authenticated historical derivative: final sticky model-drawer state controller.
It binds explicit instant/advanced model identities supplied by the host, wraps the host switcher
to re-persist state, captures pointerdown before outside-click closers, updates selected UI state,
and reapplies initialization during late app startup.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerFinalStickyV1) return;
  window.__asterDrawerFinalStickyV1 = true;

  function install(options={}){
    const selectors = {
      wrap: options.wrapSelector || "[data-aster-model-wrap]",
      toggle: options.toggleSelector || "[data-aster-model-toggle]",
      drawer: options.drawerSelector || "[data-aster-model-drawer]",
      label: options.labelSelector || "[data-aster-model-label]"
    };

    const instantId = String(options.instantModelId || "");
    const advancedId = String(options.advancedModelId || "");
    const definitions = options.modelDefinitions || null;
    const originalApply = typeof options.applyModel === "function" ? options.applyModel : null;

    if(!instantId || !advancedId) return;

    const isAdvanced = id => String(id || "").toLowerCase() === advancedId.toLowerCase();

    function patchDefinitions(){
      try{
        if(!Array.isArray(definitions) || definitions.length < 2) return;
        if(definitions[0] && typeof definitions[0] === "object") definitions[0].value = instantId;
        if(definitions[1] && typeof definitions[1] === "object") definitions[1].value = advancedId;
      }catch(_){}
    }

    const applyModel = modelId => {
      if(originalApply){
        try{ originalApply(modelId); }catch(_){}
      }
      try{
        const id = String(modelId || "");
        localStorage.setItem("aster.model", id);
        localStorage.setItem("aster.modelMode", isAdvanced(id) ? "advanced" : "instant");
      }catch(_){}
    };

    function installSelectableCapture(){
      const wrap = document.querySelector(selectors.wrap);
      const toggle = document.querySelector(selectors.toggle);
      const drawer = document.querySelector(selectors.drawer);
      const label = document.querySelector(selectors.label);
      if(!wrap || !drawer || drawer.__asterFinalStickyInstalled) return;
      drawer.__asterFinalStickyInstalled = true;

      try{
        const instantOption = drawer.querySelector('[data-slot="instant"]');
        const advancedOption = drawer.querySelector('[data-slot="advanced"]');
        if(instantOption) instantOption.setAttribute("data-model", instantId);
        if(advancedOption) advancedOption.setAttribute("data-model", advancedId);
      }catch(_){}

      drawer.addEventListener("pointerdown", event => {
        const option = event.target && event.target.closest ? event.target.closest("[data-model]") : null;
        if(!option) return;

        if(
          option.classList.contains("is-disabled") ||
          option.disabled ||
          option.getAttribute("aria-disabled") === "true"
        ){
          event.preventDefault();
          event.stopPropagation();
          if(event.stopImmediatePropagation) event.stopImmediatePropagation();
          return;
        }

        const slot = option.getAttribute("data-slot");
        const modelId = option.getAttribute("data-model") || (slot === "advanced" ? advancedId : instantId);
        const advanced = slot === "advanced" || isAdvanced(modelId);

        try{
          localStorage.setItem("aster.model", modelId);
          localStorage.setItem("aster.modelMode", advanced ? "advanced" : "instant");
        }catch(_){}

        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();

        applyModel(modelId);

        try{
          drawer.querySelectorAll("[data-model]").forEach(item => {
            item.classList.toggle("is-selected", item === option);
          });
          if(label) label.textContent = advanced ? "ADVANCED" : "INSTANT";
        }catch(_){}

        try{
          wrap.classList.remove("open");
          drawer.classList.remove("open");
          drawer.setAttribute("aria-hidden","true");
          if(toggle) toggle.setAttribute("aria-expanded","false");
        }catch(_){}
      }, true);
    }

    function boot(){
      patchDefinitions();
      installSelectableCapture();

      let tries = 0;
      const interval = setInterval(() => {
        patchDefinitions();
        installSelectableCapture();
        if(++tries >= 20) clearInterval(interval);
      }, 250);
    }

    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", boot, {once:true});
    }else{
      boot();
    }
  }

  window.installAsterDrawerFinalSticky = install;
})();
