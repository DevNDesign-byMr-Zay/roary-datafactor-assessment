/* Aster JavaScript v078
Authenticated historical derivative: capture-safe drawer selection with a measured hover bridge and state synchronization.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerCaptureSafeV1) return;
  window.__asterDrawerCaptureSafeV1 = true;

  const inside = (node, root) => !!(node && root && (node === root || root.contains(node)));

  function install(options={}){
    const oldWrap = options.wrap || document.querySelector(options.wrapSelector || "[data-aster-model-wrap]");
    if(!oldWrap) return null;

    const wrap = oldWrap.cloneNode(true);
    oldWrap.parentNode.replaceChild(wrap, oldWrap);

    const toggle = wrap.querySelector(options.toggleSelector || "[data-aster-model-toggle]");
    const drawer = wrap.querySelector(options.drawerSelector || "[data-aster-model-drawer]");
    const label = wrap.querySelector(options.labelSelector || "[data-aster-model-label]");
    if(!toggle || !drawer) return null;

    let bridge = wrap.querySelector("[data-aster-hover-bridge]");
    if(!bridge){
      bridge = document.createElement("div");
      bridge.setAttribute("data-aster-hover-bridge","");
      bridge.setAttribute("aria-hidden","true");
      wrap.appendChild(bridge);
    }

    let closeTimer = null;
    function sizeBridge(){
      const width = Math.max(220, drawer.offsetWidth || 330);
      bridge.style.width = `${Math.ceil(width)}px`;
    }
    function open(){
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      sizeBridge();
      wrap.classList.add("open");
      drawer.classList.add("open");
      drawer.style.pointerEvents = "auto";
      drawer.setAttribute("aria-hidden","false");
      toggle.setAttribute("aria-expanded","true");
    }
    function close(){
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      try{
        if(inside(document.activeElement, drawer)) toggle.focus({preventScroll:true});
      }catch(_){}
      wrap.classList.remove("open");
      drawer.classList.remove("open");
      drawer.style.pointerEvents = "none";
      drawer.setAttribute("aria-hidden","true");
      toggle.setAttribute("aria-expanded","false");
    }
    function scheduleClose(){
      clearTimeout(closeTimer);
      closeTimer = setTimeout(()=>{
        const hovering = wrap.matches(":hover") || drawer.matches(":hover") ||
          toggle.matches(":hover") || bridge.matches(":hover");
        if(!hovering && !inside(document.activeElement, drawer)) close();
      }, Math.max(100,Number(options.closeDelayMs || 220)));
    }

    [toggle,drawer,bridge].forEach(node=>{
      node.addEventListener("pointerenter",open,true);
      node.addEventListener("pointerleave",scheduleClose,true);
    });
    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      drawer.classList.contains("open") ? close() : open();
    },true);

    const guard = event=>{
      const target = event.target;
      if(inside(target,wrap) || inside(target,drawer) || inside(target,toggle) || inside(target,bridge)){
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("pointerdown",guard,true);
    window.addEventListener("mousedown",guard,true);

    const select = option=>{
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
      close();
    };
    const optionCapture = event=>{
      const option = event.target.closest && event.target.closest("[data-slot]");
      if(!option || !drawer.contains(option)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      select(option);
    };
    window.addEventListener("pointerdown",optionCapture,true);

    const observer = new MutationObserver(()=>{
      const isOpen = drawer.classList.contains("open") ||
        wrap.classList.contains("open") || drawer.getAttribute("aria-hidden")==="false";
      drawer.style.pointerEvents = isOpen ? "auto" : "none";
      if(isOpen) sizeBridge();
    });
    observer.observe(drawer,{attributes:true,attributeFilter:["class","aria-hidden","style"]});

    close();
    return {wrap,toggle,drawer,bridge,open,close,select,sizeBridge,observer};
  }

  window.asterModelDrawerCaptureSafe = {install};
})();
