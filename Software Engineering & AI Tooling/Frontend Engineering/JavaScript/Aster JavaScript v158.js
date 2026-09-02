/* Aster JavaScript v158
Authenticated historical derivative: inline-editable media titles with keyboard-safe commit and persistence hook.
*/
(function(global){
  "use strict";
  if(global.AsterEditableMediaTitle) return;

  function clean(value){
    return String(value||"")
      .replace(/[\u0000-\u001f\u007f]/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  function truncate(value,max=72){
    const text=clean(value);
    return text.length>max ? text.slice(0,Math.max(1,max-1))+"…" : text;
  }

  function moveCaretToEnd(element){
    try{
      const selection=window.getSelection();
      if(!selection) return;
      const range=document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }catch(_){}
  }

  function bind(element,options={}){
    if(!element || element.dataset.asterEditableTitleBound==="1") return null;
    element.dataset.asterEditableTitleBound="1";
    element.setAttribute("contenteditable","true");
    element.setAttribute("spellcheck","false");

    let full=clean(options.value ?? element.textContent ?? "");
    if(!full) full=clean(options.fallback || "Untitled");
    element.dataset.full=full;
    element.textContent=truncate(full,options.maxLength||72);

    const stop=event=>event.stopPropagation();
    const keydown=event=>{
      if(event.key==="Enter"){
        event.preventDefault();
        try{ element.blur(); }catch(_){}
        return;
      }
      event.stopPropagation();
    };
    const focus=()=>{
      const value=element.dataset.full||full;
      if(value) element.textContent=value;
      moveCaretToEnd(element);
    };
    const blur=async()=>{
      let next=clean(element.textContent);
      if(!next) next=clean(options.fallback || full || "Untitled");

      full=next;
      element.dataset.full=next;
      element.textContent=truncate(next,options.maxLength||72);

      if(typeof options.persist==="function"){
        try{
          await options.persist(next);
          element.dataset.persistState="saved";
        }catch(_){
          element.dataset.persistState="error";
        }
      }

      element.dispatchEvent(new CustomEvent("aster:media-title-commit",{
        bubbles:true,
        detail:{title:next}
      }));
    };

    element.addEventListener("pointerdown",stop);
    element.addEventListener("click",stop);
    element.addEventListener("keydown",keydown);
    element.addEventListener("focus",focus);
    element.addEventListener("blur",blur);

    return {
      get value(){ return full; },
      set(value){
        full=clean(value)||full;
        element.dataset.full=full;
        element.textContent=truncate(full,options.maxLength||72);
      },
      destroy(){
        element.removeEventListener("pointerdown",stop);
        element.removeEventListener("click",stop);
        element.removeEventListener("keydown",keydown);
        element.removeEventListener("focus",focus);
        element.removeEventListener("blur",blur);
        delete element.dataset.asterEditableTitleBound;
      }
    };
  }

  global.AsterEditableMediaTitle = {
    clean,
    truncate,
    moveCaretToEnd,
    bind
  };
})(window);
