function ensureGlowCanvas(){
    if(glowCanvas && glowCtx) return true;
    const shell = $(".img-modal-image-shell");
    if(!shell) return false;

    // Make sure shell is a positioning context
    try{
      const cs = getComputedStyle(shell);
      if(cs.position === "static") shell.style.position = "relative";
    }catch(e){}

    glowCanvas = document.createElement("canvas");
    glowCanvas.id = "rtExpandGlowCanvas_v8";
    glowCanvas.style.cssText = [
      "position:absolute",
      "left:0","top:0",
      "width:0","height:0",
      "pointer-events:none",
      "z-index:1",
      "filter: blur(18px) saturate(1.25)",
      "opacity:.92",
      "mix-blend-mode: screen"
    ].join(";");
    glowCtx = glowCanvas.getContext("2d");

    // Put canvas behind the carousel (image) but inside the same shell
    try{ shell.prepend(glowCanvas); }catch(e){ try{ shell.appendChild(glowCanvas);}catch(e2){} }

    // Ensure carousel stays above glow
    const carousel = id("imageModalCarousel");
    if(carousel){
      try{
        const ccs = getComputedStyle(carousel);
        if(ccs.position === "static") carousel.style.position = "relative";
        carousel.style.zIndex = "2";
      }catch(e){}
    }
    return true;
  }
