export function bindAsterMoodTilePreviews(root,{previewFor}={}){
  if(!root||typeof previewFor!=='function')return ()=>{};
  const apply=tile=>{const key=tile.dataset.asterMood; const preview=previewFor(key); if(preview) tile.style.setProperty('--aster-mood-preview',`url("${String(preview).replace(/"/g,'%22')}")`)};
  const refresh=()=>root.querySelectorAll('[data-aster-mood]').forEach(apply); refresh();
  const obs=new MutationObserver(refresh); obs.observe(root,{childList:true,subtree:true}); return ()=>obs.disconnect();
}
