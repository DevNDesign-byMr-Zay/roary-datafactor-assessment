/* Aster JavaScript v123
Authenticated historical derivative: normalize a local erase mask to the displayed image's natural bitmap and prepare expand/remove form fields.
*/
(function(global){
  'use strict';
  const blobOf=c=>new Promise(resolve=>c.toBlob(b=>resolve(b),'image/png'));
  async function normalizedMask(maskCanvas,image){
    if(!(maskCanvas instanceof HTMLCanvasElement)||!(image instanceof HTMLImageElement))return null;
    const g=global.AsterExpandGeometry?.paintedRect?.(image); if(!g)return null;
    const ir=image.getBoundingClientRect(), sx=maskCanvas.width/ir.width, sy=maskCanvas.height/ir.height;
    const cropX=Math.max(0,Math.round((g.left-ir.left)*sx)),cropY=Math.max(0,Math.round((g.top-ir.top)*sy));
    const cropW=Math.max(1,Math.round(g.width*sx)),cropH=Math.max(1,Math.round(g.height*sy));
    const crop=document.createElement('canvas');crop.width=cropW;crop.height=cropH;crop.getContext('2d').drawImage(maskCanvas,cropX,cropY,cropW,cropH,0,0,cropW,cropH);
    const out=document.createElement('canvas');out.width=g.naturalWidth;out.height=g.naturalHeight;out.getContext('2d').drawImage(crop,0,0,out.width,out.height);return blobOf(out);
  }
  async function prepare(formData,options={}){
    if(!(formData instanceof FormData))throw new TypeError('formData must be FormData');
    const pads=global.AsterExpandGeometry?.expandPads?.(options.image,options.frame);
    if(pads){for(const [k,v] of Object.entries({expand_left:pads.left,expand_right:pads.right,expand_top:pads.top,expand_bottom:pads.bottom,original_w:pads.originalW,original_h:pads.originalH,target_w:pads.targetW,target_h:pads.targetH}))formData.set(k,String(v));}
    if(options.maskCanvas&&options.image){const blob=await normalizedMask(options.maskCanvas,options.image);if(blob)formData.set('mask',blob,'mask.png');}
    return formData;
  }
  global.AsterToolForm={normalizedMask,prepare};
})(window);
