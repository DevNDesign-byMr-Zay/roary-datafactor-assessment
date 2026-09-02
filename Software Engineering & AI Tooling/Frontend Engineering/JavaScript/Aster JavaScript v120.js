/* Aster JavaScript v120
Authenticated historical derivative: object-fit-aware image geometry for expansion frames.
Product identity, private paths, credentials, and provider identifiers removed.
*/
(function(global){
  'use strict';
  function paintedRect(image){
    if(!(image instanceof HTMLImageElement)) return null;
    const r=image.getBoundingClientRect(), nw=image.naturalWidth||0, nh=image.naturalHeight||0;
    if(!r.width||!r.height||!nw||!nh) return null;
    const scale=Math.min(r.width/nw,r.height/nh), width=nw*scale, height=nh*scale;
    const ox=(r.width-width)/2, oy=(r.height-height)/2;
    return {left:r.left+ox,top:r.top+oy,right:r.left+ox+width,bottom:r.top+oy+height,width,height,naturalWidth:nw,naturalHeight:nh,scaleX:nw/width,scaleY:nh/height};
  }
  function expandPads(image,frame){
    if(!(frame instanceof Element)) return null;
    const pr=paintedRect(image); if(!pr) return null;
    const fr=frame.getBoundingClientRect();
    const left=Math.max(0,Math.round((pr.left-fr.left)*pr.scaleX));
    const right=Math.max(0,Math.round((fr.right-pr.right)*pr.scaleX));
    const top=Math.max(0,Math.round((pr.top-fr.top)*pr.scaleY));
    const bottom=Math.max(0,Math.round((fr.bottom-pr.bottom)*pr.scaleY));
    return {left,right,top,bottom,originalW:pr.naturalWidth,originalH:pr.naturalHeight,targetW:pr.naturalWidth+left+right,targetH:pr.naturalHeight+top+bottom};
  }
  global.AsterExpandGeometry={paintedRect,expandPads};
})(window);
