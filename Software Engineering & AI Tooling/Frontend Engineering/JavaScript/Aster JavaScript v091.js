/* Aster JavaScript v091
Authenticated historical derivative: specialized relight endpoint first, generic relight fallback.
Backend base is locked to localhost/127.0.0.1 port 5151. Historical unrelated 5055/5152 rewrites are excluded.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;

  function backendBase(options={}){
    const raw=String(options.baseUrl || window.__asterToolBackendBase || "http://127.0.0.1:5151").replace(/\/+$/,"");
    if(!LOCAL_5151.test(raw+"/")) throw new Error("Aster relight backend must use localhost port 5151");
    return raw;
  }

  async function postTool(base,tool,formData){
    const route=String(tool || "").replace(/^\/+/,"");
    const response=await fetch(`${base}/tool/${route}`,{
      method:"POST",
      body:formData,
      mode:"cors",
      credentials:"omit",
      cache:"no-store"
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok || payload.ok===false){
      throw new Error(payload.detail || payload.error || `Tool failed (${response.status})`);
    }
    const imageUrl=payload.images?.[0]?.url || payload.image?.url || payload.output?.[0]?.url || payload.result?.url || "";
    if(!imageUrl) throw new Error("No image returned");
    return imageUrl;
  }

  async function runRelight(formData,options={}){
    if(!(formData instanceof FormData)) throw new TypeError("formData must be FormData");
    const base=backendBase(options);
    const primary=String(options.primaryTool || "relight_v2").replace(/^\/+/,"");
    const fallback=String(options.fallbackTool || "relight").replace(/^\/+/,"");
    try{
      return await postTool(base,primary,formData);
    }catch(primaryError){
      if(!fallback || fallback===primary) throw primaryError;
      return await postTool(base,fallback,formData);
    }
  }

  window.runAsterRelight=runRelight;
})();
