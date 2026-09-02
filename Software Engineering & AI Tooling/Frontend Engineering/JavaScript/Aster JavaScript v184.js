/* Aster JavaScript v184
Authenticated historical derivative: accessible conversation-sidebar action renderer.
Separates DOM/menu behavior from conversation lifecycle state transitions and delegates mutations through callbacks.
*/
(function(global){
  "use strict";
  if(global.AsterConversationSidebar) return;

  function makeButton(label,action){
    const button=document.createElement("button");
    button.type="button";
    button.setAttribute("role","menuitem");
    button.dataset.action=action;
    button.textContent=label;
    return button;
  }

  function closeMenus(root,except=null){
    if(!root) return;
    root.querySelectorAll("[data-aster-conversation-menu].open").forEach(menu=>{
      if(menu===except) return;
      menu.classList.remove("open");
      menu.previousElementSibling?.setAttribute("aria-expanded","false");
    });
  }

  function render(container,threads,options={}){
    if(!container) return [];
    container.textContent="";
    const lifecycle=options.lifecycle;
    const visible=typeof lifecycle?.visibleSorted==="function"
      ? lifecycle.visibleSorted(threads)
      : (Array.isArray(threads)?threads:[]).filter(item=>item && !item.archived);
    const nodes=[];

    visible.forEach(thread=>{
      const item=document.createElement("div");
      item.className="conversation-item"+(thread.pinned?" pinned":"");
      item.dataset.id=String(thread.id||"");

      const pin=document.createElement("span");
      pin.className="conversation-pin";
      pin.textContent="★";
      pin.hidden=!thread.pinned;
      item.appendChild(pin);

      const name=document.createElement("div");
      name.className="conversation-name";
      name.textContent=String(thread.title||"Untitled");
      item.appendChild(name);

      const actions=document.createElement("div");
      actions.className="conversation-actions";
      const trigger=document.createElement("button");
      trigger.type="button";
      trigger.className="conversation-menu-trigger";
      trigger.title="Actions";
      trigger.setAttribute("aria-haspopup","menu");
      trigger.setAttribute("aria-expanded","false");
      trigger.textContent="⋯";

      const menu=document.createElement("div");
      menu.className="conversation-menu";
      menu.setAttribute("role","menu");
      menu.setAttribute("data-aster-conversation-menu","");
      menu.append(
        makeButton("Rename","rename"),
        makeButton(thread.pinned?"Unpin":"Pin","toggle-pin"),
        makeButton("Download","download"),
        makeButton("Archive","archive"),
        makeButton("Delete","delete")
      );
      actions.append(trigger,menu);
      item.appendChild(actions);

      item.addEventListener("click",event=>{
        if(event.target.closest(".conversation-actions")) return;
        options.onSelect?.(thread,item);
      });

      trigger.addEventListener("click",event=>{
        event.stopPropagation();
        const willOpen=!menu.classList.contains("open");
        closeMenus(container,willOpen?menu:null);
        menu.classList.toggle("open",willOpen);
        trigger.setAttribute("aria-expanded",String(willOpen));
      });

      menu.addEventListener("click",event=>{
        event.stopPropagation();
        const button=event.target.closest("button[data-action]");
        if(!button) return;
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded","false");
        options.onAction?.(button.dataset.action,thread,item);
      });

      container.appendChild(item);
      nodes.push(item);
    });

    return nodes;
  }

  function bindOutsideClose(container,doc=document){
    if(!container || !doc) return ()=>{};
    const handler=event=>{
      if(container.contains(event.target)) return;
      closeMenus(container);
    };
    doc.addEventListener("click",handler,true);
    return ()=>doc.removeEventListener("click",handler,true);
  }

  global.AsterConversationSidebar={render,closeMenus,bindOutsideClose};
})(window);
