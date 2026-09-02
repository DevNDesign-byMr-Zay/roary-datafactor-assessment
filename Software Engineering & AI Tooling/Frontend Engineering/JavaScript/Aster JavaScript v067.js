/* Aster JavaScript v067
Authenticated historical derivative: portal-safe drawer conflict recovery with DOM reparent/restore.
Product identity, provider/model identities, credentials, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterPortalDrawerRecoveryV1) return;
  window.__asterPortalDrawerRecoveryV1 = true;

  function bind(options={}){
    let wrap =
      options.wrap ||
      document.querySelector(options.wrapSelector || "[data-aster-drawer-wrap]");
    if(!wrap) return null;

    let toggle =
      options.toggle ||
      wrap.querySelector(options.toggleSelector || "[data-aster-drawer-toggle]");
    let drawer =
      options.drawer ||
      wrap.querySelector(options.drawerSelector || "[data-aster-drawer]");

    if(!toggle || !drawer) return null;

    // If an earlier controller already portaled the drawer, restore it before
    // cloning so the rebuilt subtree is structurally complete.
    if(drawer.parentElement !== wrap){
      try{ wrap.appendChild(drawer); }catch(_){}
    }

    if(options.resetLegacyListeners !== false && wrap.parentNode){
      try{
        const clone = wrap.cloneNode(true);
        wrap.parentNode.replaceChild(clone,wrap);
        wrap = clone;
        toggle = wrap.querySelector(options.toggleSelector || "[data-aster-drawer-toggle]");
        drawer = wrap.querySelector(options.drawerSelector || "[data-aster-drawer]");
      }catch(_){}
    }

    if(!toggle || !drawer) return null;

    const homeParent = drawer.parentElement;
    const homeNext = drawer.nextSibling;
    let openState = false;
    let closeTimer = null;
    let overWrap = false;
    let overDrawer = false;
    const closeDelay = Math.max(80,Number(options.closeDelayMs || 260));

    const position = ()=>{
      try{
        const anchor = toggle.getBoundingClientRect();
        const width = Math.max(
          Number(options.minWidth || 280),
          anchor.width
        );

        drawer.style.position = "fixed";
        drawer.style.width = `${width}px`;
        drawer.style.maxWidth = "min(420px, calc(100vw - 16px))";
        drawer.style.zIndex = String(options.zIndex || 999999);

        // Prefer above the control, fall back below if there is insufficient room.
        const measured = drawer.getBoundingClientRect();
        let left = anchor.left;
        left = Math.max(8,Math.min(
          left,
          window.innerWidth - Math.min(width,measured.width || width) - 8
        ));

        let top = anchor.top - (measured.height || 0) - 12;
        if(top < 8) top = anchor.bottom + 10;

        drawer.style.left = `${Math.round(left)}px`;
        drawer.style.top = `${Math.round(Math.max(8,top))}px`;
      }catch(_){}
    };

    const portalIn = ()=>{
      try{
        if(drawer.parentElement !== document.body){
          document.body.appendChild(drawer);
        }
        drawer.classList.add("aster-portal-fixed");
        position();
        window.addEventListener("resize",position);
        window.addEventListener("scroll",position,true);
      }catch(_){}
    };

    const portalOut = ()=>{
      try{
        window.removeEventListener("resize",position);
        window.removeEventListener("scroll",position,true);
        drawer.classList.remove("aster-portal-fixed");

        drawer.style.position = "";
        drawer.style.left = "";
        drawer.style.top = "";
        drawer.style.width = "";
        drawer.style.maxWidth = "";
        drawer.style.zIndex = "";

        if(homeParent){
          if(homeNext && homeNext.parentNode === homeParent){
            homeParent.insertBefore(drawer,homeNext);
          }else{
            homeParent.appendChild(drawer);
          }
        }
      }catch(_){}
    };

    const setOpen = value=>{
      const next = !!value;
      if(next === openState) return;
      openState = next;

      toggle.setAttribute("aria-expanded",next ? "true" : "false");
      drawer.setAttribute("aria-hidden",next ? "false" : "true");
      wrap.classList.toggle("open",next);
      drawer.classList.toggle("open",next);

      if(next){
        portalIn();
      }else{
        if(closeTimer) clearTimeout(closeTimer);
        closeTimer = null;
        setTimeout(()=>{
          if(!openState) portalOut();
        },Number(options.restoreDelayMs || 180));
      }
    };

    const scheduleClose = ()=>{
      if(closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(()=>{
        if(!overWrap && !overDrawer) setOpen(false);
      },closeDelay);
    };

    wrap.addEventListener("pointerenter",()=>{
      overWrap = true;
      setOpen(true);
    },true);
    wrap.addEventListener("pointerleave",()=>{
      overWrap = false;
      scheduleClose();
    },true);
    drawer.addEventListener("pointerenter",()=>{
      overDrawer = true;
      setOpen(true);
    },true);
    drawer.addEventListener("pointerleave",()=>{
      overDrawer = false;
      scheduleClose();
    },true);

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!openState);
    },true);

    toggle.addEventListener("pointerdown",event=>event.stopPropagation(),true);
    drawer.addEventListener("pointerdown",event=>event.stopPropagation(),true);
    drawer.addEventListener("click",event=>event.stopPropagation(),true);

    document.addEventListener("click",event=>{
      if(!openState) return;
      const target = event.target;
      if(wrap.contains(target) || drawer.contains(target)) return;
      setOpen(false);
    },true);

    document.addEventListener("keydown",event=>{
      if(openState && event.key === "Escape") setOpen(false);
    },true);

    return {open:()=>setOpen(true),close:()=>setOpen(false),position,portalIn,portalOut};
  }

  window.asterPortalDrawerRecovery = {bind};
})();
