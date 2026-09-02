
// === ASTER Tool Fixes v174 ===
(function(){
  function dataUrlToBlob(dataUrl){
    try{
      const parts=dataUrl.split(',');
      if(parts.length<2) return null;
      const meta=parts[0];
      const b64=parts[1];
      const mime=(/data:([^;]+)/.exec(meta)||[])[1]||'application/octet-stream';
      const bin=atob(b64);
      const arr=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
      return new Blob([arr],{type:mime});
    }catch(e){return null;}
  }

  async function scaleDataUrlToSize(dataUrl, targetW, targetH){
    try{
      if(!targetW||!targetH) return dataUrl;
      if(!/^data:image\//i.test(dataUrl)) return dataUrl;
      const img=new Image();
      img.decoding='async';
      const p=new Promise((res,rej)=>{img.onload=res; img.onerror=rej;});
      img.src=dataUrl;
      await p;
      // if already close enough, skip
      if(Math.abs(img.width-targetW)<2 && Math.abs(img.height-targetH)<2) return dataUrl;
      const c=document.createElement('canvas');
      c.width=targetW; c.height=targetH;
      const ctx=c.getContext('2d',{willReadFrequently:false});
      ctx.imageSmoothingEnabled=true;
      ctx.clearRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,targetW,targetH);
      return c.toDataURL('image/png');
    }catch(e){return dataUrl;}
  }

  // expose helpers
  window.asterDataUrlToBlob = window.asterDataUrlToBlob || dataUrlToBlob;
  window.asterScaleDataUrlToSize = window.asterScaleDataUrlToSize || scaleDataUrlToSize;

  // Compute expand pads from dotted frame (no UI clamps). Returns {left,right,top,bottom}
  window.asterComputeExpandFromFrame = window.asterComputeExpandFromFrame || function(){
    try{
      const img=document.getElementById('imageModalImg');
      const frame=document.getElementById('rtExpandFrame') || document.querySelector('#rtExpandFrame');
      if(!img||!frame) return null;
      const ir=img.getBoundingClientRect();
      const fr=frame.getBoundingClientRect();
      if(!ir.width||!ir.height) return null;
      const natW=img.naturalWidth||0;
      const natH=img.naturalHeight||0;
      if(!natW||!natH) return null;
      const sx=natW/ir.width;
      const sy=natH/ir.height;
      const left=Math.max(0, Math.round((ir.left - fr.left) * sx));
      const right=Math.max(0, Math.round((fr.right - ir.right) * sx));
      const top=Math.max(0, Math.round((ir.top - fr.top) * sy));
      const bottom=Math.max(0, Math.round((fr.bottom - ir.bottom) * sy));
      const out={left,right,top,bottom};
      // sync into any existing state objects
      try{ window.__asterExpandOpts = Object.assign(window.__asterExpandOpts||{}, out); }catch(e){}
      try{ window.__asterExpand = Object.assign(window.__asterExpand||{}, out); }catch(e){}
      return out;
    }catch(e){return null;}
  };
})();
