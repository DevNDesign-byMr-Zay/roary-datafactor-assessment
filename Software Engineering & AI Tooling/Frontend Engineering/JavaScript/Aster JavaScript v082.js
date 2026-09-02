/* Aster JavaScript v082
Authenticated historical derivative: no-clone runtime synchronization that derives model identities from drawer data, repairs comparator state, normalizes legacy aliases, and retries after late initialization.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerNoCloneSyncV1) return;
  window.__asterDrawerNoCloneSyncV1=true;

  function boot(options={}){
    const drawerSelector=options.drawerSelector||"[data-aster-model-drawer]";
    const modelKey=options.storageModelKey||"aster.model";
    const modeKey=options.storageModeKey||"aster.modelMode";
    const aliases=options.aliases||{};

    function deriveFromDrawer(){
      const drawer=document.querySelector(drawerSelector);
      if(!drawer) return null;
      const map={};
      drawer.querySelectorAll("[data-slot][data-model]").forEach(option=>{
        const slot=(option.getAttribute("data-slot")||"").toLowerCase();
        const value=(option.getAttribute("data-model")||"").trim();
        if(slot&&value) map[slot]=value;
      });
      return Object.keys(map).length ? map : null;
    }

    function sync(){
      const modelBySlot=deriveFromDrawer();
      if(!modelBySlot) return false;
      if(typeof options.onSyncComparator==="function"){
        try{ options.onSyncComparator({...modelBySlot}); }catch(_){ }
      }
      if(typeof options.onSyncLabels==="function"){
        try{ options.onSyncLabels({...modelBySlot}); }catch(_){ }
      }
      try{
        let saved=(localStorage.getItem(modelKey)||"").trim();
        if(aliases[saved]){
          saved=aliases[saved];
          localStorage.setItem(modelKey,saved);
        }
        let mode=(localStorage.getItem(modeKey)||"").toLowerCase();
        if(!modelBySlot[mode]){
          mode=Object.keys(modelBySlot).find(slot=>modelBySlot[slot]===saved) || Object.keys(modelBySlot)[0];
          if(mode) localStorage.setItem(modeKey,mode);
        }
      }catch(_){ }
      return true;
    }

    function schedule(){
      sync();
      setTimeout(sync,250);
      setTimeout(sync,900);
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",schedule,{once:true});
    else schedule();
    return {sync};
  }

  window.asterDrawerNoCloneSync={boot};
})();
