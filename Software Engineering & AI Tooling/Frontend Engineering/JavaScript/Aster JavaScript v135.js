/* Aster JavaScript v135
Authenticated historical derivative: resilient active-image-shell resolution for modal, carousel, or stage contexts.
*/
(function(global){
  'use strict';
  const selectors=['[data-aster-stage].is-active img','[data-aster-carousel] [aria-current="true"] img','[data-aster-modal][open] img','[data-aster-modal].is-open img','img[data-aster-active-image]'];
  function image(root=document){for(const s of selectors){const el=root.querySelector(s);if(el&&!el.hidden&&el.getClientRects().length)return el}return null;}
  function shell(root=document){const im=image(root);return im?.closest?.('[data-aster-image-shell],[data-aster-stage],[data-aster-modal]')||im?.parentElement||null;}
  function watch(callback,root=document){let last=null;const run=()=>{const next=image(root);if(next!==last){last=next;callback?.(next,shell(root));}};const mo=new MutationObserver(run);mo.observe(root.documentElement||root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src','hidden','aria-current','open']});run();return()=>mo.disconnect();}
  global.AsterActiveImage={image,shell,watch};
})(window);
