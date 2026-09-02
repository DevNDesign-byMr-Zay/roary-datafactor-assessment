/* Aster JavaScript v131
Authenticated historical derivative: eight-handle expansion frame controller.
*/
(function(global){
  'use strict';
  const points=['n','ne','e','se','s','sw','w','nw'];
  function install(frame,onChange){
    if(!(frame instanceof HTMLElement)) return null;
    if(!frame.querySelector('[data-aster-expand-handle]')) for(const p of points){const h=document.createElement('button');h.type='button';h.dataset.asterExpandHandle=p;h.setAttribute('aria-label',`Resize ${p}`);frame.appendChild(h);}
    let st=null;
    const down=e=>{const h=e.target.closest?.('[data-aster-expand-handle]');if(!h)return;st={id:e.pointerId,p:h.dataset.asterExpandHandle,x:e.clientX,y:e.clientY,l:frame.offsetLeft,t:frame.offsetTop,w:frame.offsetWidth,h:frame.offsetHeight};h.setPointerCapture?.(e.pointerId);e.preventDefault();e.stopPropagation();};
    const move=e=>{if(!st||e.pointerId!==st.id)return;let dx=e.clientX-st.x,dy=e.clientY-st.y,{l,t,w,h}=st,p=st.p;if(p.includes('w')){l+=dx;w-=dx}if(p.includes('e'))w+=dx;if(p.includes('n')){t+=dy;h-=dy}if(p.includes('s'))h+=dy;w=Math.max(48,w);h=Math.max(48,h);Object.assign(frame.style,{left:`${l}px`,top:`${t}px`,width:`${w}px`,height:`${h}px`});onChange?.(frame);e.preventDefault();};
    const up=e=>{if(st&&e.pointerId===st.id)st=null;};
    frame.addEventListener('pointerdown',down,true);window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);
    return()=>{frame.removeEventListener('pointerdown',down,true);window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);};
  }
  global.AsterExpandHandles={install};
})(window);
