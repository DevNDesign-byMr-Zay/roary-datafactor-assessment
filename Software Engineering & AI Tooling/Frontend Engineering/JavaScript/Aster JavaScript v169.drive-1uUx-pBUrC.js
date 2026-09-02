/* Aster JavaScript v169
Authenticated historical derivative: parallel image-generation fanout against the locked 5151 tool backend.
Historical provider identities are removed; callers supply generic backend labels.
*/
(function(global){
  "use strict";
  if(global.AsterParallelImageGeneration) return;

  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i;

  function normalizeBase(value){
    const base=String(value||"http://127.0.0.1:5151").trim().replace(/\/+$/,"");
    if(!LOCAL_5151.test(base)) throw new Error("Image generation backend must use local port 5151");
    return base;
  }

  function extractImage(payload={}){
    const url=String(
      payload.image_url ||
      payload.images?.[0]?.url ||
      payload.image?.url ||
      payload.url ||
      ""
    ).trim();
    if(url) return url;

    const encoded=String(payload.image_base64||payload.image?.base64||"").trim();
    if(encoded){
      return `data:${payload.mime_type||"image/png"};base64,${encoded}`;
    }
    return "";
  }

  async function callOne(prompt,backend,options={}){
    const response=await fetch(normalizeBase(options.base)+"/image",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials:"omit",
      cache:"no-store",
      signal:options.signal,
      body:JSON.stringify({
        prompt:String(prompt||"").trim(),
        backend:String(backend||"default"),
        width:Number(options.width)||1024,
        height:Number(options.height)||1024,
        num_inference_steps:Number(options.steps)||28
      })
    });

    const payload=await response.json().catch(()=>null);
    if(!payload) throw new Error("Image backend returned non-JSON output");
    if(!response.ok || payload.ok===false){
      throw new Error(String(payload.detail||payload.error||`Image generation failed (${response.status})`));
    }

    const src=extractImage(payload);
    if(!src) throw new Error("Image generation returned no image");
    return {backend:String(backend||"default"),src,payload};
  }

  async function generate(prompt,options={}){
    const text=String(prompt||"").trim();
    if(!text) throw new Error("Prompt is required");

    const backends=Array.from(new Set(
      (Array.isArray(options.backends)?options.backends:["primary","secondary"])
        .map(value=>String(value||"").trim())
        .filter(Boolean)
    ));
    if(!backends.length) throw new Error("At least one backend is required");

    const results=await Promise.all(
      backends.map(backend=>callOne(text,backend,options))
    );

    document.dispatchEvent(new CustomEvent("aster:image-generation-complete",{
      detail:{prompt:text,results}
    }));
    return results;
  }

  global.AsterParallelImageGeneration={
    normalizeBase,
    extractImage,
    callOne,
    generate
  };
})(window);
