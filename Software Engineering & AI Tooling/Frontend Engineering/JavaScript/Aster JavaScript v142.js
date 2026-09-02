/* Aster JavaScript v142
Authenticated historical derivative: expansion glow synchronization and side-panel accessibility repair.
*/
(function(global){
  'use strict';
  function syncGlow(frame,image,glow){if(!(frame instanceof HTMLElement)||!(image instanceof HTMLImageElement)||!(glow instanceof HTMLElement))return;const fr=frame.getBoundingClientRect(),ir=image.getBoundingClientRect();const x=Math.max(0,ir.left-fr.left),y=Math.max(0,ir.top-fr.top);glow.style.clipPath=`polygon(0 0,100% 0,100% 100%,0 100%,0 ${y}px,${x}px ${y}px,${x}px ${y+ir.height}px,${x+ir.width}px ${y+ir.height}px,${x+ir.width}px ${y}px,0 ${y}px)`;}
  function fixPanel(panel){if(!(panel instanceof HTMLElement))return;panel.setAttribute('role',panel.getAttribute('role')||'dialog');panel.setAttribute('aria-modal','false');if(panel.hidden)panel.setAttribute('aria-hidden','true');else panel.removeAttribute('aria-hidden');}
  global.AsterExpandAccessibility={syncGlow,fixPanel};
})(window);
