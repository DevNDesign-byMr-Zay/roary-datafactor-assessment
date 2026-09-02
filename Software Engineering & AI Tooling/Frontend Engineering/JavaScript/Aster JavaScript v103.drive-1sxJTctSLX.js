export function getAsterActiveImage(root=document){
  const all=[
    root.querySelector?.('[data-aster-lightbox-image]'),
    root.querySelector?.('[data-aster-active-image]'),
    root.querySelector?.('[aria-current="true"] img'),
    root.querySelector?.('.is-active img'),
  ].filter(Boolean);
  for(const img of all){ if(img.currentSrc||img.src||img.dataset?.originalSrc) return img; }
  return null;
}
export function observeAsterActiveImage(callback, root=document){
  const img=getAsterActiveImage(root); if(!img) return ()=>{};
  const fire=()=>callback?.(img,img.currentSrc||img.src||img.dataset?.originalSrc||'');
  const mo=new MutationObserver(fire); mo.observe(img,{attributes:true,attributeFilter:['src']}); img.addEventListener('load',fire,{passive:true}); fire();
  return ()=>mo.disconnect();
}
