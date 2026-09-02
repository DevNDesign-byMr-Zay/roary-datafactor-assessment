export function installAsterStickyExecute({panel,button,offset=0}={}){
  if(!panel||!button) return ()=>{};
  const sync=()=>{ const r=panel.getBoundingClientRect(); button.style.setProperty('--aster-sticky-width',`${Math.max(0,r.width)}px`); button.style.setProperty('--aster-sticky-offset',`${offset}px`); };
  const ro=new ResizeObserver(sync); ro.observe(panel); window.addEventListener('resize',sync,{passive:true}); sync();
  return ()=>{ro.disconnect();window.removeEventListener('resize',sync)};
}
