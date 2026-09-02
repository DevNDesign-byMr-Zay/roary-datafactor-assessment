/* Aster JavaScript v161
Authenticated historical derivative: offline-safe missing-media cleanup.
A broken image is removed only after a direct existence check confirms it is unavailable;
network errors preserve the record so temporary outages do not destroy library state.
*/
(function(global){
  "use strict";
  if(global.AsterMissingMediaPruner) return;

  async function confirmMissing(src,options={}){
    const url=String(src||"").trim();
    if(!url) return false;

    try{
      const response=await fetch(url,{
        method:"HEAD",
        cache:"no-store",
        credentials:"omit",
        signal:options.signal
      });

      if(response.ok) return false;

      // Treat definitive client/not-found responses as missing.
      if(response.status===404 || response.status===410) return true;

      // Other server responses are not strong enough evidence to delete.
      return false;
    }catch(_){
      // Backend/network may simply be offline. Preserve the record.
      return false;
    }
  }

  function pruneFallbackIndex(src,options={}){
    const key=String(options.fallbackKey||"aster.media.fallback.v1");
    try{
      const current=JSON.parse(localStorage.getItem(key)||"[]");
      const next=(Array.isArray(current)?current:[])
        .filter(item=>item&&item.src!==src);
      localStorage.setItem(key,JSON.stringify(next));
      return true;
    }catch(_){
      return false;
    }
  }

  async function prune(src,options={}){
    src=String(src||"").trim();
    if(!src) return false;

    const missing=await confirmMissing(src,options);
    if(!missing) return false;

    try{
      if(typeof options.deletePrimary==="function"){
        await options.deletePrimary(src);
      }
    }catch(_){}

    pruneFallbackIndex(src,options);

    if(options.element){
      try{
        options.element.hidden=true;
        options.element.setAttribute("aria-hidden","true");
      }catch(_){}
    }

    document.dispatchEvent(new CustomEvent("aster:missing-media-pruned",{
      detail:{src}
    }));

    return true;
  }

  function bind(root=document,options={}){
    if(!root?.addEventListener) return null;

    const onError=async event=>{
      const element=event?.target;
      if(!(element instanceof HTMLImageElement)) return;

      const src=String(element.currentSrc||element.src||"").trim();
      if(!src) return;

      if(typeof options.shouldCheck==="function"){
        try{
          if(!options.shouldCheck(src,element)) return;
        }catch(_){
          return;
        }
      }

      await prune(src,{...options,element});
    };

    root.addEventListener("error",onError,true);
    return {
      destroy(){
        root.removeEventListener("error",onError,true);
      }
    };
  }

  global.AsterMissingMediaPruner={
    confirmMissing,
    pruneFallbackIndex,
    prune,
    bind
  };
})(window);
