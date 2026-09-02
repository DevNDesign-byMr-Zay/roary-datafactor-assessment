/* Aster JavaScript v126
Authenticated historical derivative: eight-point expansion controller that keeps handles synchronized and recomputes natural-pixel pads.
*/
(function(global){
  'use strict';
  const POS=['nw','n','ne','e','se','s','sw','w'];
  function install(frame,image,options={}){
    if(!(frame instanceof HTMLElement)||!(image instanceof HTMLImageElement))return null;
    if(!frame.querySelector('[data-aster-generated-handle]'))for(const pos of POS){const h=document.createElement('div');h.setAttribute('data-aster-generated-handle','');if(pos.length===1)h.dataset.edge=pos;else h.dataset.corner=pos;frame.appendChild(h);}
    const refresh=()=>{const pads=global.AsterExpandGeometry?.expandPads?.(image,frame);if(pads)options.onPads?.(pads);return pads;};
    const observer=new MutationObserver(refresh);observer.observe(frame,{attributes:true,attributeFilter:['style','class']});window.addEventListener('resize',refresh,{passive:true});refresh();
    return()=>{observer.disconnect();window.removeEventListener('resize',refresh);};
  }
  global.AsterEightPointExpand={install};
})(window);
