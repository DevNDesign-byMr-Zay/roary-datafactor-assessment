/* Aster JavaScript v187
Authenticated historical derivative: portal-backed floating select controller.
Renders options with DOM text nodes, portals the listbox to document.body for clipping safety, repositions on resize, and closes on Escape/outside click.
*/
(function(global){
  "use strict";
  if(global.AsterFloatingSelect) return;

  function create(mount,options=[],config={}){
    if(!(mount instanceof HTMLElement)) return null;
    const normalized=(Array.isArray(options)?options:[]).map(item=>({
      value:String(item?.value??""),
      label:String(item?.label??item?.value??""),
      hint:String(item?.hint??"")
    }));

    mount.replaceChildren();
    const button=document.createElement("button");
    button.type="button";
    button.className=config.buttonClass||"aster-fs-button";
    button.setAttribute("aria-haspopup","listbox");
    button.setAttribute("aria-expanded","false");

    const label=document.createElement("span");
    label.className=config.labelClass||"aster-fs-label";
    const caret=document.createElement("span");
    caret.className=config.caretClass||"aster-fs-caret";
    caret.setAttribute("aria-hidden","true");
    caret.textContent=config.caret||"▾";
    button.append(label,caret);

    const menu=document.createElement("div");
    menu.className=config.menuClass||"aster-fs-menu";
    menu.setAttribute("role","listbox");
    mount.append(button,menu);

    let value=String(config.value??normalized[0]?.value??"");
    let portaled=false;

    function selected(){return normalized.find(item=>item.value===value)||normalized[0]||null;}

    function setLabel(){
      const item=selected();
      label.textContent=item?(item.hint?`${item.label} — ${item.hint}`:item.label):"";
    }

    function setValue(next,emit=true){
      const item=normalized.find(entry=>entry.value===String(next));
      if(!item) return false;
      value=item.value;
      setLabel();
      if(emit&&typeof config.onChange==="function") config.onChange(value,item);
      return true;
    }

    function renderMenu(){
      menu.replaceChildren();
      normalized.forEach(item=>{
        const option=document.createElement("div");
        option.className=config.optionClass||"aster-fs-option";
        option.setAttribute("role","option");
        option.setAttribute("aria-selected",item.value===value?"true":"false");
        option.dataset.value=item.value;
        const title=document.createElement("div");
        title.textContent=item.label;
        option.appendChild(title);
        if(item.hint){
          const hint=document.createElement("small");
          hint.textContent=item.hint;
          option.appendChild(hint);
        }
        option.addEventListener("click",()=>{setValue(item.value,true);close();});
        menu.appendChild(option);
      });
    }

    function position(){
      if(!portaled) return;
      const rect=button.getBoundingClientRect();
      Object.assign(menu.style,{
        position:"fixed",
        left:`${rect.left}px`,
        top:`${rect.bottom+(Number(config.gap)||8)}px`,
        minWidth:`${Math.max(Number(config.minWidth)||260,rect.width)}px`
      });
    }

    function outside(event){
      if(event.target===button||button.contains(event.target)||menu.contains(event.target)) return;
      close();
    }
    function keydown(event){if(event.key==="Escape") close();}

    function open(){
      if(portaled) return;
      renderMenu();
      document.body.appendChild(menu);
      portaled=true;
      position();
      button.setAttribute("aria-expanded","true");
      requestAnimationFrame(()=>menu.classList.add("open"));
      document.addEventListener("click",outside,true);
      document.addEventListener("keydown",keydown);
      global.addEventListener("resize",position);
    }

    function close(){
      if(!portaled) return;
      button.setAttribute("aria-expanded","false");
      menu.classList.remove("open");
      document.removeEventListener("click",outside,true);
      document.removeEventListener("keydown",keydown);
      global.removeEventListener("resize",position);
      mount.appendChild(menu);
      menu.removeAttribute("style");
      portaled=false;
    }

    button.addEventListener("click",event=>{
      event.stopPropagation();
      portaled?close():open();
    });

    setLabel();
    return {open,close,position,renderMenu,setValue,getValue:()=>value,destroy:()=>{close();mount.replaceChildren();}};
  }

  global.AsterFloatingSelect={create};
})(typeof window!=="undefined"?window:globalThis);
