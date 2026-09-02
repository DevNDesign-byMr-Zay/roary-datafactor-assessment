/* Aster JavaScript v125
Authenticated historical derivative: bounded expand-frame dragging/resizing using pointer capture and direct frame coordinates.
*/
(function(global){
  'use strict';
  function install(frame,options={}){
    if(!(frame instanceof HTMLElement)||frame.dataset.asterDragInstalled==='1')return null;frame.dataset.asterDragInstalled='1';
    let active=null; const min=Math.max(16,Number(options.minSize)||32), max=Math.max(min,Number(options.maxSide)||11200);
    const down=e=>{const h=e.target.closest?.('[data-edge],[data-corner]');active={id:e.pointerId,mode:h?.dataset.edge||h?.dataset.corner||'move',x:e.clientX,y:e.clientY,l:frame.offsetLeft,t:frame.offsetTop,w:frame.offsetWidth,h:frame.offsetHeight};try{frame.setPointerCapture(e.pointerId);}catch{}e.preventDefault();};
    const move=e=>{if(!active||e.pointerId!==active.id)return;const dx=e.clientX-active.x,dy=e.clientY-active.y;let {l,t,w,h}=active;const m=active.mode.toLowerCase();if(m==='move'){l+=dx;t+=dy;}else{if(m.includes('w')){l+=dx;w-=dx;}if(m.includes('e'))w+=dx;if(m.includes('n')){t+=dy;h-=dy;}if(m.includes('s'))h+=dy;}w=Math.max(min,Math.min(max,w));h=Math.max(min,Math.min(max,h));Object.assign(frame.style,{left:`${l}px`,top:`${t}px`,width:`${w}px`,height:`${h}px`});options.onChange?.(frame);e.preventDefault();};
    const up=e=>{if(!active||e.pointerId!==active.id)return;try{frame.releasePointerCapture(e.pointerId);}catch{}active=null;};
    frame.addEventListener('pointerdown',down,true);document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);return()=>{frame.removeEventListener('pointerdown',down,true);document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);};
  }
  global.AsterExpandDrag={install};
})(window);
