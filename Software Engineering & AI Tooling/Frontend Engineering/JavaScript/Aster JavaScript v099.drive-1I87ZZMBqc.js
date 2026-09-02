export function bindAsterRelightControls(root,{onChange}={}){
  if(!root)return ()=>{};
  const mood=()=>root.querySelector('[data-aster-relight-mood].is-active')?.dataset.asterRelightMood||'neutral';
  const level=()=>Number(root.querySelector('[data-aster-relight-level]')?.value??0.5);
  const emit=()=>onChange?.({mood:mood(),level:Math.max(0,Math.min(1,level()))});
  const handler=e=>{ const tile=e.target.closest?.('[data-aster-relight-mood]'); if(tile){root.querySelectorAll('[data-aster-relight-mood]').forEach(n=>n.classList.toggle('is-active',n===tile));} emit(); };
  root.addEventListener('input',handler); root.addEventListener('click',handler); emit();
  return ()=>{root.removeEventListener('input',handler);root.removeEventListener('click',handler)};
}
