export function preserveAsterMessageUi(render){
  if(typeof render!=='function') throw new TypeError('render function required');
  return function stableRender(message,...rest){
    const anchor=document.activeElement; const scrollers=Array.from(document.querySelectorAll('[data-aster-preserve-scroll]')).map(el=>[el,el.scrollTop]);
    const out=render.call(this,message,...rest);
    queueMicrotask(()=>{ scrollers.forEach(([el,y])=>{if(el.isConnected)el.scrollTop=y}); if(anchor?.isConnected) anchor.focus?.({preventScroll:true}); });
    return out;
  };
}
