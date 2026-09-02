export function installAsterMediaSlotSwap(root,{defaultSrc,hoverSrc}={}){
  const img=root?.querySelector?.('[data-aster-core-image]');if(!root||!img)return ()=>{};
  const enter=()=>{if(hoverSrc)img.src=hoverSrc;root.classList.add('is-hover')};const leave=()=>{if(defaultSrc)img.src=defaultSrc;root.classList.remove('is-hover')};
  root.addEventListener('pointerenter',enter);root.addEventListener('pointerleave',leave);return()=>{root.removeEventListener('pointerenter',enter);root.removeEventListener('pointerleave',leave)};
}
