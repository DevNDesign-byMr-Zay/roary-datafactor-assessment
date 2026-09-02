export function installAsterSidebarMediaRecovery({root,readMedia,renderMedia,onOpen}={}){
  if(!root||typeof readMedia!=='function'||typeof renderMedia!=='function')return ()=>{};
  let pending=false; const refresh=async()=>{if(pending)return;pending=true;try{renderMedia(await readMedia())}finally{pending=false}};
  const click=e=>{if(e.target.closest?.('[data-aster-media-tab]')){onOpen?.();refresh()}};
  root.addEventListener('click',click); const obs=new MutationObserver(()=>queueMicrotask(refresh));obs.observe(root,{childList:true,subtree:true});refresh();
  return ()=>{root.removeEventListener('click',click);obs.disconnect()};
}
