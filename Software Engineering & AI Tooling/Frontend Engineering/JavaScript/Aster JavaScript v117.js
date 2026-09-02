/** Aster JavaScript v117 — deep thread/media recovery; merges even when the media library is non-empty. */
(function (global) {
  'use strict';
  const IMG_TOKEN=/(?:data:image\/[^\s"')>]+|https?:\/\/[^\s"')>]+|blob:[^\s"')>]+)/ig;
  function normalize(value) { let s=String(value||'').trim().replace(/^["']|["']$/g,''); if(!s||/^(?:undefined|null)$/i.test(s)||/^blob:null/i.test(s)) return ''; const i=s.indexOf('data:image'); if(i>0)s=s.slice(i); if(/^(?:png|jpe?g|webp|gif);base64,/i.test(s))s='data:image/'+s; return /^(?:data:image\/|https?:\/\/|blob:)/i.test(s)?s:''; }
  function extract(value, out, depth) {
    if(depth>8||value==null) return;
    if(typeof value==='string'){ const direct=normalize(value); if(direct)out.add(direct); for(const m of value.match(IMG_TOKEN)||[]){ const s=normalize(m); if(s)out.add(s); } const md=/!\[[^\]]*\]\(([^)]+)\)/g; let x; while((x=md.exec(value))){const s=normalize(x[1]);if(s)out.add(s);} const html=/<img\b[^>]*\bsrc=["']([^"']+)["']/gi; while((x=html.exec(value))){const s=normalize(x[1]);if(s)out.add(s);} return; }
    if(Array.isArray(value)){ for(const v of value)extract(v,out,depth+1); return; }
    if(typeof value==='object'){ for(const v of Object.values(value))extract(v,out,depth+1); }
  }
  async function reconcile(threads, existingItems, upsert) {
    if(typeof upsert!=='function') throw new TypeError('upsert callback required');
    const existing=new Map((Array.isArray(existingItems)?existingItems:[]).map(it=>[normalize(it?.src),it]).filter(x=>x[0])); let writes=0;
    for(const thread of (Array.isArray(threads)?threads:[])) { const refs=new Set(); extract(thread,refs,0); const list=[...refs]; const root=list[0]||null; for(let i=0;i<list.length;i++){ const src=list[i], prior=existing.get(src)||{}; await upsert(src,{...prior,threadId:thread?.id||prior.threadId||null,parentSrc:i?root:null,kind:i?'variation':'generation'}); writes++; } }
    return writes;
  }
  function watchVariationSources(root, onSource) { const target=root||document.body; const notify=el=>{if(el?.tagName==='IMG'){const s=normalize(el.currentSrc||el.src);if(s)onSource(s,el);}}; const obs=new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='attributes')notify(m.target); m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;notify(n);n.querySelectorAll?.('img').forEach(notify);});})); obs.observe(target,{subtree:true,childList:true,attributes:true,attributeFilter:['src']}); return ()=>obs.disconnect(); }
  global.AsterDeepMediaRecovery = { normalize, extract, reconcile, watchVariationSources };
})(window);
