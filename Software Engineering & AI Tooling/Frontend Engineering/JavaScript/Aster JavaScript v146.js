/* Aster JavaScript v146
Authenticated historical derivative: integrated remove/expand execution adapter with mask validation and overlay ordering.
*/
(function(global){
  'use strict';
  function maskHasInk(maskCanvas){if(!(maskCanvas instanceof HTMLCanvasElement))return false;const d=maskCanvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,maskCanvas.width,maskCanvas.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>20)return true;return false;}
  function putExpandBehind(frame,image){if(!frame||!image)return;const shell=image.closest?.('[data-aster-image-shell]');if(shell&&frame.parentElement!==shell)shell.insertBefore(frame,image);frame.style.zIndex='1';image.style.position='relative';image.style.zIndex='2';}
  async function remove(options={}){if(!maskHasInk(options.maskCanvas))throw new Error('Mask is empty');const imageBlob=await global.AsterActiveImageBlob.toBlob(global.AsterActiveImageBlob.source(options.image));const maskBlob=await new Promise((resolve,reject)=>options.maskCanvas.toBlob(b=>b?resolve(b):reject(new Error('Mask export failed')),'image/png'));return global.AsterRemoveTransport.run({...options,imageBlob,maskBlob});}
  global.AsterIntegratedImageTools={maskHasInk,putExpandBehind,remove};
})(window);
