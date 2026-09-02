/* Aster JavaScript v166
Authenticated historical derivative: visual attachment descriptor combining local color analysis with pluggable OCR.
No network image is inspected directly; the File is decoded locally into a canvas.
*/
(function(global){
  "use strict";
  if(global.AsterImageAttachmentDescriptor) return;

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||""));
      reader.onerror=()=>reject(reader.error||new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }

  function decodeImage(dataUrl){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error("Image decode failed"));
      image.src=dataUrl;
    });
  }

  function makeCanvas(image){
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,image.naturalWidth||image.width||1);
    canvas.height=Math.max(1,image.naturalHeight||image.height||1);
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas;
  }

  async function describe(file,options={}){
    if(!file) return {palette:[],text:""};

    try{
      const dataUrl=await fileToDataUrl(file);
      const image=await decodeImage(dataUrl);
      const canvas=makeCanvas(image);

      let palette=[];
      if(typeof options.extractPalette==="function"){
        try{
          palette=await options.extractPalette(canvas,options.paletteCount||5);
        }catch(_){}
      }else if(global.AsterPaletteExtractor?.extract){
        palette=global.AsterPaletteExtractor.extract(canvas,options.paletteCount||5);
      }

      let text="";
      if(typeof options.extractText==="function"){
        try{
          text=String(await options.extractText(file,canvas)||"").trim();
        }catch(_){}
      }

      return {
        width:canvas.width,
        height:canvas.height,
        palette:Array.isArray(palette)?palette:[],
        text
      };
    }catch(_){
      return {palette:[],text:""};
    }
  }

  function summarize(result,options={}){
    const maxLines=Math.max(1,Number(options.maxTextLines)||12);
    const palette=(Array.isArray(result?.palette)?result.palette:[])
      .map(item=>`${item.hex}${item.percent!=null?` (~${item.percent}%)`:""}`)
      .filter(Boolean);

    const text=String(result?.text||"")
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(0,maxLines)
      .join("\n");

    return {
      dimensions:result?.width&&result?.height
        ? `${result.width}×${result.height}`
        : "",
      palette,
      text
    };
  }

  global.AsterImageAttachmentDescriptor={
    fileToDataUrl,
    decodeImage,
    makeCanvas,
    describe,
    summarize
  };
})(window);
