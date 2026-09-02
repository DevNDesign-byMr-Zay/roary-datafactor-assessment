/* Aster JavaScript v167
Authenticated historical derivative: attachment metadata reconstruction from persisted message blocks.
Useful for rebuilding attachment chips/context after a conversation is reloaded.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentMetadataParser) return;

  function formatBytes(bytes){
    const value=Number(bytes);
    if(!Number.isFinite(value) || value<0) return "";
    const units=["B","KB","MB","GB"];
    let size=value,index=0;
    while(size>=1024 && index<units.length-1){
      size/=1024;
      index++;
    }
    return `${size.toFixed(size<10&&index>0?1:0)} ${units[index]}`;
  }

  function parse(content){
    const source=String(content||"");
    const match=source.match(/(?:^|\n)---\nATTACHMENTS([\s\S]*?)\n---(?:\n|$)/);
    if(!match) return [];

    const lines=String(match[1]||"").split(/\r?\n/);
    const out=[];

    for(let index=0;index<lines.length;index++){
      const line=lines[index].trim();
      if(!line.startsWith("### ")) continue;

      const name=line.slice(4).trim();
      const detail=String(lines[index+1]||"").trim();
      let size=null;
      let type="";

      const sizeMatch=detail.match(/(\d[\d,]*)\s*bytes/i);
      if(sizeMatch){
        const parsed=Number.parseInt(sizeMatch[1].replace(/,/g,""),10);
        size=Number.isFinite(parsed)?parsed:null;
      }

      const typeMatch=detail.match(/type:\s*([^\s•\]]+)/i);
      if(typeMatch) type=typeMatch[1];

      out.push({name,size,type});
    }

    return out;
  }

  function strip(content){
    return String(content||"")
      .replace(/\n?---\nATTACHMENTS[\s\S]*?\n---/g,"")
      .trim();
  }

  function toDisplayRows(content){
    return parse(content).map(item=>({
      ...item,
      sizeLabel:item.size==null?"":formatBytes(item.size)
    }));
  }

  global.AsterAttachmentMetadataParser={
    formatBytes,
    parse,
    strip,
    toDisplayRows
  };
})(window);
