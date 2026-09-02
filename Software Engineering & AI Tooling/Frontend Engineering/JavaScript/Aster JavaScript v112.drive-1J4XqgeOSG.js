/** Aster JavaScript v112 — IndexedDB media-library resync and persistent generated-image ingestion. */
(function (global) {
  'use strict';
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || '')); r.onerror = () => reject(r.error); r.readAsDataURL(blob); });
  }
  async function persistentSrc(src) {
    const s = String(src || '').trim();
    if (/^data:image\//i.test(s) || /^https?:\/\//i.test(s)) return s;
    if (/^blob:/i.test(s)) { try { const r = await fetch(s); if (!r.ok) return ''; return await blobToDataURL(await r.blob()); } catch (_) { return ''; } }
    return '';
  }
  function createMediaResync(options) {
    const o = options || {}, dbName = o.dbName || 'aster_media_library_v1', storeName = o.storeName || 'items';
    let dbPromise;
    function db() { if (dbPromise) return dbPromise; dbPromise = new Promise((resolve,reject)=>{ const r=indexedDB.open(dbName,1); r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains(storeName)){ const s=r.result.createObjectStore(storeName,{keyPath:'id'}); s.createIndex('src','src',{unique:true}); } }; r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); }); return dbPromise; }
    async function list(limit) { const d=await db(); return new Promise(resolve=>{ const out=[]; const req=d.transaction(storeName,'readonly').objectStore(storeName).openCursor(null,'prev'); req.onsuccess=()=>{ const c=req.result; if(!c||out.length>=(limit||120)) return resolve(out); out.push(c.value); c.continue(); }; req.onerror=()=>resolve(out); }); }
    async function upsert(item) { const src=await persistentSrc(item && item.src); if(!src) return false; const d=await db(); return new Promise(resolve=>{ const tx=d.transaction(storeName,'readwrite'); tx.objectStore(storeName).put({...item,id:item.id||('media-'+Date.now()+'-'+Math.random().toString(36).slice(2)),src,ts:item.ts||Date.now()}); tx.oncomplete=()=>resolve(true); tx.onerror=()=>resolve(false); }); }
    function watch(root, metaForImage) { const target=root||document.body; const seen=new Set(); const scan=()=>{ target.querySelectorAll('img').forEach(img=>{ const src=img.currentSrc||img.src||''; if(!src||seen.has(src)||(img.naturalWidth&&img.naturalWidth<96)) return; seen.add(src); upsert({src,...(typeof metaForImage==='function'?metaForImage(img):{})}); }); }; scan(); const obs=new MutationObserver(scan); obs.observe(target,{subtree:true,childList:true,attributes:true,attributeFilter:['src']}); return ()=>obs.disconnect(); }
    return { list, upsert, watch, persistentSrc };
  }
  global.AsterMediaResync = { createMediaResync };
})(window);
