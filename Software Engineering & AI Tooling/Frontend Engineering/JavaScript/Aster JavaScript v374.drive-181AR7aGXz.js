async function buildLocalVisionReport(turnAttachments){
        const lines=[];
        for(const a of turnAttachments){
          const t=(a.type||"").toLowerCase();
          const isImg=t.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(a.name||"");
          const isPdf=t==="application/pdf" || /\.pdf$/i.test(a.name||"");
          if(!isImg && !isPdf)continue;
          if(isImg && a.file){
            const {palette,text}=await visualDescribeImage(a.file);
            const pal=(palette||[]).map(p=>`${p.hex} (~${p.percent}%)`).join(", ");
            const txt=(text||"").trim();
            lines.push(`- **${a.name}** — image${pal?` • Palette: ${pal}`:""}${txt?`\n  - OCR: ${takeFirstLines(txt,6)}`:""}`);
          }else if(isPdf && a.file){
            const txt=await extractPdfTextSmart(a.file,10000);
            if(txt)lines.push(`- **${a.name}** — PDF\n  - Preview: ${takeFirstLines(txt,6)}`);
          }
        }
        if(!lines.length)return"";
        return `### Local Vision/OCR Summary\n${lines.join("\n")}`;
      }
