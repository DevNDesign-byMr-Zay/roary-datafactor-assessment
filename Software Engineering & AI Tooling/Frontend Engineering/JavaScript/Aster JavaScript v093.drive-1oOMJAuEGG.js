/* Aster JavaScript v093
Authenticated historical derivative: expansion executes only against the local image backend; no generic router fallback.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  function getBase(options={}){
    const value=String(options.baseUrl||window.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');
    if(!LOCAL_5151.test(value+'/')) throw new Error('Expand backend must use localhost port 5151');
    return value;
  }
  async function expand(formData,options={}){
    if(!(formData instanceof FormData)) throw new TypeError('formData must be FormData');
    const response=await fetch(`${getBase(options)}/tool/expand`,{method:'POST',body:formData,mode:'cors',credentials:'omit',cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.ok===false) throw new Error(payload.detail||payload.error||`Expand failed (${response.status})`);
    const url=payload.images?.[0]?.url||payload.image?.url||payload.output?.[0]?.url||payload.result?.url||'';
    if(!url) throw new Error('Expand backend returned no image');
    return url;
  }
  window.runAsterExpandLocalOnly=expand;
})();
