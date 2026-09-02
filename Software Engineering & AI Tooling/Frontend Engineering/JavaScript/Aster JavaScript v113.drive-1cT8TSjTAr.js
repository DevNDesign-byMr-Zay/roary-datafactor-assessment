/** Aster JavaScript v113 — recover known media references from conversation history. */
(function (global) {
  'use strict';
  const IMAGE_RE = /(?:data:image\/[^\s"')>]+|https?:\/\/[^\s"')>]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s"')>]*)?)/ig;
  function knownRefs(thread) {
    const out=[];
    if (Array.isArray(thread && thread.images)) out.push(...thread.images);
    for (const key of ['latestSrc','src','image','imageUrl','image_url']) if (thread && typeof thread[key]==='string') out.push(thread[key]);
    for (const m of (Array.isArray(thread && thread.messages)?thread.messages:[])) {
      for (const key of ['src','image','imageUrl','image_url']) if (typeof m?.[key]==='string') out.push(m[key]);
      const text=String(m?.content||m?.text||''); out.push(...(text.match(IMAGE_RE)||[]));
    }
    return [...new Set(out.map(v=>String(v||'').trim()).filter(v=>v&&!/^blob:null/i.test(v)))];
  }
  async function recover(threads, upsert, options) {
    if (typeof upsert !== 'function') throw new TypeError('upsert callback required');
    const cap=Math.max(1,Number(options?.cap)||300), seen=new Set(); let count=0;
    for (const thread of (Array.isArray(threads)?threads:[])) {
      const refs=knownRefs(thread), root=refs[0]||null;
      for (let i=0;i<refs.length && count<cap;i++) { const src=refs[i]; if(seen.has(src)) continue; seen.add(src); await upsert(src,{threadId:thread?.id||null,title:thread?.title||'',kind:i?'variation':'generation',parentSrc:i?root:null,ts:thread?.ts||Date.now()}); count++; }
      if(count>=cap) break;
    }
    return count;
  }
  global.AsterThreadMediaRecovery = { knownRefs, recover };
})(window);
