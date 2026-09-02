/* Aster JavaScript v100
Authenticated historical derivative: JSON-body image edit transport to avoid multipart part-count limits.
Image and mask values are serialized as data URLs; local backend is locked to port 5151.
*/
(function(){
  "use strict";
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  const dataUrl=blob=>new Promise((resolve,reject)=>{if(!(blob instanceof Blob))return resolve('');const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('File read failed'));r.readAsDataURL(blob);});
  function base(options={}){const value=String(options.baseUrl||window.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');if(!LOCAL_5151.test(value+'/'))throw new Error('Image backend must use localhost port 5151');return value;}
  async function run(options={}){
    const image=options.image instanceof Blob?await dataUrl(options.image):String(options.imageUrl||''); if(!image)throw new Error('image is required');
    const body={prompt:String(options.prompt||''),mode:String(options.mode||'edit'),image_url:image};
    if(options.mask instanceof Blob) body.mask_data_url=await dataUrl(options.mask); else if(options.maskDataUrl) body.mask_data_url=String(options.maskDataUrl);
    if(Array.isArray(options.references)&&options.references.length){body.reference_images=[];for(const ref of options.references){if(ref instanceof Blob)body.reference_images.push({data:await dataUrl(ref),mime_type:ref.type||'application/octet-stream'});else if(ref&&ref.data)body.reference_images.push(ref);}}
    if(options.variantsMeta) body.variants_meta=options.variantsMeta;
    const response=await fetch(`${base(options)}/tool/image_edit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),mode:'cors',credentials:'omit',cache:'no-store'});
    const payload=await response.json().catch(()=>({})); if(!response.ok||payload.ok===false)throw new Error(payload.detail||payload.error||`Image edit failed (${response.status})`);
    return payload.images?.[0]?.url||payload.image?.url||payload.result?.url||payload.url||'';
  }
  window.runAsterJsonImageEdit=run;
})();
