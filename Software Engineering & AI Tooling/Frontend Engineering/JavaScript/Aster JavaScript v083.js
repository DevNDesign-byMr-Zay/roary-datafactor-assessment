/* Aster JavaScript v083
Authenticated historical derivative: inline model-drawer hover/click repair.
Outside-click detection treats both wrapper and drawer as internal, close delay is extended,
selection stops competing propagation, and model/mode persistence is committed before switching.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerInlineRepairV1) return;
  window.__asterDrawerInlineRepairV1 = true;

  function boot(options={}){
    const wrap = document.querySelector(options.wrapSelector || "[data-aster-model-wrap]");
    const toggle = document.querySelector(options.toggleSelector || "[data-aster-model-toggle]");
    const drawer = document.querySelector(options.drawerSelector || "[data-aster-model-drawer]");
    if(!wrap || !toggle || !drawer) return;

    const applyModel = typeof options.applyModel === "function" ? options.applyModel : null;
    const getAdvancedValue = typeof options.getAdvancedModelValue === "function"
      ? options.getAdvancedModelValue
      : () => options.advancedModelValue;

    let closeTimer = null;

    function open(){
      if(drawer.classList.contains("open")) return;
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden","false");
      toggle.setAttribute("aria-expanded","true");
      document.addEventListener("click", onDocumentClick, {capture:true});
      document.addEventListener("keydown", onKeydown);
    }

    function close(){
      clearTimeout(closeTimer);
      closeTimer = null;
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden","true");
      toggle.setAttribute("aria-expanded","false");
      document.removeEventListener("click", onDocumentClick, {capture:true});
      document.removeEventListener("keydown", onKeydown);
    }

    function scheduleClose(delay=680){
      clearTimeout(closeTimer);
      closeTimer = setTimeout(close, delay);
    }

    function cancelClose(){
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    function onDocumentClick(event){
      if(wrap.contains(event.target) || drawer.contains(event.target)) return;
      close();
    }

    function onKeydown(event){
      if(event.key === "Escape") close();
    }

    wrap.addEventListener("pointerenter", () => {
      cancelClose();
      open();
    });

    wrap.addEventListener("pointerleave", () => scheduleClose(680));

    toggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      drawer.classList.contains("open") ? close() : open();
    });

    drawer.addEventListener("pointerenter", cancelClose);
    drawer.addEventListener("pointerleave", () => scheduleClose(680));

    drawer.querySelectorAll("[data-model]").forEach(option => {
      option.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();

        const modelId = option.getAttribute("data-model");
        if(!modelId) return;

        const disabled =
          option.classList.contains("is-disabled") ||
          option.hasAttribute("disabled") ||
          option.getAttribute("aria-disabled") === "true";
        if(disabled) return;

        try{
          const advancedValue = getAdvancedValue();
          localStorage.setItem("aster.model", modelId);
          localStorage.setItem("aster.modelMode", modelId === advancedValue ? "advanced" : "instant");
        }catch(_){}

        if(applyModel){
          try{ applyModel(modelId); }catch(_){}
        }
        close();
      });
    });
  }

  window.installAsterDrawerInlineRepair = boot;
})();
