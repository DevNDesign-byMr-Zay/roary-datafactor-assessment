async function buildAttachmentBlock(attachments){
        if(!attachments || !attachments.length) return "";
        const MAX_TEXT_CHARS=120000;
        const parts=[];
        for(const a of attachments){
          const name=a?.name || "file";
          const type=(a?.type || "").toLowerCase();
          const ext=(name.split(".").pop()||"").toLowerCase();

          const isTextLike = a.text ||
            (type.startsWith("text/")) ||
            ["txt","md","markdown","json","csv","tsv","yaml","yml","svg","xml","html","htm","css","scss","less","js","mjs","cjs","jsx","ts","tsx","py","rb","php","go","rs","java","kt","c","cpp","h","hpp","cs","sql","ps1","bat","sh"].includes(ext);

          if(isTextLike){
            const content=(a.text || (a.file ? await a.file.text() : "")).slice(0,MAX_TEXT_CHARS);
            parts.push(`### ${name}\n\`\`\`\n${content}${content.length===MAX_TEXT_CHARS?`\n[...truncated]`:``}\n\`\`\``);
            continue;
          }
          if(type==="application/pdf" && a.file){
            let pdfText = "";
            try{
              pdfText = await extractPdfTextSmart(a.file,MAX_TEXT_CHARS);
            }catch(e){
              console.warn("[Aster:attachments] extractPdfTextSmart failed", e);
              pdfText = "";
            }
            if(pdfText && pdfText.trim()){
              parts.push(`### ${name}
\`\`\`
${pdfText}${pdfText.length===MAX_TEXT_CHARS?`\n[...truncated]`:``}
\`\`\``);
            }else{
              parts.push(`### ${name}
[pdf attached • ${formatBytes(a.size)} • no extractable text]`);
            }
            continue;
          }
          if(a.file && (type.startsWith("image/") || ["ico","bmp","tif","tiff"].includes(ext))){
            const {palette,text}=await visualDescribeImage(a.file);
            const pal=(palette||[]).map(p=>`- ${p.hex} (~${p.percent}%)`).join("\n");
            const t=(text||"").trim();
            parts.push(
              `### ${name}\n`+
              `[image attached • ${formatBytes(a.size)}${type?` • ${type}`:""}]`+
              (pal?`\n\nPalette:\n${pal}`:"")+
              (t?`\n\n(Extracted text via OCR)\n\`\`\`\n${takeFirstLines(t,12)}\n\`\`\``:"")
            );
            continue;
          }
          parts.push(`### ${name}\n[type: ${type || "binary"} • ${formatBytes(a.size)}]`);
        }
        return parts.length ? `---\nATTACHMENTS\n\n${parts.join("\n\n")}\n---` : "";
      }
