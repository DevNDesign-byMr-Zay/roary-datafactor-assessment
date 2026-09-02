/* ===== ASTER PATCH v6: Expand glow under image + Erase/Remove Execute reliability (NO UI redesign) ===== */
(function(){
  const log = (...a)=>{ try{ console.log("[ASTER][Patchv6]", ...a);}catch(e){} };
  const warn = (...a)=>{ try{ console.warn("[ASTER][Patchv6]", ...a);}catch(e){} };
  const err = (...a)=>{ try{ console.error("[ASTER][Patchv6]", ...a);}catch(e){} };

  function $(sel, root){ try{ return (root||document).querySelector(sel);}catch(e){ return null; } }
  function id(x){ return document.getElementById(x); }

  function getActiveTool(){
    const panel = id("rtSidePanel");
    const t = (panel && (panel.dataset.tool || panel.getAttribute("data-tool"))) || "";
    return String(t||"").toLowerCase();
  }

  function toast(msg){
    // Prefer your existing logger/toast if present
    try{
      if(typeof window.asterToast === "function") return window.asterToast(String(msg||""));
      if(typeof window.toast === "function") return window.toast(String(msg||""));
      if(typeof window.showToast === "function") return window.showToast(String(msg||""));
      // fallback: console + small DOM toast
      const s = String(msg||"");
      log(s);
      let t = id("asterPatchToast");
      if(!t){
        t = document.createElement("div");
        t.id="asterPatchToast";
        t.style.cssText="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483647;background:rgba(18,18,22,.78);border:1px solid rgba(168,85,247,.35);color:#fff;padding:10px 14px;border-radius:14px;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto;backdrop-filter:blur(10px);box-shadow:0 18px 55px rgba(0,0,0,.45);max-width:min(720px,92vw);opacity:0;transition:opacity .18s ease;";
        document.body.appendChild(t);
      }
      t.textContent=s;
      t.style.opacity="1";
      clearTimeout(window.__asterPatchToastT);
      window.__asterPatchToastT = setTimeout(()=>{ try{ t.style.opacity="0"; }catch(e){} }, 2400);
    }catch(e){}
  }

  // --- 1) Expand: move animated fill canvas BEHIND the image (underlay), keep frame/handles above ---
  function ensureExpandUnderlay(){
    try{
      const img = id("imageModalImg");
      if(!img) return;
      const overlay = id("rtExpandOverlay2");
      const fill = id("rtExpandFillCanvas");
      if(!overlay || !fill) return;

      // Find the closest positioned container that holds the modal image
      const host = img.parentElement || img.closest(".img-modal-center") || img.closest(".img-modal") || img.closest("#imageModal") || img.closest("body");
      if(!host) return;

      // Ensure host is positioning context
      try{
        const cs = getComputedStyle(host);
        if(cs.position === "static") host.style.position = "relative";
      }catch(e){}

      // Create underlay (behind image)
      let under = id("rtExpandUnderlay");
      if(!under){
        under = document.createElement("div");
        under.id = "rtExpandUnderlay";
        under.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:1;";
        host.insertBefore(under, img); // before image => behind
      }

      // Force stacking order: underlay < image < overlay(frame/handles)
      try{ img.style.position = "relative"; img.style.zIndex = "2"; }catch(e){}
      try{ overlay.style.zIndex = "3"; }catch(e){}

      // Move fill canvas into underlay so it renders behind the image
      if(fill.parentElement !== under){
        under.appendChild(fill);
      }

      // Ensure fill covers host even if not inside overlay anymore
      try{
        fill.style.left="0"; fill.style.top="0"; fill.style.width="100%"; fill.style.height="100%";
        fill.style.pointerEvents="none";
      }catch(e){}
    }catch(e){ /* ignore */ }
  }

  // --- 2) Erase/Remove: guarantee Execute button triggers a backend call ---
  async function ensureRemoveFn(){
    try{
      if(typeof window.removeCurrentModalImage === "function") return;
      const core = window.Ee || (typeof Ee === "function" ? Ee : null);
      if(typeof core === "function"){
        window.removeCurrentModalImage = async function(prompt, opts){
          return await core(String(prompt ?? "").trim(), opts || {});
        };
        log("removeCurrentModalImage restored -> Ee()");
      }else{
        warn("No remove core found (Ee missing).");
      }
    }catch(e){}
  }

  async function runRemoveFromUI(){
    await ensureRemoveFn();

    const tool = getActiveTool();
    if(tool !== "remove" && tool !== "erase") return;

    const btn = id("asterToolApplyBtn");
    if(btn && btn.disabled) btn.disabled = false;

    const prompt = (id("asterToolPrompt")?.value || "").trim();
    const hasMask = !!(window.__asterErase && typeof window.__asterErase.hasMask === "function" && window.__asterErase.hasMask());
    if(!hasMask){
      toast("Paint a mask first (white = remove), then Execute.");
      // Still allow running if backend supports prompt-only, but warn:
      warn("No mask detected. Proceeding anyway.");
    }

    // Debug: show target src
    let imgEl = null;
    try{ imgEl = (typeof window.getModalImageEl === "function" && window.getModalImageEl()) || id("imageModalImg"); }catch(e){}
    const src = imgEl ? (imgEl.currentSrc || imgEl.src || "") : "";
    log("Execute", tool, {promptLen: prompt.length, hasMask, src: (src||"").slice(0,120)});

    try{
      // Use existing busy indicators if present
      try{ if(typeof window.setCenterImageBusy === "function") window.setCenterImageBusy(true, "Removing…"); }catch(e){}
      try{ if(typeof window.setCenterImageBusy === "function") window.setCenterImageBusy(true, "Removing…"); }catch(e){}

      const out = await window.removeCurrentModalImage(prompt);

      if(!out){
        toast("Remove returned no output. Check backend logs.");
        return;
      }
      // Cache bust to avoid “same image” visuals
      const out2 = (typeof window.asterCacheBust === "function") ? window.asterCacheBust(out) : out;

      if(typeof window.commitNewImage === "function"){
        window.commitNewImage(out2);
      }else{
        // ultra fallback
        if(imgEl) imgEl.src = out2;
      }
      toast("Done.");
    }catch(e){
      err(e);
      toast("Tool failed: " + (e?.message || e));
    }finally{
      try{ if(typeof window.setCenterImageBusy === "function") window.setCenterImageBusy(false); }catch(e){}
    }
  }

  // Capture-phase click handler to ensure the button always works
  document.addEventListener("click", function(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest("#asterToolApplyBtn") : null;
    if(!btn) return;

    const tool = getActiveTool();
    if(tool === "remove" || tool === "erase"){
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation?.();
      runRemoveFromUI();
    }else if(tool === "expand"){
      // ensure glow is under image each time user interacts
      ensureExpandUnderlay();
    }
  }, true);

  // When tool panel opens, ensure stacking + handlers are correct
  try{
    const oldOpen = window.__asterOpenToolPanel;
    if(typeof oldOpen === "function" && !oldOpen.__patchv6){
      window.__asterOpenToolPanel = function(toolName){
        const r = oldOpen.apply(this, arguments);
        try{ if(String(toolName||"").toLowerCase()==="expand") ensureExpandUnderlay(); }catch(e){}
        try{ if(String(toolName||"").toLowerCase()==="remove" || String(toolName||"").toLowerCase()==="erase") ensureRemoveFn(); }catch(e){}
        // always clear “busy” lock on open
        try{
          const btn = id("asterToolApplyBtn");
          if(btn) btn.disabled = false;
        }catch(e){}
        return r;
      };
      window.__asterOpenToolPanel.__patchv6 = true;
    }
  }catch(e){}

  // If expand already open on load, fix stacking
  setTimeout(()=>{ try{ ensureExpandUnderlay(); }catch(e){} }, 120);

  log("Patch v6 active (expand underlay + erase execute)");
})();
/* ===== /ASTER PATCH v6 ===== */
