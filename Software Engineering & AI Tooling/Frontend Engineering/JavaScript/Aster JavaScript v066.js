/* Aster JavaScript v066
Authenticated historical derivative: legacy-listener reset and pointer-coordinate hover bridge for popover drawers.
Product identity, provider/model identities, credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerHoverBridgeV1) return;
  window.__asterDrawerHoverBridgeV1 = true;

  function contains(root,node){
    return !!root && !!node && (root === node || root.contains(node));
  }

  function resetLegacyListeners(wrap,options={}){
    if(!wrap || !wrap.parentNode) return wrap;
    if(options.clone === false) return wrap;

    try{
      const clone = wrap.cloneNode(true);
      wrap.parentNode.replaceChild(clone,wrap);
      return clone;
    }catch(_){
      return wrap;
    }
  }

  function bind(options={}){
    let wrap =
      options.wrap ||
      document.querySelector(options.wrapSelector || "[data-aster-drawer-wrap]");
    if(!wrap) return null;

    wrap = resetLegacyListeners(wrap,options);

    const toggle =
      options.toggle ||
      wrap.querySelector(options.toggleSelector || "[data-aster-drawer-toggle]");
    const drawer =
      options.drawer ||
      wrap.querySelector(options.drawerSelector || "[data-aster-drawer]");

    if(!toggle || !drawer) return null;

    drawer.style.pointerEvents = "auto";

    let closeTimer = null;
    let lastX = 0;
    let lastY = 0;
    const closeDelay = Math.max(80,Number(options.closeDelayMs || 420));

    const clearClose = ()=>{
      if(closeTimer){
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const open = ()=>{
      clearClose();
      wrap.classList.add("open");
      drawer.classList.add("open");
      toggle.setAttribute("aria-expanded","true");
      drawer.setAttribute("aria-hidden","false");
      drawer.style.pointerEvents = "auto";
      if(typeof options.onOpen === "function"){
        try{ options.onOpen({wrap,toggle,drawer}); }catch(_){}
      }
    };

    const close = ()=>{
      clearClose();
      wrap.classList.remove("open");
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
      drawer.setAttribute("aria-hidden","true");
      if(typeof options.onClose === "function"){
        try{ options.onClose({wrap,toggle,drawer}); }catch(_){}
      }
    };

    const pointerIsInside = ()=>{
      const target = document.elementFromPoint(lastX,lastY);
      return contains(wrap,target) ||
        contains(toggle,target) ||
        contains(drawer,target);
    };

    const scheduleClose = ()=>{
      clearClose();
      closeTimer = setTimeout(()=>{
        if(!pointerIsInside()) close();
      },closeDelay);
    };

    document.addEventListener("pointermove",event=>{
      lastX = event.clientX;
      lastY = event.clientY;
    },{passive:true});

    const onLeave = event=>{
      const related = event.relatedTarget;
      if(
        contains(wrap,related) ||
        contains(toggle,related) ||
        contains(drawer,related)
      ) return;
      scheduleClose();
    };

    toggle.addEventListener("pointerenter",open,true);
    toggle.addEventListener("pointerleave",onLeave,true);
    drawer.addEventListener("pointerenter",open,true);
    drawer.addEventListener("pointerleave",onLeave,true);

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      if(
        wrap.classList.contains("open") ||
        drawer.classList.contains("open")
      ) close();
      else open();
    },true);

    toggle.addEventListener("pointerdown",event=>event.stopPropagation(),true);
    drawer.addEventListener("pointerdown",event=>event.stopPropagation(),true);

    document.addEventListener("pointerdown",event=>{
      const target = event.target;
      if(
        contains(wrap,target) ||
        contains(toggle,target) ||
        contains(drawer,target)
      ) return;
      close();
    },true);

    document.addEventListener("keydown",event=>{
      if(event.key === "Escape") close();
    });

    return {wrap,toggle,drawer,open,close,scheduleClose};
  }

  window.asterDrawerHoverBridge = {
    resetLegacyListeners,
    bind
  };
})();
