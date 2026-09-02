/* Aster JavaScript v080
Authenticated historical derivative: hover-gap bridge selection assist with capture-phase model activation and deferred runtime handoff.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterGapBridgeSelectAssistV1) return;
  window.__asterGapBridgeSelectAssistV1 = true;

  function boot(options={}){
    const drawerSelector = options.drawerSelector || "[data-aster-model-drawer]";
    const optionSelector = options.optionSelector || "[data-slot]";
    const storageModelKey = options.storageModelKey || "aster.model";
    const storageModeKey = options.storageModeKey || "aster.modelMode";
    const modelBySlot = options.modelBySlot || {};

    function drawer(){ return document.querySelector(drawerSelector); }

    function patchOptionData(){
      const root = drawer();
      if(!root) return;
      root.querySelectorAll(optionSelector).forEach(option=>{
        const slot=(option.getAttribute("data-slot")||"").toLowerCase();
        const value=modelBySlot[slot];
        if(value) option.setAttribute("data-model",value);
      });
    }

    function patchRuntimeRegistry(){
      if(typeof options.onPatchRegistry === "function"){
        try{ options.onPatchRegistry({...modelBySlot}); }catch(_){ }
      }
    }

    function installCaptureAssist(){
      if(window.__asterGapBridgeCaptureAssistV1) return;
      window.__asterGapBridgeCaptureAssistV1 = true;
      window.addEventListener("pointerdown",event=>{
        const root=drawer();
        const target=event.target;
        if(!root || !target || !target.closest) return;
        const option=target.closest(optionSelector);
        if(!option || !root.contains(option)) return;
        if(option.classList.contains("is-disabled") || option.hasAttribute("disabled") || option.getAttribute("aria-disabled")==="true") return;
        const slot=(option.getAttribute("data-slot")||"instant").toLowerCase();
        const value=option.getAttribute("data-model") || modelBySlot[slot];
        if(!value) return;
        setTimeout(()=>{
          try{
            localStorage.setItem(storageModelKey,value);
            localStorage.setItem(storageModeKey,slot);
          }catch(_){ }
          if(typeof options.onSelect === "function"){
            try{ options.onSelect({slot,value,option}); }catch(_){ }
          }
        },0);
      },true);
    }

    function applyPatches(){ patchOptionData(); patchRuntimeRegistry(); }
    applyPatches();
    installCaptureAssist();
    setTimeout(applyPatches,350);
    return {applyPatches};
  }

  window.asterGapBridgeSelectAssist={boot};
})();
