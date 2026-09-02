async function extractImageText(file){
        let dataUrl=await fileToDataURL(file);
        const img=new Image();
        const txt=await new Promise(resolve=>{
          img.onload=async()=>{
            const canvas=document.createElement("canvas");
            canvas.width=Math.max(64,img.naturalWidth);
            canvas.height=Math.max(64,img.naturalHeight);
            const ctx=canvas.getContext("2d",{willReadFrequently:true});
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            const params=ocr_auto ? await chooseOcrParamsForRaster(canvas,file.name)
                                  : {oem:ocr_oem,psm:ocr_psm,whitelist:ocr_white,dpiScale:1.8};
            const out=await runOcrOnCanvas(canvas,params,"eng");
            resolve(out);
          };
          img.onerror=()=>resolve("");
          img.src=dataUrl;
        });
        return txt;
      }
