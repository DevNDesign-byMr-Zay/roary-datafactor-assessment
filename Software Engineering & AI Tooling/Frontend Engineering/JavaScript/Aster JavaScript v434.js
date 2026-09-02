function drawGlow(){
    if(!glowCanvas || !glowCtx) return;
    const tool = getActiveTool();
    if(tool !== "expand"){
      // shrink canvas when not in expand to avoid accidental glow
      glowCanvas.style.width = "0px";
      glowCanvas.style.height = "0px";
      glowCanvas.width = 0;
      glowCanvas.height = 0;
      return;
    }

    const frame = id("rtExpandFrame");
    const imgEl = id("imageModalImg");
    const shell = $(".img-modal-image-shell");
    if(!frame || !imgEl || !shell) return;

    const fr = frame.getBoundingClientRect();
    const ir = imgEl.getBoundingClientRect();
    const sr = shell.getBoundingClientRect();

    // Outer: expand frame; Inner: image rect
    const left = fr.left - sr.left;
    const top  = fr.top  - sr.top;
    const w    = fr.width;
    const h    = fr.height;

    if(w < 2 || h < 2) return;

    glowCanvas.style.left = left + "px";
    glowCanvas.style.top  = top  + "px";
    glowCanvas.style.width = w + "px";
    glowCanvas.style.height= h + "px";
    glowCanvas.width  = Math.max(2, Math.floor(w * DPR));
    glowCanvas.height = Math.max(2, Math.floor(h * DPR));

    const ctx = glowCtx;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,w,h);

    // Multi-directional animated gradient
    const t = performance.now() * 0.001;
    const ax = 0.5 + 0.5*Math.sin(t*0.7);
    const ay = 0.5 + 0.5*Math.cos(t*0.9);

    // Base linear gradient
    const g1 = ctx.createLinearGradient(0, 0, w*ax, h*(1-ay));
    g1.addColorStop(0.00, "rgba(168,85,247,0.00)");
    g1.addColorStop(0.22, "rgba(168,85,247,0.18)");
    g1.addColorStop(0.48, "rgba(147,51,234,0.42)");
    g1.addColorStop(0.78, "rgba(126,34,206,0.28)");
    g1.addColorStop(1.00, "rgba(88,28,135,0.06)");

    // Secondary radial shimmer
    const rx = w*(0.35 + 0.25*Math.sin(t*1.13));
    const ry = h*(0.35 + 0.25*Math.cos(t*0.97));
    const r  = Math.max(w,h) * (0.55 + 0.10*Math.sin(t*0.83));
    const g2 = ctx.createRadialGradient(rx, ry, r*0.08, rx, ry, r);
    g2.addColorStop(0.00, "rgba(217,70,239,0.20)");
    g2.addColorStop(0.35, "rgba(168,85,247,0.16)");
    g2.addColorStop(1.00, "rgba(0,0,0,0.00)");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g1;
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = g2;
    ctx.fillRect(0,0,w,h);

    // Cut out inner image area so glow originates from behind edges into expansion area
    const innerLeft = ir.left - fr.left;
    const innerTop  = ir.top  - fr.top;
    const innerW    = ir.width;
    const innerH    = ir.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(innerLeft, innerTop, innerW, innerH);

    // Slight edge feather on hole
    ctx.globalCompositeOperation = "source-over";
    const feather = 18;
    const fg = ctx.createLinearGradient(innerLeft-feather, innerTop-feather, innerLeft+innerW+feather, innerTop+innerH+feather);
    fg.addColorStop(0, "rgba(0,0,0,0.00)");
    fg.addColorStop(0.5, "rgba(0,0,0,0.10)");
    fg.addColorStop(1, "rgba(0,0,0,0.00)");
    ctx.fillStyle = fg;
    ctx.fillRect(0,0,w,h);
  }
