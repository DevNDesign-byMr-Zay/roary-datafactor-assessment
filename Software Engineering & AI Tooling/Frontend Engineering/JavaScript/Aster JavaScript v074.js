/* Aster JavaScript v074
Authenticated historical derivative: conflict-free model drawer rebuild with listener reset and selection persistence.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerRebuildV1) return;
  window.__asterDrawerRebuildV1 = true;

  const MODEL_KEY = "aster.model.resolved";
  const MODE_KEY = "aster.model.mode";

  function safeGet(key){
    try{ return localStorage.getItem(key) || ""; }catch(_){ return ""; }
  }
  function safeSet(key,value){
    try{ localStorage.setItem(key,String(value)); }catch(_){}
  }
  function modeFor(option){
    const slot = String(option?.getAttribute("data-slot") || "").toLowerCase();
    return slot === "advanced" ? "advanced" : "instant";
  }
  function labelFor(option){
    return option?.getAttribute("data-label") ||
      (modeFor(option) === "advanced" ? "ADVANCED" : "INSTANT");
  }

  function rebuild(options={}){
    const selector = options.wrapSelector || "[data-aster-model-wrap]";
    const original = options.wrap || document.querySelector(selector);
    if(!original || !original.parentNode) return null;

    // Replace the wrapper so conflicting historical listeners cannot survive.
    const wrap = original.cloneNode(true);
    original.parentNode.replaceChild(wrap,original);

    const toggle = wrap.querySelector(options.toggleSelector || "[data-aster-model-toggle]");
    const drawer = wrap.querySelector(options.drawerSelector || "[data-aster-model-drawer]");
    const label = toggle?.querySelector(options.labelSelector || "[data-aster-model-label]");
    const itemSelector = options.itemSelector || "[data-model]";
    const items = drawer ? Array.from(drawer.querySelectorAll(itemSelector)) : [];
    if(!toggle || !drawer || !items.length) return null;

    let closeTimer = null;
    let openState = false;
    const closeDelay = Math.max(80,Number(options.closeDelayMs || 260));

    function selectedOption(){
      const stored = safeGet(MODEL_KEY);
      return items.find(item=>item.getAttribute("data-model") === stored) ||
        items.find(item=>item.getAttribute("aria-selected") === "true") ||
        items[0];
    }
    function render(option){
      if(!option) return;
      const id = String(option.getAttribute("data-model") || "").trim();
      if(!id) return;
      const mode = modeFor(option);
      safeSet(MODEL_KEY,id);
      safeSet(MODE_KEY,mode);
      items.forEach(item=>{
        const active = item === option;
        item.classList.toggle("is-selected",active);
        item.setAttribute("aria-selected",active ? "true" : "false");
      });
      if(label) label.textContent = labelFor(option);
      window.__asterSelectedModel = id;
      document.dispatchEvent(new CustomEvent("aster:model-change",{detail:{model:id,mode}}));
    }
    function setOpen(value){
      openState = !!value;
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      wrap.classList.toggle("open",openState);
      drawer.classList.toggle("open",openState);
      toggle.setAttribute("aria-expanded",openState ? "true" : "false");
      drawer.setAttribute("aria-hidden",openState ? "false" : "true");
      drawer.style.pointerEvents = openState ? "auto" : "";
    }
    function scheduleClose(){
      if(closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(()=>setOpen(false),closeDelay);
    }

    wrap.addEventListener("pointerenter",()=>setOpen(true),true);
    wrap.addEventListener("pointerleave",scheduleClose,true);
    drawer.addEventListener("pointerenter",()=>setOpen(true),true);
    drawer.addEventListener("pointerleave",scheduleClose,true);

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!openState);
    },true);

    items.forEach(item=>item.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      render(item);
      setOpen(false);
      if(typeof options.onSelect === "function"){
        try{ options.onSelect(item.getAttribute("data-model"),modeFor(item)); }catch(_){}
      }
    },true));

    document.addEventListener("pointerdown",event=>{
      if(!wrap.contains(event.target) && !drawer.contains(event.target)) setOpen(false);
    },true);
    document.addEventListener("keydown",event=>{
      if(event.key === "Escape") setOpen(false);
    });

    render(selectedOption());
    return {wrap,toggle,drawer,setOpen,render};
  }

  window.asterModelDrawerRebuild = {rebuild};
})();
