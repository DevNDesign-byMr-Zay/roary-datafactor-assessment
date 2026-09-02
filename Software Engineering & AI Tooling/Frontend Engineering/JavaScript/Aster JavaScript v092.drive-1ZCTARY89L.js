/* Aster JavaScript v092
Authenticated historical derivative: local image-edit backend first with an optional host-supplied fallback.
Provider identities, credentials, direct provider URLs, and product-specific names removed.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function base(options={}){
    const value=String(options.baseUrl||window.__asterToolBackendBase||"http://127.0.0.1:5151").replace(/\/+$/,'');
    if(!LOCAL_5151.test(value+'/')) throw new Error('Image backend must use localhost port 5151');
    return value;
  }
  function resultUrl(payload={}){
    return payload.images?.[0]?.url||payload.image?.url||payload.output?.[0]?.url||payload.result?.url||payload.url||'';
  }
  async function run(formData, options={}){
    if(!(formData instanceof FormData)) throw new TypeError('formData must be FormData');
    const response=await fetch(`${base(options)}/tool/image_edit`,{method:'POST',body:formData,mode:'cors',credentials:'omit',cache:'no-store'}).catch(()=>null);
    if(response){
      const payload=await response.json().catch(()=>({}));
      const url=response.ok ? resultUrl(payload) : '';
      if(url) return url;
      if(response.status!==404 && response.status!==405) throw new Error(payload.detail||payload.error||`Image edit failed (${response.status})`);
    }
    if(typeof options.fallback==='function') return await options.fallback(formData);
    throw new Error('Image edit backend unavailable');
  }
  window.runAsterImageEdit=run;
})();
