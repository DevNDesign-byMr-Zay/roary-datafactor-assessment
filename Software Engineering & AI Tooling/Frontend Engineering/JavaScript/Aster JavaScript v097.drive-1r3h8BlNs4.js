const PREVIEW_ATTR='data-aster-relight-preview';
export function installAsterRelightPreview({image,moodControl,intensityControl,filterFor}){
  if(!image||typeof filterFor!=='function') return ()=>{};
  const original=image.style.filter;
  const update=()=>{ const mood=moodControl?.value||moodControl?.dataset?.mood||'neutral'; const intensity=Number(intensityControl?.value??0.5); image.setAttribute(PREVIEW_ATTR,'1'); image.style.filter=filterFor(mood,intensity); };
  moodControl?.addEventListener('input',update); intensityControl?.addEventListener('input',update); update();
  return ()=>{ moodControl?.removeEventListener('input',update); intensityControl?.removeEventListener('input',update); image.style.filter=original; image.removeAttribute(PREVIEW_ATTR); };
}
