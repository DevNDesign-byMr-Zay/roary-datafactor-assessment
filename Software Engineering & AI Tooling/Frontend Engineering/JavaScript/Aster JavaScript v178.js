/* Aster JavaScript v178
   Authenticated historical derivative: bounded attachment-to-prompt serialization.
   Text, PDF, image, and binary attachments are normalized into one portable message block
   with pluggable extractors and strict text limits.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentSerializer) return;

  const TEXT_EXTENSIONS=new Set([
    "txt","md","markdown","json","csv","tsv","yaml","yml","svg","xml","html","htm",
    "css","scss","less","js","mjs","cjs","jsx","ts","tsx","py","rb","php","go","rs",
    "java","kt","c","cpp","h","hpp","cs","sql","ps1","bat","sh"
  ]);

  function extOf(name){ return (String(name||"").split(".").pop()||"").toLowerCase(); }
  function defaultBytes(value){
    const n=Math.max(0,Number(value)||0);
    if(n<1024) return `${n} B`;
    if(n<1048576) return `${(n/1024).toFixed(1)} KB`;
    return `${(n/1048576).toFixed(1)} MB`;
  }
  function firstLines(text,maxLines=12){ return String(text||"").split(/\r?\n/).slice(0,maxLines).join("\n"); }

  async function serialize(attachments, options={}){
    const list=Array.isArray(attachments) ? attachments : [];
    if(!list.length) return "";
    const maxText=Math.max(1,Number(options.maxTextChars)||120000);
    const formatBytes=options.formatBytes || defaultBytes;
    const extractPdf=options.extractPdf || (async()=>"");
    const describeImage=options.describeImage || (async()=>({palette:[],text:""}));
    const parts=[];

    for(const item of list){
      const name=String(item?.name || "file");
      const type=String(item?.type || "").toLowerCase();
      const ext=extOf(name);
      const textLike=Boolean(item?.text) || type.startsWith("text/") || TEXT_EXTENSIONS.has(ext);

      if(textLike){
        const raw=item?.text != null ? String(item.text) : (item?.file?.text ? await item.file.text() : "");
        const content=raw.slice(0,maxText);
        parts.push(`### ${name}\n\`\`\`\n${content}${raw.length>maxText?"\n[...truncated]":""}\n\`\`\``);
        continue;
      }
      if(type==="application/pdf" && item?.file){
        const raw=String(await extractPdf(item.file,maxText) || "");
        const content=raw.slice(0,maxText);
        parts.push(content.trim()
          ? `### ${name}\n\`\`\`\n${content}${raw.length>maxText?"\n[...truncated]":""}\n\`\`\``
          : `### ${name}\n[pdf attached • ${formatBytes(item?.size)} • no extractable text]`);
        continue;
      }
      if(item?.file && (type.startsWith("image/") || ["ico","bmp","tif","tiff"].includes(ext))){
        const detail=await describeImage(item.file) || {};
        const palette=Array.isArray(detail.palette) ? detail.palette : [];
        const pal=palette.map(p=>`- ${p.hex} (~${p.percent}%)`).join("\n");
        const text=String(detail.text||"").trim();
        parts.push(`### ${name}\n[image attached • ${formatBytes(item?.size)}${type?` • ${type}`:""}]${pal?`\n\nPalette:\n${pal}`:""}${text?`\n\n(Extracted text)\n\`\`\`\n${firstLines(text,12)}\n\`\`\``:""}`);
        continue;
      }
      parts.push(`### ${name}\n[type: ${type || "binary"} • ${formatBytes(item?.size)}]`);
    }
    return parts.length ? `---\nATTACHMENTS\n\n${parts.join("\n\n")}\n---` : "";
  }

  global.AsterAttachmentSerializer={serialize,extOf,defaultBytes,firstLines};
})(window);
