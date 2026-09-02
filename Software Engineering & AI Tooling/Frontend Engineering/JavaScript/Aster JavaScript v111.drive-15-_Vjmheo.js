export function normalizeAsterMediaSrc(src,base=location.href){
  let s=String(src||'').trim(); s=s.replace(/^file:\/{2,}.*?(?=(?:data:image\/|blob:))/i,''); s=s.replace(/^\.\/(?=(?:data:image\/|blob:))/i,'');
  if(/^(?:data:image\/|blob:|https?:)/i.test(s))return s; try{return new URL(s,base).href}catch{return s}
}
export function pruneAsterMediaItems(items,{limit=120}={}){
  const out=[],seen=new Set(); for(const item of items||[]){const src=normalizeAsterMediaSrc(item?.src||item?.url||'');if(!src||seen.has(src))continue;seen.add(src);out.push({...item,src});}
  return out.slice(-Math.max(1,limit));
}
