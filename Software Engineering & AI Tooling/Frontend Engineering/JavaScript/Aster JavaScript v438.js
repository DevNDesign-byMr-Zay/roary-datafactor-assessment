async function srcToBlob(src, imgEl){
    src = String(src||"");
    try{
      if(src.startsWith("data:")){
        return dataUrlToBlob(src);
      }
      if(src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://")){
        const r = await fetch(src);
        return await r.blob();
      }
      // file: URLs can be blocked; last-resort: draw to canvas (may fail if tainted)
      if(imgEl && (src.startsWith("file:") || src.startsWith("C:\\") || src.startsWith("/") || src.startsWith("."))){
        const nw = imgEl.naturalWidth||0, nh = imgEl.naturalHeight||0;
        if(nw && nh){
          const c = document.createElement("canvas");
          c.width = nw; c.height = nh;
          const ctx = c.getContext("2d");
          ctx.drawImage(imgEl, 0, 0, nw, nh);
          return await new Promise((res)=>c.toBlob(res, "image/png", 0.95));
        }
      }
    }catch(e){
      warn("srcToBlob failed", e);
    }
    return null;
  }
