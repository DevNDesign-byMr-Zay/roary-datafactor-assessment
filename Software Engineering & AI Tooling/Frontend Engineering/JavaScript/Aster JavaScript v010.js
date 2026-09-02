
(function(){
  // Force correct tool bases so OCR :5152 never becomes the "image backend"
  try{
    const IMG="http://127.0.0.1:5151";
    const WEB="http://127.0.0.1:5055";
    const curImg=(localStorage.getItem("aster.imageToolBase")||"").trim();
    const curWeb=(localStorage.getItem("aster.webToolBase")||"").trim();
    if(!curImg || /:5152/.test(curImg)) localStorage.setItem("aster.imageToolBase", IMG);
    if(!curWeb || /:5152/.test(curWeb)) localStorage.setItem("aster.webToolBase", WEB);
  }catch(e){}
})();

(function(){
  // -------------------------
  // ERASE/REMOVE painter v3: fast, smooth strokes + correct mask export
  // - Works in modal OR main stage
  // - Keeps the expected __asterErase API: enter/exit/clear/hasMask/getMaskDataURL/getBrush/setBrush/getShape/setShape
  // - Mask is drawn at the image's NATURAL resolution (better inpaint quality)
  // - Preview is drawn at display resolution (snappy)
  // -------------------------
  const PURPLE = "rgba(168,85,247,0.72)";

  let paintCanvas=null, paintCtx=null;
  let maskCanvas=null, maskCtx=null;

  let brushing=false;
  let lastP=null;
  let queuedP=null;
  let rafId=0;

  let brushSize=64;
  let brushShape="circle";
  let feather=0;

  let maskDirty=false;

  function q(sel){return document.querySelector(sel);}

  function tool(){
    const b=document.body;
    return (b && (b.dataset.rtOrbtool || b.getAttribute("data-rt-orbtool") || "")) || "";
  }

  // --- Robust active shell/image detection (modal + main stage) ---
  function shell(){
    try{
      if (typeof window.getActiveImageShellForExpand==="function"){
        const s=window.getActiveImageShellForExpand();
        if(s) return s;
      }
    }catch(e){}
    return q("#imageModal .img-modal-image-shell") ||
           q("#imageModal .img-modal-center") ||
           q(".aster-image-shell.active") ||
           q(".aster-image-shell.is-active") ||
           q(".aster-msg-img-shell.active") ||
           q(".aster-variation.active") ||
           q(".rt-active-image-shell") ||
           q("[data-aster-active='1']") ||
           q("[data-active='1'] .aster-image-shell") ||
           q(".img-shell.active") ||
           q(".img-shell.is-active") ||
           q("#imageModal") || null;
  }

  function img(){
    try{
      if (typeof window.getModalImageEl==="function"){
        const el=window.getModalImageEl();
        if(el) return el;
      }
      if (typeof window.getActiveImageElForExpand==="function"){
        const el=window.getActiveImageElForExpand();
        if(el) return el;
      }
    }catch(e){}
    return q("#imageModalImg") ||
           q("#imageModal img") ||
           q(".img-modal img") ||
           q(".aster-image-shell.active img") ||
           q(".aster-image-shell.is-active img") ||
           q(".aster-msg-img-shell.active img") ||
           q(".aster-variation.active img") ||
           q(".rt-active-image-shell img") ||
           q("[data-aster-active='1'] img") ||
           q("[data-active='1'] img") ||
           q(".img-shell.active img") ||
           q(".img-shell.is-active img") ||
           q("img.aster-active") || null;
  }

  function destroy(){
    try{ paintCanvas?.remove(); }catch(e){}
    paintCanvas=null; paintCtx=null;
    // maskCanvas kept off-DOM, but reset
    maskCanvas=null; maskCtx=null;
    brushing=false; lastP=null; queuedP=null;
    if(rafId){ try{ cancelAnimationFrame(rafId); }catch(e){} rafId=0; }
    maskDirty=false;
  }

  function ensure(){
    const sh=shell();
    const im=img();
    if(!sh || !im) return null;

    // Anchor shell in a stable stacking context
    try{
      const cs=getComputedStyle(sh);
      if(cs.position==="static") sh.style.position="relative";
    }catch(e){}

    // Ensure the image sits ABOVE preview canvas if needed
    try{
      const ics=getComputedStyle(im);
      if(ics.position==="static") im.style.position="relative";
      im.style.zIndex="2";
    }catch(e){}

    if(!paintCanvas){
      paintCanvas=document.createElement("canvas");
      paintCanvas.id="rtEraseCanvas2";
      sh.appendChild(paintCanvas);
      paintCtx=paintCanvas.getContext("2d");
      paintCtx.imageSmoothingEnabled=true;

      // Offscreen/high-res mask (not displayed)
      maskCanvas=document.createElement("canvas");
      maskCanvas.id="rtEraseMaskCanvas2";
      maskCanvas.style.display="none";
      sh.appendChild(maskCanvas);
      maskCtx=maskCanvas.getContext("2d");
      maskCtx.imageSmoothingEnabled=false;

      paintCanvas.addEventListener("contextmenu", (e)=>e.preventDefault());
      paintCanvas.addEventListener("pointerdown", onDown, {passive:false});
      paintCanvas.addEventListener("pointermove", onMove, {passive:false});
      paintCanvas.addEventListener("pointerup", onUp, {passive:true});
      paintCanvas.addEventListener("pointercancel", onUp, {passive:true});
      paintCanvas.addEventListener("lostpointercapture", onUp, {passive:true});

      window.addEventListener("resize", resize, {passive:true});
    }
    resize();
    return paintCanvas;
  }

  function resize(){
    if(!paintCanvas) return;
    const sh=shell(), im=img();
    if(!sh || !im) return;

    const shR=sh.getBoundingClientRect();
    const imR=im.getBoundingClientRect();

    const left=Math.round(imR.left-shR.left);
    const top =Math.round(imR.top -shR.top );
    const w=Math.max(1, Math.round(imR.width));
    const h=Math.max(1, Math.round(imR.height));

    paintCanvas.style.left = left+"px";
    paintCanvas.style.top  = top +"px";
    paintCanvas.style.width  = w+"px";
    paintCanvas.style.height = h+"px";

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio||1));
    const pw = Math.round(w*dpr);
    const ph = Math.round(h*dpr);

    if(paintCanvas.width!==pw || paintCanvas.height!==ph){
      paintCanvas.width=pw; paintCanvas.height=ph;
      paintCtx.setTransform(dpr,0,0,dpr,0,0);
      paintCtx.clearRect(0,0,w,h);
      // do NOT wipe mask on resize unless dimensions truly change; handle below
    }

    // Mask at natural resolution for best backend result
    const nw = Math.max(1, Math.round(im.naturalWidth  || w));
    const nh = Math.max(1, Math.round(im.naturalHeight || h));
    if(!maskCanvas || maskCanvas.width!==nw || maskCanvas.height!==nh){
      if(maskCanvas){
        maskCanvas.width=nw; maskCanvas.height=nh;
        // reset to black when mask resizes
        maskCtx.setTransform(1,0,0,1,0,0);
        maskCtx.globalCompositeOperation="source-over";
        maskCtx.fillStyle="black";
        maskCtx.fillRect(0,0,nw,nh);
        maskDirty=false;
      }
    }
  }

  function clear(){
    ensure();
    if(!paintCtx || !maskCtx) return;
    const w = paintCanvas.getBoundingClientRect().width || (paintCanvas.width/(window.devicePixelRatio||1));
    const h = paintCanvas.getBoundingClientRect().height|| (paintCanvas.height/(window.devicePixelRatio||1));
    paintCtx.clearRect(0,0,w,h);

    maskCtx.globalCompositeOperation="source-over";
    maskCtx.setTransform(1,0,0,1,0,0);
    maskCtx.fillStyle="black";
    maskCtx.fillRect(0,0,maskCanvas.width,maskCanvas.height);

    maskDirty=false;
  }

  function posCss(ev){
    const r=paintCanvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height };
  }

  function toMask(p){
    const imEl = img();
    const nw = maskCanvas.width, nh = maskCanvas.height;
    const sx = nw / Math.max(1,p.w);
    const sy = nh / Math.max(1,p.h);
    return { x: p.x * sx, y: p.y * sy, sx, sy };
  }

  function beginStroke(p, isErase){
    brushing=true;
    lastP=p;
    queuedP=p;
    // show cursor class hooks if you use them
    document.body.classList.add("rt-erase-drawing");
    try{ paintCanvas.setPointerCapture(evPointerId); }catch(e){}
  }

  let evPointerId = 0;

  function onDown(ev){
    const t=tool();
    if(!(t==="remove" || t==="erase")) return;

    ensure();
    evPointerId = ev.pointerId || 0;

    brushing=true;
    lastP=null;
    queuedP=posCss(ev);

    // Capture pointer so strokes don't break when leaving the canvas
    try{ paintCanvas.setPointerCapture(ev.pointerId); }catch(e){}

    // Draw a dot immediately
    flushStroke(/*forceDot*/true, ev);

    ev.preventDefault();
  }

  function onMove(ev){
    const t=tool();
    if(!(t==="remove" || t==="erase")) return;

    if(!brushing) return;
    queuedP=posCss(ev);
    if(!rafId) rafId=requestAnimationFrame(()=>flushStroke(false, ev));
    ev.preventDefault();
  }

  function onUp(ev){
    if(!brushing) return;
    brushing=false;
    lastP=null;
    queuedP=null;
    document.body.classList.remove("rt-erase-drawing");
    try{ paintCanvas.releasePointerCapture(evPointerId); }catch(e){}
    evPointerId=0;
  }

  function flushStroke(forceDot, ev){
    rafId=0;
    if(!queuedP || !paintCtx || !maskCtx) return;

    const p=queuedP;
    const isErase = (ev && (ev.altKey || ev.ctrlKey || ev.metaKey || ev.button===2 || (ev.buttons&2)));
    const shape = brushShape;

    // draw from lastP -> p
    if(!lastP){
      lastP=p;
    }

    const dx=p.x-lastP.x, dy=p.y-lastP.y;
    const dist=Math.hypot(dx,dy);

    // spacing controls
    const spacing = Math.max(2, brushSize*0.18);
    const steps = forceDot ? 1 : Math.max(1, Math.ceil(dist/spacing));

    for(let i=0;i<=steps;i++){
      const t = steps===1 ? 1 : (i/steps);
      const x = lastP.x + dx*t;
      const y = lastP.y + dy*t;
      stampAt(x,y,isErase,shape,p);
    }

    lastP=p;
  }

  function stampAt(x,y,isErase,shape,pMeta){
    const s = Math.max(2, Number(brushSize)||2);
    const half=s/2;

    // Preview: keep it light + fast (no heavy shadow blur per stamp)
    paintCtx.save();
    paintCtx.globalCompositeOperation = isErase ? "destination-out" : "source-over";
    paintCtx.fillStyle = isErase ? "rgba(0,0,0,1)" : PURPLE;

    if(shape==="square"){
      paintCtx.fillRect(x-half,y-half,s,s);
    }else if(shape==="tri"){
      paintCtx.beginPath();
      paintCtx.moveTo(x, y-half);
      paintCtx.lineTo(x+half, y+half);
      paintCtx.lineTo(x-half, y+half);
      paintCtx.closePath();
      paintCtx.fill();
    }else{
      paintCtx.beginPath();
      paintCtx.arc(x,y,half,0,Math.PI*2);
      paintCtx.fill();
    }
    paintCtx.restore();

    // Mask: draw at NATURAL resolution (scaled coords)
    const mp = toMask(pMeta);
    const mx = x*mp.sx, my=y*mp.sy;
    const ms = s * ((mp.sx+mp.sy)/2);

    maskCtx.save();
    maskCtx.globalCompositeOperation = isErase ? "destination-out" : "source-over";
    maskCtx.fillStyle = "white";

    // feather via shadowBlur (cheaper than ctx.filter blur each time)
    const f = Math.max(0, Number(feather)||0);
    if(f>0 && !isErase){
      maskCtx.shadowColor = "white";
      maskCtx.shadowBlur  = Math.min(80, f*2.25);
    }else{
      maskCtx.shadowBlur = 0;
    }

    const mhalf=ms/2;

    if(shape==="square"){
      maskCtx.fillRect(mx-mhalf,my-mhalf,ms,ms);
    }else if(shape==="tri"){
      maskCtx.beginPath();
      maskCtx.moveTo(mx, my-mhalf);
      maskCtx.lineTo(mx+mhalf, my+mhalf);
      maskCtx.lineTo(mx-mhalf, my+mhalf);
      maskCtx.closePath();
      maskCtx.fill();
    }else{
      maskCtx.beginPath();
      maskCtx.arc(mx,my,mhalf,0,Math.PI*2);
      maskCtx.fill();
    }
    maskCtx.restore();

    maskDirty = true;
  }

  // --- Public API used by your tool runner ---
  function getBrush(){ return Number(brushSize||64); }
  function setBrush(v){
    brushSize = Math.max(6, Math.min(220, Number(v)||64));
    try{
      // keep any CSS cursor size var in sync if present
      document.documentElement.style.setProperty("--eraseCursorSize", brushSize+"px");
      const c = document.getElementById("rtEraseCursor");
      if(c){ c.style.width=brushSize+"px"; c.style.height=brushSize+"px"; }
    }catch(e){}
    // sync with global state if you use S.erase
    try{
      if(window.S && window.S.erase) window.S.erase.brush = brushSize;
    }catch(e){}
  }
  function getShape(){ return brushShape; }
  function setShape(v){
    if(v==="square") brushShape="square";
    else if(v==="tri"||v==="triangle") brushShape="tri";
    else brushShape="circle";
    try{
      if(window.S && window.S.erase) window.S.erase.shape = brushShape;
    }catch(e){}
  }
  function setFeather(v){
    feather = Math.max(0, Math.min(80, Number(v)||0));
    try{
      if(window.S && window.S.erase) window.S.erase.feather = feather;
    }catch(e){}
  }

  // Optional enter/exit so the rest of ASTER can call them safely.
  function enter(){ ensure(); }
  function exit(){
    // keep canvases around but hide by switching tool; or destroy if desired:
    // destroy();
  }

  function hasMask(){ return !!maskDirty; }
  function getMaskDataURL(){
    try{ ensure(); return maskCanvas ? maskCanvas.toDataURL("image/png") : ""; }catch(e){ return ""; }
  }

  // Merge into existing object if present (avoid breaking other callers)
  window.__asterErase = window.__asterErase || {};
  window.__asterErase.ensure = ensure;
  window.__asterErase.enter  = enter;
  window.__asterErase.exit   = exit;
  window.__asterErase.clear  = clear;
  window.__asterErase.hasMask = hasMask;
  window.__asterErase.getMaskDataURL = getMaskDataURL;
  window.__asterErase.getBrush = getBrush;
  window.__asterErase.setBrush = setBrush;
  window.__asterErase.getShape = getShape;
  window.__asterErase.setShape = setShape;
  window.__asterErase.setFeather = setFeather;

  // Lifecycle: create/destroy only when tool is active. No modal-only assumptions.
  setInterval(()=>{
    try{
      const t=tool();
      if(t==="remove" || t==="erase"){
        ensure();
      }else{
        // hide preview canvas when not active (keeps mask in memory)
        if(paintCanvas) paintCanvas.style.display="none";
      }
      if(paintCanvas && (t==="remove"||t==="erase")) paintCanvas.style.display="";
    }catch(e){}
  }, 350);
})();
