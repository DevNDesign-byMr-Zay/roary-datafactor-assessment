/* Aster JavaScript v170
Authenticated historical derivative: bounded local visual-summary aggregation for image and PDF attachments.
Uses pluggable image-description and PDF-text functions so transport/provider details remain outside this artifact.
*/
(function(global){
  "use strict";
  if(global.AsterLocalVisualSummary) return;

  function firstLines(value,count=6){
    return String(value||"")
      .split(/\r?\n/)
      .map(line=>line.trim())
      .filter(Boolean)
      .slice(0,Math.max(1,Number(count)||6))
      .join("\n");
  }

  function isImage(item){
    const type=String(item?.type||item?.file?.type||"").toLowerCase();
    const name=String(item?.name||item?.file?.name||"");
    return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name);
  }

  function isPdf(item){
    const type=String(item?.type||item?.file?.type||"").toLowerCase();
    const name=String(item?.name||item?.file?.name||"");
    return type==="application/pdf" || /\.pdf$/i.test(name);
  }

  async function build(attachments,options={}){
    const rows=[];
    const describeImage=options.describeImage;
    const extractPdf=options.extractPdf;
    const maxItems=Math.max(1,Number(options.maxItems)||12);

    for(const item of Array.from(attachments||[]).slice(0,maxItems)){
      const name=String(item?.name||item?.file?.name||"attachment");
      const file=item?.file||item;

      if(isImage(item) && typeof describeImage==="function"){
        try{
          const result=await describeImage(file);
          const palette=(Array.isArray(result?.palette)?result.palette:[])
            .map(entry=>`${entry.hex}${entry.percent!=null?` (~${entry.percent}%)`:""}`)
            .filter(Boolean)
            .join(", ");
          const text=firstLines(result?.text,options.ocrLines||6);
          rows.push({
            name,
            kind:"image",
            palette,
            preview:text
          });
        }catch(_){
          rows.push({name,kind:"image",palette:"",preview:""});
        }
        continue;
      }

      if(isPdf(item) && typeof extractPdf==="function"){
        try{
          const text=firstLines(await extractPdf(file,Number(options.pdfChars)||10000),options.pdfLines||6);
          rows.push({name,kind:"pdf",palette:"",preview:text});
        }catch(_){
          rows.push({name,kind:"pdf",palette:"",preview:""});
        }
      }
    }

    return rows;
  }

  function toMarkdown(rows){
    const lines=[];
    for(const row of Array.isArray(rows)?rows:[]){
      if(row.kind==="image"){
        lines.push(
          `- **${row.name}** — image`+
          (row.palette?` • Palette: ${row.palette}`:"")+
          (row.preview?`\n  - OCR: ${row.preview}`:"")
        );
      }else if(row.kind==="pdf"){
        lines.push(
          `- **${row.name}** — PDF`+
          (row.preview?`\n  - Preview: ${row.preview}`:"")
        );
      }
    }
    return lines.length?`### Local Visual/Text Summary\n${lines.join("\n")}`:"";
  }

  global.AsterLocalVisualSummary={firstLines,isImage,isPdf,build,toMarkdown};
})(window);
