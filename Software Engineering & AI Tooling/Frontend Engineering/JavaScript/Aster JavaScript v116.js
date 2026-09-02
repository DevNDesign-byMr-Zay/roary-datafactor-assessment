/** Aster JavaScript v116 — blob-safe Save Variant persistence and post-execution re-ingestion. */
(function (global) {
  'use strict';
  function blobToDataURL(blob) { return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(String(r.result||'')); r.onerror=()=>reject(r.error); r.readAsDataURL(blob); }); }
  async function persistentVariantSrc(src, alias) {
    const s=String(src||'').trim(); if(!s) return '';
    if(/^data:image\//i.test(s)||/^https?:\/\//i.test(s)) return s;
    if(!/^blob:/i.test(s)) return '';
    const a=String(alias||'').trim(); if(a&&!/^blob:/i.test(a)&&!/^file:/i.test(a)) return a;
    try{ const response=await fetch(s); if(!response.ok) return ''; return await blobToDataURL(await response.blob()); }catch(_){ return ''; }
  }
  function wrapStore(store, resolveAlias) {
    if(typeof store!=='function') throw new TypeError('store callback required');
    return async function(src, meta) { const persistent=await persistentVariantSrc(src, typeof resolveAlias==='function'?resolveAlias(src,meta):''); if(!persistent) return null; return store(persistent,meta||{}); };
  }
  function reingestVisible(root, save, metaForImage) {
    const target=root||document, tasks=[];
    target.querySelectorAll('img').forEach(img=>{ const src=img.currentSrc||img.src||''; if(!src||(img.naturalWidth&&img.naturalWidth<96)) return; tasks.push(save(src,{kind:'variation',...(typeof metaForImage==='function'?metaForImage(img):{})})); });
    return Promise.allSettled(tasks);
  }
  global.AsterVariantPersistence = { persistentVariantSrc, wrapStore, reingestVisible };
})(window);
