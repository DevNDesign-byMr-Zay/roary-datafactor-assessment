/* Aster JavaScript v081
Authenticated historical derivative: single authoritative model-drawer patch with definition synchronization, alias migration, capture-phase selection, and selected-state refresh.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterSingleDrawerPatchV1) return;
  window.__asterSingleDrawerPatchV1 = true;

  function boot(options={}){
    const selectors={
      wrap:options.wrapSelector||"[data-aster-model-wrap]",
      toggle:options.toggleSelector||"[data-aster-model-toggle]",
      drawer:options.drawerSelector||"[data-aster-model-drawer]",
      label:options.labelSelector||"[data-aster-model-label]"
    };
    const modelBySlot=options.modelBySlot||{};
    const aliases=options.aliases||{};
    const modelKey=options.storageModelKey||"aster.model";
    const modeKey=options.storageModeKey||"aster.modelMode";
    const get=()=>({
      wrap:document.querySelector(selectors.wrap),
      toggle:document.querySelector(selectors.toggle),
      drawer:document.querySelector(selectors.drawer),
      label:document.querySelector(selectors.label)
    });

    function patchDefinitions(){
      const {drawer}=get();
      if(drawer){
        drawer.querySelectorAll("[data-slot]").forEach(option=>{
          const slot=(option.getAttribute("data-slot")||"").toLowerCase();
          if(modelBySlot[slot]) option.setAttribute("data-model",modelBySlot[slot]);
        });
      }
      if(typeof options.onPatchDefinitions==="function"){
        try{ options.onPatchDefinitions({...modelBySlot}); }catch(_){ }
      }
      try{
        const saved=(localStorage.getItem(modelKey)||"").trim();
        if(aliases[saved]) localStorage.setItem(modelKey,aliases[saved]);
        const mode=(localStorage.getItem(modeKey)||"").toLowerCase();
        if(!modelBySlot[mode]){
          const current=aliases[saved]||saved;
          const matched=Object.keys(modelBySlot).find(slot=>modelBySlot[slot]===current) || "instant";
          localStorage.setItem(modeKey,matched);
        }
      }catch(_){ }
    }

    function closeDrawer(){
      const {wrap,toggle,drawer}=get();
      if(!wrap||!toggle||!drawer) return;
      wrap.classList.remove("open");
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
      drawer.setAttribute("aria-hidden","true");
    }

    function applySelection(slot,value,option){
      try{
        localStorage.setItem(modelKey,value);
        localStorage.setItem(modeKey,slot);
      }catch(_){ }
      const {label}=get();
      if(label) label.textContent=slot.toUpperCase();
      if(typeof options.onSelect==="function"){
        try{ options.onSelect({slot,value,option}); }catch(_){ }
      }
      closeDrawer();
    }

    function syncSelected(){
      const {drawer,label}=get();
      if(!drawer) return;
      let current="";
      try{ current=localStorage.getItem(modelKey)||""; }catch(_){ }
      let activeSlot="instant";
      drawer.querySelectorAll("[data-slot]").forEach(option=>{
        const slot=(option.getAttribute("data-slot")||"").toLowerCase();
        const value=option.getAttribute("data-model")||modelBySlot[slot]||"";
        const selected=!!value && value===current;
        option.classList.toggle("is-selected",selected);
        option.setAttribute("aria-selected",selected?"true":"false");
        if(selected) activeSlot=slot;
      });
      if(label) label.textContent=activeSlot.toUpperCase();
    }

    if(!window.__asterSingleDrawerCaptureV1){
      window.__asterSingleDrawerCaptureV1=true;
      window.addEventListener("pointerdown",event=>{
        const {drawer}=get();
        const target=event.target;
        if(!drawer||!target||!drawer.contains(target)||!target.closest) return;
        const option=target.closest("[data-slot]");
        if(!option||!drawer.contains(option)) return;
        if(option.classList.contains("is-disabled")||option.hasAttribute("disabled")||option.getAttribute("aria-disabled")==="true"){
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        const slot=(option.getAttribute("data-slot")||"instant").toLowerCase();
        const value=option.getAttribute("data-model")||modelBySlot[slot];
        if(!value) return;
        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();
        applySelection(slot,value,option);
      },true);
    }

    const {wrap,toggle}=get();
    if(wrap) wrap.addEventListener("pointerenter",syncSelected,{passive:true});
    if(toggle) toggle.addEventListener("click",()=>setTimeout(syncSelected,0),{passive:true});
    patchDefinitions();
    syncSelected();
    return {patchDefinitions,syncSelected,closeDrawer};
  }

  window.asterSingleDrawerPatch={boot};
})();
