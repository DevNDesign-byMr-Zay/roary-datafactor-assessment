export function readAsterRelightUi(root=document){
  const mood=root.querySelector?.('[data-aster-mood].is-active')?.getAttribute('data-aster-mood') || root.querySelector?.('[data-aster-mood-value]')?.textContent || 'neutral';
  const raw=root.querySelector?.('[data-aster-intensity]')?.value ?? 0.5; const intensity=Math.max(0,Math.min(1,Number(raw)));
  return {mood:String(mood).trim().toLowerCase(),level:Number.isFinite(intensity)?intensity:0.5};
}
export function writeAsterRelightUi(root,state={}){ root.querySelectorAll?.('[data-aster-mood]').forEach(el=>el.classList.toggle('is-active',el.getAttribute('data-aster-mood')===state.mood)); const input=root.querySelector?.('[data-aster-intensity]'); if(input&&state.level!=null) input.value=String(state.level); }
