/* Aster JavaScript v139
Authenticated historical derivative: remove/erase form payload construction from local image and user-drawn mask blobs.
*/
(function(global){
  'use strict';
  async function build(options={}){if(!(options.imageBlob instanceof Blob))throw new TypeError('imageBlob is required');if(!(options.maskBlob instanceof Blob))throw new Error('Paint an area to remove before execution');const fd=new FormData();fd.set('image',options.imageBlob,'image.png');fd.set('mask',options.maskBlob,'mask.png');if(options.prompt)fd.set('prompt',String(options.prompt));if(options.quality)fd.set('quality',String(options.quality));if(Number.isFinite(Number(options.maskExpansion)))fd.set('mask_expansion',String(Math.max(0,Math.round(Number(options.maskExpansion)))));return fd;}
  global.AsterRemovePayload={build};
})(window);
