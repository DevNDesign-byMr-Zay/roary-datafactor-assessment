function getPaintedRect(img){
    const ir = img.getBoundingClientRect();
    const natW = img.naturalWidth||0, natH = img.naturalHeight||0;
    if(!ir.width||!ir.height||!natW||!natH) return null;
    const scale = Math.min(ir.width/natW, ir.height/natH);
    const dw = natW*scale, dh = natH*scale;
    const ox = (ir.width-dw)/2, oy = (ir.height-dh)/2;
    return {ir,natW,natH,scale,dw,dh,ox,oy,left:ir.left+ox,top:ir.top+oy,right:ir.left+ox+dw,bottom:ir.top+oy+dh,sx:natW/dw,sy:natH/dh};
  }
