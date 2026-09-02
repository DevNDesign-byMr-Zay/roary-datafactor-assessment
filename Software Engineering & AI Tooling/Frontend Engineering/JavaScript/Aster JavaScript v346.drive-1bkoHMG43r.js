async function patchRemoveFormData(fd){
    try{
      const blob = await buildBinaryMaskBlobV8();
      if(blob){
        fd.set("mask", blob, "mask.png");
      }
    }catch(e){}
    return fd;
  }
