/* Aster JavaScript v144
Authenticated historical derivative: expand-underlay placement and erase/execute reliability controller.
*/
(function(global){
  'use strict';
  function placeUnderlay(shell,image,underlay){if(!shell||!image||!underlay)return;const sr=shell.getBoundingClientRect(),ir=image.getBoundingClientRect();Object.assign(underlay.style,{position:'absolute',left:`${ir.left-sr.left}px`,top:`${ir.top-sr.top}px`,width:`${ir.width}px`,height:`${ir.height}px`,zIndex:'1'});if(getComputedStyle(image).position==='static')image.style.position='relative';image.style.zIndex='2';}
  async function execute(button,task){if(button?.dataset.asterBusy==='1')return;button&& (button.dataset.asterBusy='1');try{return await task()}finally{button&&delete button.dataset.asterBusy;}}
  global.AsterToolExecuteReliability={placeUnderlay,execute};
})(window);
