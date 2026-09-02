/* Aster JavaScript v179
   Authenticated historical derivative: attachment-chip rendering and file-type icon classification.
   Rendering uses DOM text nodes, stable indexes, and a caller-provided remove callback.
*/
(function(global){
  "use strict";
  if(global.AsterAttachmentChips) return;

  function extension(name){ return (String(name||"").split(".").pop()||"").toLowerCase(); }
  function iconFor(name,type){
    const ext=extension(name);
    const mime=String(type||"").toLowerCase();
    if(mime.includes("pdf") || ext==="pdf") return "📕";
    if(mime.startsWith("image/") || ["png","jpg","jpeg","gif","webp","svg","ico","bmp","tif","tiff"].includes(ext)) return "🖼️";
    if(["csv","tsv"].includes(ext)) return "📊";
    if(["xlsx","xls"].includes(ext)) return "📈";
    if(["json","yaml","yml","txt","md","xml","html","htm","css","scss","less","js","mjs","cjs","jsx","ts","tsx","py","rb","php","go","rs","java","kt","c","cpp","h","hpp","cs","sql","ps1","bat","sh"].includes(ext)) return "📄";
    if(mime.startsWith("audio/") || ["mp3","wav"].includes(ext)) return "🎵";
    if(mime.startsWith("video/") || ["mp4","mov","avi"].includes(ext)) return "🎞️";
    return "📎";
  }

  function render(row,attachments,options={}){
    if(!row) return 0;
    const list=Array.isArray(attachments) ? attachments : [];
    row.replaceChildren();
    list.forEach((item,index)=>{
      const chip=document.createElement("div");
      chip.className=options.chipClass || "chip";
      const label=document.createElement("span");
      label.textContent=`${iconFor(item?.name,item?.type)} ${String(item?.name || "file")}`;
      const button=document.createElement("button");
      button.type="button";
      button.title=options.removeTitle || "Remove";
      button.dataset.index=String(index);
      button.textContent=options.removeGlyph || "✕";
      button.addEventListener("click",()=>{
        if(typeof options.onRemove==="function") options.onRemove(index,item);
      });
      chip.append(label,button);
      row.appendChild(chip);
    });
    return list.length;
  }

  global.AsterAttachmentChips={extension,iconFor,render};
})(window);
