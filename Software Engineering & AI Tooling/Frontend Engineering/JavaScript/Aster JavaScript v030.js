/* Aster JavaScript v030
Authenticated historical derivative: expand-glow synchronization plus side-panel accessibility state repair.
Original product identity, private prompts, credentials, personal paths, and protected reasoning architecture removed.
*/
(function(){
  function fixSidePanelA11y(){
    try{
      const panel = document.getElementById("rtSidePanel");
      if(!panel) return;
      const open = panel.classList.contains("open");
      if(open){
        panel.setAttribute("aria-hidden", "false");
        try{ panel.removeAttribute("inert"); }catch(_){}
      }else{
        panel.setAttribute("aria-hidden", "true");
        try{ panel.setAttribute("inert", ""); }catch(_){}
      }
    }catch(_){}
  }

  let glowEl = null;
  let rafId = 0;
  let lastRectKey = "";

  function isExpandActive(){
    try{
      if(document.body?.dataset?.rtOrbtool === "expand") return true;
    }catch(_){}
    try{
      const panel = document.getElementById("rtSidePanel");
      if(panel?.dataset?.tool === "expand" && panel.classList.contains("open")) return true;
    }catch(_){}
    try{
      const modal = document.getElementById("imageModal");
      if(modal?.classList.contains("expand-focus")) return true;
    }catch(_){}
    return false;
  }

  function ensureGlow(){
    if(glowEl?.isConnected) return glowEl;
    glowEl = document.getElementById("asterExpandGlowLayer");
    if(glowEl) return glowEl;
    glowEl = document.createElement("div");
    glowEl.id = "asterExpandGlowLayer";
    (document.getElementById("imageModal") || document.body).appendChild(glowEl);
    return glowEl;
  }

  function syncGlow(){
    try{
      if(!isExpandActive()) return;
      const frame = document.getElementById("rtExpandFrame");
      const image = document.getElementById("imageModalImg");
      if(!frame || !image) return;

      const rect = frame.getBoundingClientRect();
      if(!rect.width || !rect.height) return;

      const key = [
        Math.round(rect.left),
        Math.round(rect.top),
        Math.round(rect.width),
        Math.round(rect.height)
      ].join(",");
      if(key === lastRectKey) return;
      lastRectKey = key;

      const el = ensureGlow();
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
      el.style.width = rect.width + "px";
      el.style.height = rect.height + "px";

      const area = rect.width * rect.height;
      const alpha = area > 0
        ? Math.max(.55, Math.min(.92, .55 + Math.log10(area / 40000 + 1) * .18))
        : .72;
      el.style.opacity = String(alpha);
    }catch(_){}
  }

  function loop(){
    rafId = 0;
    if(!isExpandActive()){
      lastRectKey = "";
      try{
        const el = document.getElementById("asterExpandGlowLayer");
        if(el) el.style.display = "none";
      }catch(_){}
      return;
    }
    try{ ensureGlow().style.display = "block"; }catch(_){}
    syncGlow();
    rafId = requestAnimationFrame(loop);
  }

  function startLoop(){
    if(!rafId) rafId = requestAnimationFrame(loop);
  }

  function stopLoop(){
    if(rafId){
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    lastRectKey = "";
    try{
      const el = document.getElementById("asterExpandGlowLayer");
      if(el) el.style.display = "none";
    }catch(_){}
  }

  function onStateChange(){
    if(isExpandActive()) startLoop();
    else stopLoop();
  }

  try{
    const panel = document.getElementById("rtSidePanel");
    if(panel){
      new MutationObserver(fixSidePanelA11y).observe(panel, {
        attributes:true,
        attributeFilter:["class", "aria-hidden"]
      });
      new MutationObserver(onStateChange).observe(panel, {
        attributes:true,
        attributeFilter:["class", "data-tool"]
      });
      fixSidePanelA11y();
    }
  }catch(_){}

  try{
    new MutationObserver(onStateChange).observe(document.body, {
      attributes:true,
      attributeFilter:["data-rt-orbtool", "class"]
    });
  }catch(_){}

  try{
    const modal = document.getElementById("imageModal");
    if(modal){
      new MutationObserver(onStateChange).observe(modal, {
        attributes:true,
        attributeFilter:["class"]
      });
    }
  }catch(_){}

  setTimeout(onStateChange, 150);
})();
