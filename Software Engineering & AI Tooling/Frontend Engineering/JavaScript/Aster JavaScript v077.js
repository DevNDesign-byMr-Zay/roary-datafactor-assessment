/* Aster JavaScript v077
Authenticated historical derivative: hover-locked model drawer with a frame-driven hover watchdog and delayed close.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerHoverLockV1) return;
  window.__asterDrawerHoverLockV1 = true;

  function bind(options={}){
    const oldWrap = options.wrap || document.querySelector(options.wrapSelector || "[data-aster-model-wrap]");
    if(!oldWrap) return null;

    const wrap = oldWrap.cloneNode(true);
    oldWrap.parentNode.replaceChild(wrap, oldWrap);

    const toggle = wrap.querySelector(options.toggleSelector || "[data-aster-model-toggle]");
    const drawer = wrap.querySelector(options.drawerSelector || "[data-aster-model-drawer]");
    const label = wrap.querySelector(options.labelSelector || "[data-aster-model-label]");
    if(!toggle || !drawer) return null;

    let closeAt = 0;
    let rafId = 0;
    const delay = Math.max(100, Number(options.closeDelayMs || 240));

    function setOpen(value){
      const open = !!value;
      wrap.classList.toggle("open", open);
      drawer.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      drawer.style.pointerEvents = open ? "auto" : "none";
    }

    function select(option){
      if(!option) return;
      const slot = (option.getAttribute("data-slot") || "").toLowerCase();
      const value = option.getAttribute("data-model") || slot || "default";
      try{
        localStorage.setItem("aster.model", value);
        localStorage.setItem("aster.modelMode", slot || "instant");
      }catch(_){}
      drawer.querySelectorAll("[data-slot]").forEach(node=>{
        const selected = node === option;
        node.classList.toggle("is-selected", selected);
        node.setAttribute("aria-selected", selected ? "true" : "false");
      });
      if(label) label.textContent = (slot || "instant").toUpperCase();
      if(typeof options.onSelect === "function") options.onSelect({slot,value,option});
      setOpen(false);
    }

    toggle.addEventListener("click", event=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!drawer.classList.contains("open"));
    }, true);

    drawer.addEventListener("pointerdown", event=>{
      const option = event.target.closest && event.target.closest("[data-slot]");
      if(!option || !drawer.contains(option)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      select(option);
    }, true);

    function loop(){
      const hovering = wrap.matches(":hover") || toggle.matches(":hover") || drawer.matches(":hover");
      const focused = drawer.contains(document.activeElement);
      if(hovering || focused){
        closeAt = 0;
        setOpen(true);
      }else{
        if(!closeAt) closeAt = performance.now() + delay;
        if(performance.now() >= closeAt) setOpen(false);
      }
      rafId = requestAnimationFrame(loop);
    }

    setOpen(false);
    rafId = requestAnimationFrame(loop);
    return {wrap,toggle,drawer,label,setOpen,select,destroy(){cancelAnimationFrame(rafId);}};
  }

  window.asterModelDrawerHoverLock = {bind};
})();
