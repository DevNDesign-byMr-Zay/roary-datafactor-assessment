/* Aster JavaScript v156
Authenticated historical derivative: drag/drop and clipboard file intake bridge.
Product identity, credentials, proprietary prompts, and protected reasoning/visualization architecture removed.
*/
(function(global){
  "use strict";
  if(global.AsterFileDropBridge) return;

  function copyFilesToInput(input,files){
    if(!input || !files?.length) return false;
    try{
      const transfer = new DataTransfer();
      for(const file of Array.from(files)){
        if(file) transfer.items.add(file);
      }
      input.files = transfer.files;
      input.dispatchEvent(new Event("change",{bubbles:true}));
      return true;
    }catch(_){
      return false;
    }
  }

  function bindDropZone(zone,input,options={}){
    if(!zone || !input || zone.dataset.asterDropBound === "1") return null;
    zone.dataset.asterDropBound = "1";

    const activeClass = options.activeClass || "is-dragover";
    const prevent = event=>{
      event.preventDefault();
      event.stopPropagation();
    };
    const enter = event=>{
      prevent(event);
      zone.classList.add(activeClass);
    };
    const leave = event=>{
      prevent(event);
      zone.classList.remove(activeClass);
    };
    const drop = event=>{
      leave(event);
      const files = Array.from(event.dataTransfer?.files || []);
      if(!files.length) return;
      if(!copyFilesToInput(input,files) && typeof options.onFiles === "function"){
        options.onFiles(files);
      }
    };

    for(const type of ["dragenter","dragover"]){
      zone.addEventListener(type,enter,false);
    }
    for(const type of ["dragleave","dragend"]){
      zone.addEventListener(type,leave,false);
    }
    zone.addEventListener("drop",drop,false);

    return {
      destroy(){
        for(const type of ["dragenter","dragover"]){
          zone.removeEventListener(type,enter,false);
        }
        for(const type of ["dragleave","dragend"]){
          zone.removeEventListener(type,leave,false);
        }
        zone.removeEventListener("drop",drop,false);
        zone.dataset.asterDropBound = "";
      }
    };
  }

  function bindComposerPaste(target,onFiles){
    if(!target || target.dataset.asterPasteFilesBound === "1") return null;
    target.dataset.asterPasteFilesBound = "1";

    const paste = event=>{
      try{
        const files = Array.from(event.clipboardData?.items || [])
          .map(item=>item?.kind === "file" ? item.getAsFile() : null)
          .filter(Boolean);
        if(files.length && typeof onFiles === "function") onFiles(files);
      }catch(_){}
    };

    target.addEventListener("paste",paste,{passive:true});
    return {
      destroy(){
        target.removeEventListener("paste",paste);
        target.dataset.asterPasteFilesBound = "";
      }
    };
  }

  global.AsterFileDropBridge = {
    copyFilesToInput,
    bindDropZone,
    bindComposerPaste
  };
})(window);
