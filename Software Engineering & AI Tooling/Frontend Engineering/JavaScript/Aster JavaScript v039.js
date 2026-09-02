/* Aster JavaScript v039
Authenticated historical derivative: animated expand glow rendered behind the active image.
Original product identity, proprietary prompts, credentials, personal paths, and protected internal reasoning architecture removed.
*/
(function(){
  const DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  let glowCanvas = null;
  let glowContext = null;
  let running = false;

  function activeTool(){
    try{
      const panel = document.getElementById("rtSidePanel");
      return String(panel?.dataset?.tool || panel?.getAttribute("data-tool") || "").toLowerCase();
    }catch(_){
      return "";
    }
  }

  function ensureGlowCanvas(){
    if(glowCanvas && glowContext && glowCanvas.isConnected) return true;

    const shell = document.querySelector(".img-modal-image-shell");
    if(!shell) return false;

    try{
      if(getComputedStyle(shell).position === "static"){
        shell.style.position = "relative";
      }
    }catch(_){}

    glowCanvas = document.createElement("canvas");
    glowCanvas.id = "asterExpandGlowCanvas";
    glowCanvas.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "width:0",
      "height:0",
      "pointer-events:none",
      "z-index:1",
      "filter:blur(18px) saturate(1.25)",
      "opacity:.92",
      "mix-blend-mode:screen"
    ].join(";");

    glowContext = glowCanvas.getContext("2d");
    try{ shell.prepend(glowCanvas); }catch(_){ shell.appendChild(glowCanvas); }

    const carousel = document.getElementById("imageModalCarousel");
    if(carousel){
      try{
        if(getComputedStyle(carousel).position === "static"){
          carousel.style.position = "relative";
        }
        carousel.style.zIndex = "2";
      }catch(_){}
    }
    return true;
  }

  function disableGlow(){
    if(!glowCanvas) return;
    glowCanvas.style.width = "0px";
    glowCanvas.style.height = "0px";
    glowCanvas.width = 0;
    glowCanvas.height = 0;
  }

  function drawGlow(){
    if(!glowCanvas || !glowContext) return;
    if(activeTool() !== "expand"){
      disableGlow();
      return;
    }

    const frame = document.getElementById("rtExpandFrame");
    const image = document.getElementById("imageModalImg");
    const shell = document.querySelector(".img-modal-image-shell");
    if(!frame || !image || !shell) return;

    const frameRect = frame.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();

    const width = frameRect.width;
    const height = frameRect.height;
    if(width < 2 || height < 2) return;

    const left = frameRect.left - shellRect.left;
    const top = frameRect.top - shellRect.top;

    glowCanvas.style.left = left + "px";
    glowCanvas.style.top = top + "px";
    glowCanvas.style.width = width + "px";
    glowCanvas.style.height = height + "px";
    glowCanvas.width = Math.max(2, Math.floor(width * DPR));
    glowCanvas.height = Math.max(2, Math.floor(height * DPR));

    const context = glowContext;
    context.setTransform(DPR, 0, 0, DPR, 0, 0);
    context.clearRect(0, 0, width, height);

    const time = performance.now() * 0.001;
    const ax = 0.5 + 0.5 * Math.sin(time * 0.7);
    const ay = 0.5 + 0.5 * Math.cos(time * 0.9);

    const linear = context.createLinearGradient(0, 0, width * ax, height * (1 - ay));
    linear.addColorStop(0.00, "rgba(168,85,247,0.00)");
    linear.addColorStop(0.22, "rgba(168,85,247,0.18)");
    linear.addColorStop(0.48, "rgba(147,51,234,0.42)");
    linear.addColorStop(0.78, "rgba(126,34,206,0.28)");
    linear.addColorStop(1.00, "rgba(88,28,135,0.06)");

    const radialX = width * (0.35 + 0.25 * Math.sin(time * 1.13));
    const radialY = height * (0.35 + 0.25 * Math.cos(time * 0.97));
    const radius = Math.max(width, height) * (0.55 + 0.10 * Math.sin(time * 0.83));
    const radial = context.createRadialGradient(
      radialX, radialY, radius * 0.08,
      radialX, radialY, radius
    );
    radial.addColorStop(0.00, "rgba(217,70,239,0.20)");
    radial.addColorStop(0.35, "rgba(168,85,247,0.16)");
    radial.addColorStop(1.00, "rgba(0,0,0,0.00)");

    context.globalCompositeOperation = "source-over";
    context.fillStyle = linear;
    context.fillRect(0, 0, width, height);
    context.fillStyle = radial;
    context.fillRect(0, 0, width, height);

    const innerLeft = imageRect.left - frameRect.left;
    const innerTop = imageRect.top - frameRect.top;

    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "rgba(0,0,0,1)";
    context.fillRect(innerLeft, innerTop, imageRect.width, imageRect.height);

    context.globalCompositeOperation = "source-over";
  }

  function frameLoop(){
    if(!running) return;
    try{
      if(ensureGlowCanvas()) drawGlow();
    }catch(_){}
    requestAnimationFrame(frameLoop);
  }

  function start(){
    if(running) return;
    running = true;
    requestAnimationFrame(frameLoop);
  }

  window.asterExpandGlow = { start, draw:drawGlow, stop:disableGlow };
  start();
})();
