async function detectOrientationRotate(canvas){
  // Run a tiny OSD pass to detect rotation if supported; if fails, no-op
  try{
    const worker = await asterEnsureWorker(asterGetSetting('ocrLang','eng'));
    await worker.setParameters({ tessedit_pageseg_mode: String(PSM.OSD_ONLY) });
    const res = await worker.recognize(canvas);
    const angle = ((res && res.data && res.data.osd && res.data.osd.rotate) || 0) % 360;
    if(angle){
      const off = document.createElement('canvas');
      const ctx = off.getContext('2d');
      const rad = angle * Math.PI/180;
      const { width:w, height:h } = canvas;
      // expand canvas to fit rotated content
      const diag = Math.ceil(Math.sqrt(w*w + h*h));
      off.width = diag; off.height = diag;
      ctx.translate(diag/2, diag/2);
      ctx.rotate(rad);
      ctx.drawImage(canvas, -w/2, -h/2);
      return off;
    }
    return canvas;
  }catch(e){
    console.warn('OSD rotation failed; continuing', e);
    return canvas;
  }
}
