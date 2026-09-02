/* Aster JavaScript v132
Authenticated historical derivative: active-image discovery and object-fit-aware frame anchoring.
*/
(function(global){
  'use strict';
  function activeImage(root=document){return root.querySelector('[data-aster-image].is-active img,[data-aster-image][aria-current="true"] img,[data-aster-image] img:not([hidden])')||root.querySelector('img[data-aster-active-image]');}
  function shellFor(image){return image?.closest?.('[data-aster-image-shell]')||image?.parentElement||null;}
  function paintedRect(image){if(!(image instanceof HTMLImageElement)||!image.naturalWidth||!image.naturalHeight)return null;const r=image.getBoundingClientRect(),s=Math.min(r.width/image.naturalWidth,r.height/image.naturalHeight),w=image.naturalWidth*s,h=image.naturalHeight*s,x=r.left+(r.width-w)/2,y=r.top+(r.height-h)/2;return{x,y,left:x,top:y,right:x+w,bottom:y+h,width:w,height:h,scaleX:image.naturalWidth/w,scaleY:image.naturalHeight/h};}
  function anchor(frame,image=activeImage()){const shell=shellFor(image),pr=paintedRect(image);if(!shell||!pr||!(frame instanceof HTMLElement))return null;const sr=shell.getBoundingClientRect();if(getComputedStyle(shell).position==='static')shell.style.position='relative';Object.assign(frame.style,{left:`${pr.left-sr.left}px`,top:`${pr.top-sr.top}px`,width:`${pr.width}px`,height:`${pr.height}px`});return{shell,image,paintedRect:pr};}
  global.AsterExpandAnchor={activeImage,shellFor,paintedRect,anchor};
})(window);
