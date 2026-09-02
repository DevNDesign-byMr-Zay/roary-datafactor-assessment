/* Aster JavaScript v153
Authenticated historical derivative: attachment intake dedupe and bounded serialization.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization architecture removed.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentIntake) return;

  const TEXT_EXTENSIONS = new Set([
    "txt","md","markdown","json","csv","tsv","yaml","yml","xml","svg",
    "html","htm","css","js","mjs","cjs","jsx","ts","tsx","py","rb",
    "php","go","rs","java","kt","c","cpp","h","hpp","cs","sql","ps1",
    "bat","sh"
  ]);

  const seen = new Set();

  function extension(name){
    const parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function signature(file){
    return [
      String(file?.name || ""),
      Number(file?.size || 0),
      Number(file?.lastModified || 0)
    ].join("::");
  }

  function isTextLike(file){
    const type = String(file?.type || "").toLowerCase();
    return type.startsWith("text/") || TEXT_EXTENSIONS.has(extension(file?.name));
  }

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>resolve(String(reader.result || ""));
      reader.onerror = ()=>reject(reader.error || new Error("Attachment read failed"));
      reader.readAsDataURL(file);
    });
  }

  async function serialize(file,options={}){
    const maxTextChars = Math.max(1000, Number(options.maxTextChars) || 120000);
    const record = {
      name: String(file?.name || "file"),
      type: String(file?.type || ""),
      size: Number(file?.size || 0),
      lastModified: Number(file?.lastModified || 0),
      data: "",
      text: ""
    };

    try{
      record.data = await fileToDataUrl(file);
    }catch(_){}

    if(isTextLike(file) && typeof file?.text === "function"){
      try{
        record.text = String(await file.text()).slice(0,maxTextChars);
      }catch(_){}
    }
    return record;
  }

  async function ingest(files,options={}){
    const accepted = [];
    const duplicates = [];

    for(const file of Array.from(files || [])){
      const key = signature(file);
      if(seen.has(key)){
        duplicates.push(file);
        continue;
      }

      seen.add(key);
      try{
        accepted.push(await serialize(file,options));
      }catch(error){
        seen.delete(key);
        if(options.throwOnError) throw error;
      }
    }

    if(options.input){
      try{ options.input.value = ""; }catch(_){}
    }

    document.dispatchEvent(new CustomEvent("aster:attachments-ingested",{
      detail:{accepted,duplicates}
    }));

    return {accepted,duplicates};
  }

  function release(record){
    const key = [
      String(record?.name || ""),
      Number(record?.size || 0),
      Number(record?.lastModified || 0)
    ].join("::");
    seen.delete(key);
  }

  function reset(){
    seen.clear();
  }

  global.AsterAttachmentIntake = {
    extension,
    signature,
    isTextLike,
    fileToDataUrl,
    serialize,
    ingest,
    release,
    reset
  };
})(window);
