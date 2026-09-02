/* Aster JavaScript v121
Authenticated historical derivative: debounced, abortable, cached relight previews on the locked local backend.
*/
(function(global){
  'use strict';
  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151(?:\/|$)/i;
  const cache=new Map(); let timer=0, inflight=null;
  function base(options={}){const v=String(options.baseUrl||global.__asterToolBackendBase||'http://127.0.0.1:5151').replace(/\/+$/,'');if(!LOCAL_5151.test(v+'/'))throw new Error('Image backend must use localhost port 5151');return v;}
  function resultUrl(p={}){return p.images?.[0]?.url||p.image?.url||p.result?.url||p.url||'';}
  function preview(options={}){
    const mood=String(options.mood||'Neutral'), level=Number(options.level)||0, image=String(options.imageDataUrl||'');
    if(!/^data:image\//i.test(image)) return Promise.reject(new Error('Preview input must be a local image data URL'));
    const key=[image.length,image.slice(-64),mood,level].join('|'); if(cache.has(key)) return Promise.resolve(cache.get(key));
    clearTimeout(timer);
    return new Promise((resolve,reject)=>{timer=setTimeout(async()=>{try{
      inflight?.abort?.(); inflight=new AbortController(); const fd=new FormData(); fd.set('image_data_url',image); fd.set('mood',mood); fd.set('level',String(level));
      const r=await fetch(`${base(options)}/tool/relight_preview`,{method:'POST',body:fd,mode:'cors',credentials:'omit',cache:'no-store',signal:inflight.signal});
      const p=await r.json().catch(()=>({})); if(!r.ok||p.ok===false)throw new Error(p.detail||p.error||`Preview failed (${r.status})`);
      const url=resultUrl(p); if(url)cache.set(key,url); resolve(url);
    }catch(e){reject(e);}},Math.max(0,Number(options.debounceMs)||180));});
  }
  global.AsterRelightPreview={preview,clearCache:()=>cache.clear()};
})(window);
