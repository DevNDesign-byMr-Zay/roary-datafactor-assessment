/* Aster JavaScript v181
   Authenticated historical derivative: persisted attachment disclosure panel.
   Attachment metadata is normalized into a compact accessible summary that expands to
   filename, MIME type, and byte-size details without using innerHTML for user filenames.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentDisclosure) return;

  function formatBytes(bytes){
    const value=Number(bytes);
    if(!Number.isFinite(value)||value<=0) return "";
    const units=["B","KB","MB","GB","TB"];
    let size=value,index=0;
    while(size>=1024&&index<units.length-1){size/=1024;index++;}
    const precision=index===0?0:(size>=10?1:2);
    return `${size.toFixed(precision)} ${units[index]}`;
  }

  function normalize(attachments, maxItems=30){
    return (Array.isArray(attachments)?attachments:[])
      .map(item=>{
        const value=item&&typeof item==="object"?item:{};
        return {
          name:String(value.name||value.filename||"file").trim()||"file",
          type:String(value.type||value.mime||"binary").trim()||"binary",
          size:Number.isFinite(Number(value.size))?Math.max(0,Number(value.size)):0
        };
      })
      .slice(0,Math.max(1,Math.min(100,Number(maxItems)||30)));
  }

  function defaultIcon(item){
    const type=String(item?.type||"").toLowerCase();
    if(type.startsWith("image/")) return "IMG";
    if(type==="application/pdf") return "PDF";
    if(type.startsWith("text/")) return "TXT";
    if(type.startsWith("audio/")) return "AUD";
    if(type.startsWith("video/")) return "VID";
    return "FILE";
  }

  function create(attachments, options={}){
    const items=normalize(attachments,options.maxItems);
    if(!items.length) return null;
    const iconFor=typeof options.iconFor==="function"?options.iconFor:defaultIcon;

    const root=document.createElement("section");
    root.className=options.className||"aster-attachments";
    root.setAttribute("aria-label",options.ariaLabel||"Attachments");

    const head=document.createElement("button");
    head.type="button";
    head.className="aster-attachments-toggle";
    head.setAttribute("aria-expanded","false");

    const label=document.createElement("span");
    label.textContent=options.label||"Attachments";
    head.appendChild(label);

    const chips=document.createElement("span");
    chips.className="aster-attachments-chips";
    for(const item of items){
      const chip=document.createElement("span");
      chip.className="aster-attachment-chip";
      chip.textContent=String(iconFor(item)||"FILE");
      chips.appendChild(chip);
    }
    head.appendChild(chips);

    const list=document.createElement("div");
    list.className="aster-attachments-list";
    list.hidden=true;
    for(const item of items){
      const row=document.createElement("div");
      row.className="aster-attachment-row";
      const icon=document.createElement("span");
      icon.className="aster-attachment-icon";
      icon.textContent=String(iconFor(item)||"FILE");
      const info=document.createElement("span");
      const name=document.createElement("strong");
      name.textContent=item.name;
      const detail=document.createElement("small");
      detail.textContent=item.type+(item.size?` • ${formatBytes(item.size)}`:"");
      info.append(name,document.createElement("br"),detail);
      row.append(icon,info);
      list.appendChild(row);
    }

    function setOpen(open){
      const value=Boolean(open);
      root.classList.toggle("is-open",value);
      head.setAttribute("aria-expanded",value?"true":"false");
      list.hidden=!value;
    }
    head.addEventListener("click",()=>setOpen(list.hidden));
    root.append(head,list);
    root.setOpen=setOpen;
    return root;
  }

  global.AsterAttachmentDisclosure={formatBytes,normalize,create};
})(typeof window!=="undefined"?window:globalThis);
