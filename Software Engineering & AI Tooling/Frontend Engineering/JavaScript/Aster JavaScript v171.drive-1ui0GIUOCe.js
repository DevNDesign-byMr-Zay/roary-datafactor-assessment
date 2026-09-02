/* Aster JavaScript v171
Authenticated historical derivative: final raw-PDF OCR fallback adapter.
This runs only after ordinary PDF text and raster OCR stages have failed to produce meaningful text.
*/
(function(global){
  "use strict";
  if(global.AsterRawPdfOCRFallback) return;

  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i;

  function meaningful(text,minChars=40){
    const compact=String(text||"").replace(/\s+/g,"");
    if(compact.length<minChars) return false;
    const lower=compact.toLowerCase();
    if(lower.includes("noextractabletext")) return false;
    if(lower.includes("imagebaseddocument")) return false;
    return true;
  }

  async function extract(file,options={}){
    if(!file) return "";

    const base=String(options.backendBase||"http://127.0.0.1:5151")
      .trim()
      .replace(/\/+$/,"");
    if(!LOCAL_5151.test(base)) return "";

    const maxChars=Math.max(1000,Number(options.maxChars)||120000);
    const form=new FormData();
    form.append("file",file);

    try{
      const response=await fetch(base+"/ocr_pdf",{
        method:"POST",
        body:form,
        credentials:"omit",
        signal:options.signal
      });
      if(!response.ok) return "";

      const payload=await response.json().catch(()=>null);
      const text=String(payload?.text||"").slice(0,maxChars);
      return meaningful(text,Number(options.minChars)||40) ? text : "";
    }catch(_){
      return "";
    }
  }

  async function complete(existingText,file,options={}){
    const current=String(existingText||"");
    if(meaningful(current,Number(options.minChars)||40)){
      return {mode:"existing",text:current};
    }

    const recovered=await extract(file,options);
    return {
      mode:recovered?"raw-pdf-ocr":"empty",
      text:recovered
    };
  }

  global.AsterRawPdfOCRFallback={meaningful,extract,complete};
})(window);
