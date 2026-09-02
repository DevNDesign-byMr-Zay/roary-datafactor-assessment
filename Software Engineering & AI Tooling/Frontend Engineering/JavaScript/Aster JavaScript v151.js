/* Aster JavaScript v151
Authenticated derivative: bounded attachment-context extraction with text/PDF/image hooks,
timeout protection, and metadata fallback when extraction fails.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentContext) return;

  const TEXT_EXTENSIONS=new Set([
    "txt","md","markdown","json","csv","tsv","yaml","yml","svg","xml",
    "html","htm","css","scss","less","js","mjs","cjs","jsx","ts","tsx",
    "py","rb","php","go","rs","java","kt","c","cpp","h","hpp","cs","sql",
    "ps1","bat","sh"
  ]);

  function extension(name){
    const parts=String(name||"").toLowerCase().split(".");
    return parts.length>1?parts.pop():"";
  }

  function isTextLike(item){
    const type=String(item?.type||item?.file?.type||"").toLowerCase();
    return !!item?.text||type.startsWith("text/")||TEXT_EXTENSIONS.has(extension(item?.name));
  }

  function isPdf(item){
    const type=String(item?.type||item?.file?.type||"").toLowerCase();
    return type==="application/pdf"||extension(item?.name)==="pdf";
  }

  function isImage(item){
    const type=String(item?.type||item?.file?.type||"").toLowerCase();
    return type.startsWith("image/")||
      new Set(["png","jpg","jpeg","gif","webp","bmp","tif","tiff","ico"]).has(extension(item?.name));
  }

  async function withTimeout(promise,ms,label="ATTACHMENT_TIMEOUT"){
    let timer;
    try{
      return await Promise.race([
        Promise.resolve(promise),
        new Promise((_,reject)=>{
          timer=setTimeout(()=>reject(new Error(label)),Math.max(50,Number(ms)||4000));
        })
      ]);
    }finally{
      if(timer) clearTimeout(timer);
    }
  }

  function formatPalette(palette){
    if(!Array.isArray(palette)||!palette.length) return "";
    return palette.map(entry=>{
      const value=entry?.hex||entry?.color||"";
      const percent=entry?.percent;
      return value+(percent!=null?` (~${percent}%)`:"");
    }).filter(Boolean).join(", ");
  }

  async function extractOne(item,options={}){
    const name=String(item?.name||item?.file?.name||"file");
    const file=item?.file||item;
    const maxChars=Math.max(1000,Number(options.maxCharsPerFile)||120000);

    if(isTextLike(item)){
      const text=String(item?.text ?? (file?.text?await file.text():"")).slice(0,maxChars);
      return `### ${name}\n\`\`\`\n${text}${text.length===maxChars?"\n[...truncated]":""}\n\`\`\``;
    }

    if(isPdf(item)&&typeof options.extractPdf==="function"){
      const text=String(await options.extractPdf(file,maxChars)||"").slice(0,maxChars);
      if(text.trim()){
        return `### ${name}\n\`\`\`\n${text}${text.length===maxChars?"\n[...truncated]":""}\n\`\`\``;
      }
      return `### ${name}\n[pdf attached • no extractable text]`;
    }

    if(isImage(item)&&typeof options.analyzeImage==="function"){
      const analysis=await options.analyzeImage(file);
      const palette=formatPalette(analysis?.palette);
      const text=String(analysis?.text||"").trim().slice(0,maxChars);
      let block=`### ${name}\n[image attached`;
      if(item?.type||file?.type) block+=` • ${item?.type||file?.type}`;
      block+="]";
      if(palette) block+=`\n\nPalette: ${palette}`;
      if(text) block+=`\n\nExtracted text:\n\`\`\`\n${text}\n\`\`\``;
      return block;
    }

    const type=String(item?.type||file?.type||"binary");
    const size=Number(item?.size||file?.size||0);
    return `### ${name}\n[type: ${type||"binary"}${size?` • ${size} bytes`:""}]`;
  }

  async function extract(items,options={}){
    const list=Array.from(items||[]);
    if(!list.length) return "";

    const job=(async()=>{
      const blocks=[];
      for(const item of list){
        try{
          blocks.push(await extractOne(item,options));
        }catch(_){
          const name=String(item?.name||item?.file?.name||"file");
          blocks.push(`### ${name}\n[attachment extraction failed]`);
        }
      }
      return blocks.length?`---\nATTACHMENTS\n\n${blocks.join("\n\n")}\n---`:"";
    })();

    try{
      return await withTimeout(job,options.timeoutMs||4000,"ATTACHMENT_CONTEXT_TIMEOUT");
    }catch(_){
      const metadata=list.map(item=>{
        const name=String(item?.name||item?.file?.name||"file");
        const type=String(item?.type||item?.file?.type||"binary");
        return `[File: ${name} (${type})]`;
      }).join("\n");
      return `---\n[System: Attachments included but content extraction timed out]\n${metadata}\n---`;
    }
  }

  global.AsterAttachmentContext={
    extension,
    isTextLike,
    isPdf,
    isImage,
    withTimeout,
    extractOne,
    extract
  };
})(window);
