/* Aster JavaScript v160
Authenticated historical derivative: localStorage media fallback and conversation-derived reconstruction.
Used when a primary media database is blocked, slow, or unavailable.
*/
(function(global){
  "use strict";
  if(global.AsterMediaStorageFallback) return;

  function safeJSON(value,fallback){
    try{
      const parsed=JSON.parse(String(value||""));
      return parsed===null||parsed===undefined ? fallback : parsed;
    }catch(_){
      return fallback;
    }
  }

  function normalizeSource(value){
    return typeof value==="string" ? value.trim() : "";
  }

  function scan(options={}){
    const conversationsKey=String(options.conversationsKey||"aster.conversations");
    const fallbackKey=String(options.fallbackKey||"aster.media.fallback.v1");
    const out=[];
    const seen=new Set();

    function add(src,ts){
      src=normalizeSource(src);
      if(!src||seen.has(src)) return;
      seen.add(src);
      out.push({src,ts:Number(ts)||Date.now()});
    }

    const conversations=safeJSON(localStorage.getItem(conversationsKey),[]);
    if(Array.isArray(conversations)){
      for(const thread of conversations){
        if(!thread||typeof thread!=="object") continue;

        add(thread.latestSrc,thread.updatedAt||thread.ts);

        const images=Array.isArray(thread.images)?thread.images:[];
        for(const item of images){
          add(
            typeof item==="string"
              ? item
              : item?.url||item?.src,
            thread.updatedAt||thread.ts||item?.ts
          );
        }
      }
    }

    const fallback=safeJSON(localStorage.getItem(fallbackKey),[]);
    if(Array.isArray(fallback)){
      for(const item of fallback){
        add(item?.src,item?.ts);
      }
    }

    out.sort((a,b)=>(b.ts||0)-(a.ts||0));
    return out;
  }

  function remember(src,options={}){
    src=normalizeSource(src);
    if(!src) return false;

    const fallbackKey=String(options.fallbackKey||"aster.media.fallback.v1");
    const max=Math.max(1,Number(options.max)||600);
    const current=safeJSON(localStorage.getItem(fallbackKey),[]);
    const now=Date.now();

    const next=[
      {src,ts:now},
      ...((Array.isArray(current)?current:[]).filter(item=>item?.src!==src))
    ].slice(0,max);

    try{
      localStorage.setItem(fallbackKey,JSON.stringify(next));
      return true;
    }catch(_){
      return false;
    }
  }

  function createWriter(primaryWrite,options={}){
    let primaryFailed=!!options.primaryFailed;

    async function write(src,item){
      if(primaryFailed){
        return remember(src,options);
      }

      if(typeof primaryWrite!=="function"){
        primaryFailed=true;
        return remember(src,options);
      }

      try{
        const result=await primaryWrite(src,item);
        if(result===false){
          primaryFailed=true;
          return remember(src,options);
        }
        return true;
      }catch(error){
        primaryFailed=true;
        remember(src,options);
        document.dispatchEvent(new CustomEvent("aster:media-storage-fallback",{
          detail:{src,error:String(error?.message||error||"")}
        }));
        return true;
      }
    }

    return {
      write,
      useFallback(){ primaryFailed=true; },
      restorePrimary(){ primaryFailed=false; },
      get primaryFailed(){ return primaryFailed; }
    };
  }

  global.AsterMediaStorageFallback={
    safeJSON,
    scan,
    remember,
    createWriter
  };
})(window);
