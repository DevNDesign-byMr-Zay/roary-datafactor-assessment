/* Aster JavaScript v079
Authenticated historical derivative: global pointer-capture hard lock with replacement recovery, hover watchdog, storage sync, and mutation repair.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerHardLockV1) return;
  window.__asterDrawerHardLockV1 = true;

  const isElement = node => !!(node && node.nodeType === 1);
  const inside = (node,root) => isElement(node) && isElement(root) && (node === root || root.contains(node));

  function boot(options={}){
    const selectors = {
      wrap: options.wrapSelector || "[data-aster-model-wrap]",
      toggle: options.toggleSelector || "[data-aster-model-toggle]",
      drawer: options.drawerSelector || "[data-aster-model-drawer]",
      label: options.labelSelector || "[data-aster-model-label]"
    };
    const get = () => ({
      wrap: document.querySelector(selectors.wrap),
      toggle: document.querySelector(selectors.toggle),
      drawer: document.querySelector(selectors.drawer),
      label: document.querySelector(selectors.label)
    });

    let lastWrap = null;
    let rafId = 0;
    let closeAt = 0;
    let observedDrawer = null;
    let observer = null;

    function ensureBridge(wrap,drawer){
      if(!wrap || !drawer) return null;
      let bridge = wrap.querySelector("[data-aster-hover-bridge]");
      if(!bridge){
        bridge = document.createElement("div");
        bridge.setAttribute("data-aster-hover-bridge","");
        bridge.setAttribute("aria-hidden","true");
        wrap.appendChild(bridge);
      }
      bridge.style.width = `${Math.max(drawer.offsetWidth || 330,330)}px`;
      return bridge;
    }

    function setOpen(value,force=false){
      const {wrap,toggle,drawer} = get();
      if(!wrap || !toggle || !drawer) return;
      const open = !!value;
      if(!open && !force && drawer.contains(document.activeElement)) return;
      if(!open && drawer.contains(document.activeElement)){
        try{ toggle.focus({preventScroll:true}); }catch(_){}
      }
      wrap.classList.toggle("open",open);
      drawer.classList.toggle("open",open);
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
      if(open) ensureBridge(wrap,drawer);
    }

    function select(option){
      const {drawer,label} = get();
      if(!drawer || !option) return;
      const slot = (option.getAttribute("data-slot") || "instant").toLowerCase();
      const value = option.getAttribute("data-model") || slot;
      try{
        localStorage.setItem("aster.model",value);
        localStorage.setItem("aster.modelMode",slot);
      }catch(_){}
      drawer.querySelectorAll("[data-slot]").forEach(node=>{
        const selected = node === option;
        node.classList.toggle("is-selected",selected);
        node.setAttribute("aria-selected",selected ? "true" : "false");
      });
      if(label) label.textContent = slot.toUpperCase();
      if(typeof options.onSelect === "function") options.onSelect({slot,value,option});
    }

    if(!window.__asterDrawerGlobalCaptureV1){
      window.__asterDrawerGlobalCaptureV1 = true;
      window.addEventListener("pointerdown",event=>{
        const {wrap,toggle,drawer} = get();
        if(!wrap || !toggle || !drawer) return;
        const target = event.target;
        const option = isElement(target) && target.closest ? target.closest("[data-slot]") : null;
        if(option && drawer.contains(option)){
          event.preventDefault();
          event.stopImmediatePropagation();
          select(option);
          setTimeout(()=>setOpen(false,true),0);
          return;
        }
        if(inside(target,wrap) || inside(target,drawer) || inside(target,toggle)){
          event.stopImmediatePropagation();
        }
      },true);
    }

    function syncFromStorage(){
      const {drawer,label} = get();
      if(!drawer) return;
      let mode = "instant";
      try{ mode = localStorage.getItem("aster.modelMode") || "instant"; }catch(_){}
      let matched = false;
      drawer.querySelectorAll("[data-slot]").forEach(node=>{
        const selected = (node.getAttribute("data-slot") || "").toLowerCase() === mode.toLowerCase();
        node.classList.toggle("is-selected",selected);
        node.setAttribute("aria-selected",selected ? "true" : "false");
        if(selected) matched = true;
      });
      if(label) label.textContent = (matched ? mode : "instant").toUpperCase();
    }

    function ensureObserver(){
      const {drawer} = get();
      if(!drawer || drawer === observedDrawer) return;
      if(observer) observer.disconnect();
      observedDrawer = drawer;
      observer = new MutationObserver(()=>{
        const {wrap,toggle,drawer:current} = get();
        if(!wrap || !toggle || !current) return;
        const shouldOpen = wrap.matches(":hover") || current.matches(":hover") ||
          toggle.matches(":hover") || current.contains(document.activeElement);
        if(shouldOpen) setOpen(true);
      });
      observer.observe(drawer,{attributes:true,attributeFilter:["class","style","aria-hidden"]});
    }

    function loop(){
      const {wrap,toggle,drawer} = get();
      if(!wrap || !toggle || !drawer){
        rafId = requestAnimationFrame(loop);
        return;
      }
      if(wrap !== lastWrap){
        lastWrap = wrap;
        ensureBridge(wrap,drawer);
        syncFromStorage();
        ensureObserver();
      }
      const bridge = ensureBridge(wrap,drawer);
      const hovered = wrap.matches(":hover") || drawer.matches(":hover") ||
        toggle.matches(":hover") || (bridge && bridge.matches(":hover"));
      const focused = drawer.contains(document.activeElement);
      if(hovered || focused){
        closeAt = 0;
        setOpen(true);
      }else{
        if(!closeAt) closeAt = performance.now() + Math.max(120,Number(options.closeDelayMs || 260));
        if(performance.now() > closeAt) setOpen(false);
      }
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener("storage",event=>{
      if(event.key === "aster.model" || event.key === "aster.modelMode") syncFromStorage();
    });
    syncFromStorage();
    ensureObserver();
    rafId = requestAnimationFrame(loop);
    return {get,setOpen,select,syncFromStorage,stop(){cancelAnimationFrame(rafId); if(observer) observer.disconnect();}};
  }

  window.asterModelDrawerHardLock = {boot};
})();
