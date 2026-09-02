/* Aster JavaScript v124
Authenticated historical derivative: strict local image-tool request guard with a fixed port-5151 backend.
*/
(function(global){
  'use strict';
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  const ALLOWED=new Set(['remove','erase','inpaint','expand','expand_canvas','outpaint','relight','relight_preview','image_edit','edit']);
  function base(options={}){const v=String(options.baseUrl||global.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');if(!LOCAL_5151.test(v+'/'))throw new Error('Image backend must use localhost port 5151');return v;}
  async function run(tool,formData,options={}){tool=String(tool||'').trim();if(!ALLOWED.has(tool))throw new Error('Unsupported local image tool');if(!(formData instanceof FormData))throw new TypeError('formData must be FormData');const r=await fetch(`${base(options)}/tool/${tool}`,{method:'POST',body:formData,mode:'cors',credentials:'omit',cache:'no-store'});const p=await r.json().catch(()=>({}));if(!r.ok||p.ok===false)throw new Error(p.detail||p.error||`Tool failed (${r.status})`);return p;}
  global.AsterLocalToolRequest={run};
})(window);
