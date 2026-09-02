function measureMaskCoverage(){
    try{
      const r = maskCanvas.getBoundingClientRect();
      if(!r.width || !r.height) return;
      const chk = document.createElement("canvas");
      chk.width = 96; chk.height = 96;
      const c = chk.getContext("2d");
      c.drawImage(maskCanvas,0,0,r.width,r.height,0,0,96,96);
      const d = c.getImageData(0,0,96,96).data;
      let non=0;
      for(let i=0;i<d.length;i+=4){ if(d[i]>12) non++; }
      const ratio = non/(96*96);
      $("#maskStats").textContent = `Mask coverage: ${(ratio*100).toFixed(2)}%` + (invertMask ? " • invert" : "");
    }catch(e){}
  }
