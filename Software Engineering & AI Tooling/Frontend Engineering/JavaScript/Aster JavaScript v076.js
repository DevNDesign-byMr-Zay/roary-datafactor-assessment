/* Aster JavaScript v076
Authenticated historical derivative: hover-stable model drawer with measured bridge width and pointer-coordinate verification.
Provider/model identities, credentials, product identity, proprietary prompts, and protected reasoning UI removed.
*/
(function(){
  "use strict";
  if(window.__asterDrawerHoverStableV1) return;
  window.__asterDrawerHoverStableV1 = true;

  function bind(options={}){
    const wrap = options.wrap || document.querySelector(
      options.wrapSelector || "[data-aster-model-wrap]"
    );
    if(!wrap) return null;
    const toggle = options.toggle || wrap.querySelector(
      options.toggleSelector || "[data-aster-model-toggle]"
    );
    const drawer = options.drawer || wrap.querySelector(
      options.drawerSelector || "[data-aster-model-drawer]"
    );
    if(!toggle || !drawer) return null;

    let bridge = wrap.querySelector("[data-aster-hover-bridge]");
    if(!bridge){
      bridge = document.createElement("div");
      bridge.setAttribute("data-aster-hover-bridge","");
      bridge.setAttribute("aria-hidden","true");
      wrap.appendChild(bridge);
    }

    let lastX = 0;
    let lastY = 0;
    let closeTimer = null;
    let open = false;
    const closeDelay = Math.max(100,Number(options.closeDelayMs || 360));

    function contains(root,node){
      return !!root && !!node && (root === node || root.contains(node));
    }
    function syncBridge(){
      try{
        const buttonBox = toggle.getBoundingClientRect();
        const drawerBox = drawer.getBoundingClientRect();
        const width = Math.max(280,buttonBox.width,drawerBox.width || 0);
        bridge.style.width = `${Math.ceil(width)}px`;
        bridge.style.height = `${Math.max(24,Number(options.bridgeHeight || 44))}px`;
      }catch(_){}
    }
    function setOpen(value){
      open = !!value;
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      wrap.classList.toggle("open",open);
      drawer.classList.toggle("open",open);
      toggle.setAttribute("aria-expanded",open ? "true" : "false");
      drawer.setAttribute("aria-hidden",open ? "false" : "true");
      if(open) syncBridge();
    }
    function pointerInside(){
      const target = document.elementFromPoint(lastX,lastY);
      return contains(wrap,target) || contains(toggle,target) ||
        contains(drawer,target) || contains(bridge,target);
    }
    function scheduleClose(){
      if(closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(()=>{
        if(!pointerInside()) setOpen(false);
      },closeDelay);
    }

    document.addEventListener("pointermove",event=>{
      lastX = event.clientX;
      lastY = event.clientY;
    },{passive:true});

    [toggle,drawer,bridge].forEach(node=>{
      node.addEventListener("pointerenter",()=>setOpen(true),true);
      node.addEventListener("pointerleave",scheduleClose,true);
    });

    toggle.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      setOpen(!open);
    },true);
    document.addEventListener("pointerdown",event=>{
      if(!contains(wrap,event.target) && !contains(drawer,event.target)) setOpen(false);
    },true);
    document.addEventListener("keydown",event=>{
      if(event.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize",syncBridge,{passive:true});

    syncBridge();
    return {wrap,toggle,drawer,bridge,setOpen,scheduleClose,syncBridge};
  }

  window.asterModelDrawerHoverStable = {bind};
})();
