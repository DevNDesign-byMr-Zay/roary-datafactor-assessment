async function chooseOcrParamsForRaster(canvas,filename){
        const name=(filename||"").toLowerCase();
        const ar=canvas.width/canvas.height;
        if(ar<0.7 || /receipt|invoice|bill|ticket/.test(name)){
          return {oem:"1",psm:"3",whitelist:"",dpiScale:2.25};
        }
        try{
          if(await isLogoLike(canvas)){
            return {oem:"1",psm:"8",whitelist:ocr_white || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-&",dpiScale:2.5};
          }
        }catch{}
        return {oem:"1",psm:"6",whitelist:"",dpiScale:2.0};
      }
