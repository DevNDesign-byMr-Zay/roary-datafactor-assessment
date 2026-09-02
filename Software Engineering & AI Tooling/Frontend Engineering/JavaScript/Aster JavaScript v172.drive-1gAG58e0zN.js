/* Aster JavaScript v172
Authenticated historical derivative: status-aware local image-tool endpoint fallthrough.
404/405 means "try the next compatible route"; other HTTP failures preserve the real error.
*/
(function(global){
  "use strict";
  if(global.AsterImageRouteFallback) return;

  function base(value){
    const result=String(value||"http://127.0.0.1:5151").trim().replace(/\/+$/,"");
    if(!/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i.test(result)){
      throw new Error("Image tool backend must use local port 5151");
    }
    return result;
  }

  async function postCompatible(paths,body,options={}){
    const root=base(options.base);
    const routes=Array.from(paths||[]).map(path=>"/"+String(path||"").replace(/^\/+/,""));
    let lastError=null;

    for(const route of routes){
      let response;
      try{
        response=await fetch(root+route,{
          method:"POST",
          body,
          mode:"cors",
          credentials:"omit",
          cache:"no-store",
          signal:options.signal
        });
      }catch(error){
        lastError=error;
        continue;
      }

      if(response.status===404 || response.status===405){
        lastError=new Error(`Route unavailable: ${route}`);
        continue;
      }

      if(!response.ok){
        const detail=await response.text().catch(()=>"");
        throw new Error(detail || `Image tool failed (${response.status})`);
      }

      return {route,response};
    }

    throw lastError || new Error("No compatible image-tool route responded");
  }

  function removalOrder(hasMask){
    return hasMask
      ? ["/tool/erase","/tool/remove","/tool/inpaint_remove"]
      : ["/tool/remove","/tool/erase","/tool/inpaint_remove"];
  }

  global.AsterImageRouteFallback={base,postCompatible,removalOrder};
})(window);
