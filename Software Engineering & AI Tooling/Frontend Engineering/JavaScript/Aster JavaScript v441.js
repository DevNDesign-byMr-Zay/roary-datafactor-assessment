const makeForm = ()=>{
      const fd = new FormData();
      fd.append("image", imageBlob, "image.png");
      if(maskBlob) fd.append("mask", maskBlob, "mask.png");
      fd.append("prompt", String(prompt||"remove object"));
      // Hint for newer object-removal inpaint pipelines (backend may ignore safely)
      fd.append("mode", "object_removal");
      fd.append("model", "object-removal-inpaint-latest");
      fd.append("return", "url");
      return fd;
    };
