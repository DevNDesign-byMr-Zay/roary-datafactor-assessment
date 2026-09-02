/** Aster JavaScript v118 — metadata reconciliation for generation/variation groups. */
(function (global) {
  'use strict';
  async function reconcileGroups(threads, existingItems, upsert, normalize) {
    if(typeof upsert!=='function') throw new TypeError('upsert callback required');
    const norm=typeof normalize==='function'?normalize:(v=>String(v||'').trim());
    const seen=new Set((Array.isArray(existingItems)?existingItems:[]).map(it=>norm(it?.src)).filter(Boolean)); let changed=0;
    for(const thread of (Array.isArray(threads)?threads:[])) {
      const bag=[]; if(Array.isArray(thread?.images))bag.push(...thread.images); for(const key of ['latestSrc','src','image','imageUrl'])if(thread?.[key])bag.push(thread[key]);
      const uniq=[...new Set(bag.map(norm).filter(Boolean))]; if(!uniq.length)continue; const root=uniq[0];
      for(let i=0;i<uniq.length;i++){ const src=uniq[i]; await upsert(src,{threadId:thread?.id||null,parentSrc:i?root:null,kind:i?'variation':'generation'}); if(!seen.has(src)){seen.add(src);changed++;} }
    }
    return changed;
  }
  function variationCount(group) { return Math.max(0,(Array.isArray(group?.items)?group.items.length:0)-1); }
  global.AsterMediaMetadataRepair = { reconcileGroups, variationCount };
})(window);
