function loadImage(src){
    return new Promise((resolve, reject)=>{
      const im = new Image();
      im.onload = ()=>resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }
