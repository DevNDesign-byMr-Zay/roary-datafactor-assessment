/* Aster JavaScript v075
Authenticated historical derivative: surgical model-drawer replacement with gap bridge and application-state synchronization.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerSurgicalV1) return;
  window.__asterDrawerSurgicalV1 = true;

  function safeGet(key){ try{ return localStorage.getItem(key) || ""; }catch(_){ return ""; } }
  function safeSet(key,value){ try{ localStorage.setItem(key,String(value)); }catch(_){} }

  function buildBridge(wrap,toggle,drawer){
    const old = wrap.querySelector("[data-aster-model-bridge]");
    if(old) old.remove();
    const bridge = document.createElement("div");
    bridge.setAttribute("data-aster-model-bridge","");
    bridge.setAttribute("aria-hidden","true");
    wrap.appendChild(bridge);

    const syncGeometry = ()=>{
      const toggleBox = toggle.getBoundingClientRect();
      const drawerBox = drawer.getBoundingClientRect();
      const width = Math.max(toggleBox.width,drawerBox.width || 0,280);
      bridge.style.width = `${Math.ceil(width)}px`;
      bridge.style.height = `${Math.max(18,Math.ceil(toggleBox.top - drawerBox.bottom + 12))}px`;
    };
    syncGeometry();
    window.addEventListener("resize",syncGeometry,{passive:true});
    return {bridge,syncGeometry};
  }

  function bind(options={}){
    const original = options.wrap || document.querySelector(
      options.wrapSelector || "[data-aster-model-wrap]"
    );
    if(!original || !original.parentNode) return null;

    // Surgical listener reset: replace only the model-control subtree.
    const wrap = original.cloneNode(true);
    original.parentNode.replaceChild(wrap,original);

    const toggle = wrap.querySelector(options.toggleSelector || "[data-aster-model-toggle]");
    const drawer = wrap.querySelector(options.drawerSelector || "[data-aster-model-drawer]");
    const label = toggle?.querySelector(options.labelSelector || "[data-aster-model-label]");
    const items = drawer ? Array.from(drawer.querySelectorAll(options.itemSelector || "[data-model]")) : [];
    if(!toggle || !drawer || !items.length) return null;

    const {bridge,syncGeometry} = buildBridge(wrap,toggle,drawer);
    const storageKey = options.storageKey || "aster.model.resolved";
    const closeDelay = Math.max(100,Number(options.closeDelayMs || 420));
    let closeTimer = null;
    let open = false;

    function modeFor(item){
      return String(item?.getAttribute("data-slot") || "").toLowerCase() === "advanced"
        ? "advanced" : "instant";
    }
    function syncRegistry(selectedId){
      const registry = options.registry || window.asterModelRegistry;
      if(!registry || typeof registry !== "object") return;
      try{
        registry.selected = selectedId;
        registry.mode = modeFor(items.find(item=>item.getAttribute("data-model") === selectedId));
      }catch(_){}
    }
    function render(id){
      const target = items.find(item=>item.getAttribute("data-model") === id) || items[0];
      if(!target) return;
      const resolved = String(target.getAttribute("data-model") || "").trim();
      if(!resolved) return;
      safeSet(storageKey,resolved);
      items.forEach(item=>{
        const selected = item === target;
        item.classList.toggle("is-selected",selected);
        item.setAttribute("aria-selected",selected ? "true" : "false");
      });
      if(label){
        label.textContent = target.getAttribute("data-label") ||
          (modeFor(target) === "advanced" ? "ADVANCED" : "INSTANT");
      }
      syncRegistry(resolved);
    }
    function setOpen(value){
      open = !!value;
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      wrap.classList.toggle("open",open);
      drawer.classList.toggle("open",open);
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
      if(open) syncGeometry();
    }
    function scheduleClose(){
      if(closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(()=>setOpen(false),closeDelay);
    }

    [wrap,drawer,bridge].forEach(node=>{
      node.addEventListener("pointerenter",()=>setOpen(true),true);
      node.addEventListener("pointerleave",scheduleClose,true);
    });

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!open);
    },true);

    items.forEach(item=>item.addEventListener("click",async event=>{
      event.preventDefault();
      event.stopPropagation();
      const id = String(item.getAttribute("data-model") || "").trim();
      if(!id) return;
      render(id);
      try{
        if(typeof options.applyModel === "function") await options.applyModel(id,modeFor(item));
        else if(typeof window.asterApplyModel === "function") await window.asterApplyModel(id,modeFor(item));
      }catch(_){}
      setOpen(false);
    },true));

    render(safeGet(storageKey));
    return {wrap,toggle,drawer,bridge,setOpen,render};
  }

  window.asterModelDrawerSurgical = {bind};
})();
