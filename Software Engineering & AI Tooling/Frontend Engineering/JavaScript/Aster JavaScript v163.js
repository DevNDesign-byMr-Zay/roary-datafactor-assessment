/* Aster JavaScript v163
Authenticated historical derivative: multi-stage PDF text extraction.
Order: locked local backend text extraction -> PDF.js positioned-text reconstruction -> raster-page OCR fallback.
*/
(function(global){
  "use strict";
  if(global.AsterPDFExtractionCascade) return;

  const LOCAL_5151=/^https?:\/\/(?:127\.0\.0\.1|localhost):5151$/i;

  function useful(text,minNonWhitespace=80){
    return String(text||"").replace(/\s+/g,"").length>minNonWhitespace;
  }

  async function backendExtract(file,maxChars,options={}){
    const base=String(options.backendBase||"http://127.0.0.1:5151").replace(/\/+$/,"");
    if(!LOCAL_5151.test(base)) return null;

    try{
      const form=new FormData();
      form.append("file",file);
      form.append("max_chars",String(maxChars));

      const response=await fetch(base+"/pdf-text",{
        method:"POST",
        body:form,
        credentials:"omit",
        signal:options.signal
      });
      if(!response.ok) return null;

      const payload=await response.json().catch(()=>null);
      const text=String(payload?.text||"");
      return useful(text) ? text.slice(0,maxChars) : null;
    }catch(_){
      return null;
    }
  }

  async function positionedText(file,maxChars,options={}){
    const pdfjs=options.pdfjs || global.pdfjsLib;
    if(!pdfjs) return null;

    try{
      const bytes=await file.arrayBuffer();
      const doc=await pdfjs.getDocument({data:bytes}).promise;
      const pageCount=Math.min(doc.numPages,Number(options.textPages)||20);
      let output="";

      for(let pageNo=1;pageNo<=pageCount;pageNo++){
        const page=await doc.getPage(pageNo);
        const content=await page.getTextContent();
        const items=Array.isArray(content?.items)?content.items:[];

        // Sparse/scanned pages are left for the raster OCR stage.
        if(items.length<=40) continue;

        const rows=[];
        const tolerance=Number(options.rowTolerance)||2;

        for(const item of items){
          const transform=item.transform || item.fontMatrix || [1,0,0,1,0,0];
          const x=Number(transform[4])||0;
          const y=Number(transform[5])||0;

          let row=rows.find(entry=>Math.abs(entry.y-y)<=tolerance);
          if(!row){
            row={y,items:[]};
            rows.push(row);
          }
          row.items.push({x,text:String(item.str||"")});
        }

        rows.sort((a,b)=>b.y-a.y);
        for(const row of rows){
          const line=row.items
            .sort((a,b)=>a.x-b.x)
            .map(item=>item.text)
            .join(" ")
            .replace(/\s+/g," ")
            .trim();
          if(line) output+=line+"\n";
          if(output.length>=maxChars) break;
        }
        output+="\n";
        if(output.length>=maxChars) break;
      }

      return useful(output) ? output.slice(0,maxChars) : null;
    }catch(_){
      return null;
    }
  }

  async function rasterOCR(file,maxChars,options={}){
    const pdfjs=options.pdfjs || global.pdfjsLib;
    const recognize=options.recognize;
    if(!pdfjs || typeof recognize!=="function") return "";

    try{
      const bytes=await file.arrayBuffer();
      const doc=await pdfjs.getDocument({data:bytes}).promise;
      const pageCount=Math.min(doc.numPages,Number(options.ocrPages)||10);
      let output="";

      for(let pageNo=1;pageNo<=pageCount;pageNo++){
        const page=await doc.getPage(pageNo);
        const baseViewport=page.getViewport({scale:1});
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.floor(baseViewport.width*2));
        canvas.height=Math.max(1,Math.floor(baseViewport.height*2));

        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        const viewport=page.getViewport({scale:canvas.width/baseViewport.width});
        await page.render({canvasContext:ctx,viewport}).promise;

        const profile=
          typeof options.chooseProfile==="function"
            ? await options.chooseProfile(canvas,file.name)
            : {oem:"1",psm:"6",whitelist:"",dpiScale:2};

        output+=(await recognize(canvas,profile,"eng")||"")+"\n\n";
        if(output.length>=maxChars) break;
      }

      return output.trim().slice(0,maxChars);
    }catch(_){
      return "";
    }
  }

  async function extract(file,options={}){
    const maxChars=Math.max(1000,Number(options.maxChars)||120000);

    const fromBackend=await backendExtract(file,maxChars,options);
    if(fromBackend) return {mode:"backend",text:fromBackend};

    const fromText=await positionedText(file,maxChars,options);
    if(fromText) return {mode:"pdfjs-text",text:fromText};

    const fromOCR=await rasterOCR(file,maxChars,options);
    return {mode:fromOCR?"raster-ocr":"empty",text:fromOCR||""};
  }

  global.AsterPDFExtractionCascade={
    useful,
    backendExtract,
    positionedText,
    rasterOCR,
    extract
  };
})(window);
