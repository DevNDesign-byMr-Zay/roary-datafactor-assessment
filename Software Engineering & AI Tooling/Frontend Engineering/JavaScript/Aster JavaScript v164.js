/* Aster JavaScript v164
Authenticated historical derivative: backend-first OCR with browser-worker fallback and guaranteed worker termination.
Local OCR endpoint is restricted to port 5151 in this buyer-safe derivative.
*/
(function(global){
  "use strict";
  if(global.AsterOCRExecutor) return;

  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i;

  function canvasBlob(canvas){
    return new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  }

  async function backendOCR(canvas,profile={},language="eng",options={}){
    const base=String(options.backendBase||"http://127.0.0.1:5151").replace(/\/+$/,"");
    if(!LOCAL_5151.test(base)) return null;

    try{
      const blob=await canvasBlob(canvas);
      if(!blob) return null;

      const form=new FormData();
      form.append("file",blob,"page.png");
      form.append("lang",String(language||"eng"));
      if(profile.oem!=null) form.append("oem",String(profile.oem));
      if(profile.psm!=null) form.append("psm",String(profile.psm));
      if(profile.whitelist) form.append("whitelist",String(profile.whitelist));

      const response=await fetch(base+"/ocr",{
        method:"POST",
        body:form,
        credentials:"omit",
        signal:options.signal
      });
      if(!response.ok) return null;

      const payload=await response.json().catch(()=>null);
      return payload?.text!=null ? String(payload.text) : null;
    }catch(_){
      return null;
    }
  }

  async function browserOCR(canvas,profile={},language="eng",options={}){
    const engine=options.tesseract || global.Tesseract;
    if(!engine?.createWorker) return "";

    let worker=null;
    try{
      worker=await engine.createWorker(String(language||"eng"),1,{logger:()=>{}});
      await worker.setParameters({
        tessedit_ocr_engine_mode:Number(profile.oem??1),
        tessedit_pageseg_mode:Number(profile.psm??6),
        tessedit_char_whitelist:String(profile.whitelist||"")
      });
      const result=await worker.recognize(canvas);
      return String(result?.data?.text||"").trim();
    }catch(_){
      return "";
    }finally{
      try{ await worker?.terminate?.(); }catch(_){}
    }
  }

  async function recognize(canvas,profile={},language="eng",options={}){
    if(!(canvas instanceof HTMLCanvasElement)) return {mode:"invalid",text:""};

    if(options.backendFirst!==false){
      const backend=await backendOCR(canvas,profile,language,options);
      if(backend!==null){
        return {mode:"backend",text:backend};
      }
    }

    const browser=await browserOCR(canvas,profile,language,options);
    return {mode:browser?"browser":"empty",text:browser};
  }

  global.AsterOCRExecutor={
    canvasBlob,
    backendOCR,
    browserOCR,
    recognize
  };
})(window);
