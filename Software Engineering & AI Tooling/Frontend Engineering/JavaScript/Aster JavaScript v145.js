/* Aster JavaScript v145
Authenticated historical derivative: standalone remove/erase transport for local/file-hosted UIs, locked to port 5151.
*/
(function(global){
  'use strict';
  const BASE='http://127.0.0.1:5151';
  function outputUrl(p={}){return p.images?.[0]?.url||p.image?.url||p.result?.url||p.url||'';}
  async function run(options={}){const image=options.imageBlob,mask=options.maskBlob;if(!(image instanceof Blob)||!(mask instanceof Blob))throw new Error('Image and mask blobs are required');const fd=await global.AsterRemovePayload.build({imageBlob:image,maskBlob:mask,prompt:options.prompt,quality:options.quality,maskExpansion:options.maskExpansion});const r=await fetch(`${BASE}/tool/remove`,{method:'POST',body:fd,mode:'cors',credentials:'omit',cache:'no-store'});const p=await r.json().catch(()=>({}));if(!r.ok||p.ok===false)throw new Error(p.detail||p.error||`Remove failed (${r.status})`);return{payload:p,url:outputUrl(p)};}
  global.AsterRemoveTransport={base:BASE,run};
})(window);
