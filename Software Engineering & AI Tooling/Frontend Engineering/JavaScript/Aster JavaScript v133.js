/* Aster JavaScript v133
Authenticated historical derivative: outward-only expansion constraint and padding projection.
*/
(function(global){
  'use strict';
  function constrain(frame,image){const pr=global.AsterExpandAnchor?.paintedRect?.(image);if(!pr||!(frame instanceof HTMLElement))return null;const r=frame.getBoundingClientRect(),shell=frame.offsetParent?.getBoundingClientRect?.()||{left:0,top:0};let left=Math.min(r.left,pr.left),top=Math.min(r.top,pr.top),right=Math.max(r.right,pr.right),bottom=Math.max(r.bottom,pr.bottom);Object.assign(frame.style,{left:`${left-shell.left}px`,top:`${top-shell.top}px`,width:`${right-left}px`,height:`${bottom-top}px`});return pads(frame,image);}
  function pads(frame,image){const pr=global.AsterExpandAnchor?.paintedRect?.(image);if(!pr)return null;const fr=frame.getBoundingClientRect();return{left:Math.max(0,Math.round((pr.left-fr.left)*pr.scaleX)),right:Math.max(0,Math.round((fr.right-pr.right)*pr.scaleX)),top:Math.max(0,Math.round((pr.top-fr.top)*pr.scaleY)),bottom:Math.max(0,Math.round((fr.bottom-pr.bottom)*pr.scaleY))};}
  global.AsterOutwardExpand={constrain,pads};
})(window);
