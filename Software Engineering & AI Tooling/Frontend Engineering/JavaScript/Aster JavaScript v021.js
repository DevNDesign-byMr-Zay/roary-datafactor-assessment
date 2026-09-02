(function(){
  // -------------------------
  // EXPAND overlay: cursor-accurate handles + pads -> __asterExpandOpts (only when tool active)
  // -------------------------
  const MAX_SIDE=4096;
  let overlay=null, frame=null, fill=null, dragging=null;

  function q(sel){return document.querySelector(sel);}
  function tool(){ return (document.body && (document.body.dataset.rtOrbtool || document.body.getAttribute("data-rt-orbtool") || "")) || ""; }
  function shell(){
    return q("#imageModal .img-modal-image-shell") ||
           q("#imageModal .img-modal-center") ||
           q("#imageModal") || null;
  }
  function img(){
    return q("#imageModalImg") || q("#imageModal img") || q(".img-modal img");
  }
  function destroy(){
    // Stop animated preview + cleanup nodes
    try{ stopFillAnim(); }catch(e){}
    try{ fill?.remove(); }catch(e){}
    try{ overlay?.remove(); }catch(e){}
    overlay=null; frame=null; fill=null; dragging=null;
  }

  function ensure(){
    const sh=shell();
    const im=img();
    if(!sh || !im) return null;
    // Anchor overlay + glow in a stable stacking context
    try{ const cs=getComputedStyle(sh); if(cs.position==="static") sh.style.position="relative"; }catch(e){}
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="rtExpandOverlay2";
      sh.appendChild(overlay);

      // Animated purple preview (ring area between image edge and frame)
      fill=document.createElement("canvas");
      fill.id="rtExpandFillCanvas";
      fill.setAttribute("aria-hidden","true");
      // Put glow BEHIND the image but in the same coordinate space as the shell
      try{ sh.appendChild(fill); }catch(e){}
      // Ensure the active image sits above the glow
      try{
        const ics=getComputedStyle(im);
        if(ics.position==="static") im.style.position="relative";
        im.style.zIndex="2";
      }catch(e){}

      frame=document.createElement("div");
      frame.id="rtExpandFrame";
      overlay.appendChild(frame);
["nw","n","ne","e","se","s","sw","w"].forEach(h=>{
        const d=document.createElement("div");
        d.className="rtExpandHandle2";
        d.dataset.h=h;
        frame.appendChild(d);
        d.addEventListener("pointerdown",(ev)=>startDrag(ev,h));
      });

      window.addEventListener("pointermove", drag, {passive:false});
      window.addEventListener("pointerup", endDrag, {passive:true});
      window.addEventListener("pointercancel", endDrag, {passive:true});
      window.addEventListener("resize", update, {passive:true});
      startFillAnim();
    }
    update();
    return overlay;
  }

  function update(){
    if(tool()!=="expand") return;
    const sh=shell(), im=img();
    if(!sh || !im || !overlay || !frame) return;

    overlay.style.width = sh.clientWidth+"px";
    overlay.style.height= sh.clientHeight+"px";

    const shR=sh.getBoundingClientRect();
    const imR=im.getBoundingClientRect();

    if(!frame.dataset.inited){
      frame.dataset.inited="1";
      frame.dataset.imgKey="";
    }

    const key = `${Math.round(imR.width)}x${Math.round(imR.height)}@${Math.round(imR.left)}:${Math.round(imR.top)}`;
    if(frame.dataset.imgKey !== key){
      frame.dataset.imgKey = key;
      setFrame(imR.left-shR.left, imR.top-shR.top, imR.width, imR.height);
      computePads();
      scheduleFill();
}
  }

  function setFrame(left, top, w, h){
    w=Math.max(50,w); h=Math.max(50,h);
    frame.style.left=left+"px";
    frame.style.top =top+"px";
    frame.style.width=w+"px";
    frame.style.height=h+"px";
    scheduleFill();
  }

  
  // --- Seamless animated purple preview (canvas) ---
  let _fillRAF=0, _fillAnim=0, _fillT0=performance.now();
  function scheduleFill(){
    if(_fillRAF) return;
    _fillRAF = requestAnimationFrame(()=>{ _fillRAF=0; renderFill(); });
  }
  function startFillAnim(){
    if(_fillAnim) return;
    _fillT0 = performance.now();
    const tick=()=>{
      _fillAnim = requestAnimationFrame(tick);
      // Only animate while Expand tool is active and overlay exists
      if(tool()!=="expand" || !overlay || !frame || !fill) return;
      renderFill(true);
    };
    _fillAnim = requestAnimationFrame(tick);
  }
  function stopFillAnim(){
    if(_fillAnim){ cancelAnimationFrame(_fillAnim); _fillAnim=0; }
  }

  function renderFill(isAnim){
    const sh=shell(), im=img();
    if(!sh || !im || !frame || !fill) return;

    const shR=sh.getBoundingClientRect();
    const imR=im.getBoundingClientRect();
    const frR=frame.getBoundingClientRect();

    // shell-relative rects
    const imL=imR.left-shR.left, imT=imR.top-shR.top;
    const imRgt=imL+imR.width, imB=imT+imR.height;

    const frL=frR.left-shR.left, frT=frR.top-shR.top;
    const frW=Math.max(0, frR.width), frH=Math.max(0, frR.height);

    // Position canvas to match frame box
    fill.style.left = frL+"px";
    fill.style.top  = frT+"px";
    fill.style.width  = frW+"px";
    fill.style.height = frH+"px";

    // Nothing to show if frame == image (no expand area)
    const padL = Math.max(0, imL - frL);
    const padT = Math.max(0, imT - frT);
    const padR = Math.max(0, (frL+frW) - imRgt);
    const padB = Math.max(0, (frT+frH) - imB);
    if(padL+padT+padR+padB < 2){
      const ctx=fill.getContext("2d");
      if(ctx){ ctx.clearRect(0,0,fill.width||0,fill.height||0); }
      return;
    }

    // Render at a capped internal res then stretch (fast + smooth)
    const maxDim = 520;
    const scale = Math.max(0.25, Math.min(1, maxDim / Math.max(frW, frH, 1)));
    const cw = Math.max(96, Math.round(frW * scale));
    const ch = Math.max(96, Math.round(frH * scale));
    if (fill.width !== cw) fill.width = cw;
    if (fill.height !== ch) fill.height = ch;

    const ctx = fill.getContext("2d");
    if(!ctx) return;
    ctx.clearRect(0,0,cw,ch);

    // Inner rect relative to frame box in canvas coords
    const inL = (imL - frL) * scale;
    const inT = (imT - frT) * scale;
    const inR = (imRgt - frL) * scale;
    const inB = (imB - frT) * scale;

    // Animation phase (matches that "panel gradient" vibe)
    const t = (performance.now() - _fillT0) * 0.00012; // speed
    const ang = (t % (Math.PI*2));
    const ca = Math.cos(ang), sa = Math.sin(ang);

    // Palette (deep violet -> bright purple -> magenta accent)
    const cA = [88, 28, 135];   // deep violet
    const cB = [124, 58, 237];  // violet
    const cC = [168, 85, 247];  // bright purple

    const maxA = 245;
    const gamma = 1.05;

    const imgData = ctx.createImageData(cw, ch);
    const d = imgData.data;

    function distToInner(x,y){
      let dx=0, dy=0;
      if (x < inL) dx = inL - x;
      else if (x > inR) dx = x - inR;
      if (y < inT) dy = inT - y;
      else if (y > inB) dy = y - inB;
      return Math.hypot(dx,dy);
    }
    function distToOuter(x,y){
      return Math.min(x, cw-x, y, ch-y);
    }

    let idx=0;
    for(let y=0;y<ch;y++){
      const yy = y + 0.5;
      for(let x=0;x<cw;x++){
        const xx = x + 0.5;

        // inside inner rect => transparent
        if(xx>=inL && xx<=inR && yy>=inT && yy<=inB){
          d[idx++]=0; d[idx++]=0; d[idx++]=0; d[idx++]=0;
          continue;
        }

        const din = distToInner(xx,yy);
        const dout= distToOuter(xx,yy);
        const r = din / (din + dout + 1e-6);
        let a = Math.pow(Math.max(0, 1-r), gamma);
        // visibility boost
        a = Math.min(1, a * 1.35);

        // Animated gradient coordinate (multi-directional, deep purple)
        const TAU = Math.PI*2;
        const u1 = (xx/cw), v1 = (yy/ch);
        // Two drifting vectors + a slow swirl around center
        const tA = t*0.92, tB = t*1.18;
        const a1 = (tA % 1) * TAU;
        const a2 = ((tB + 0.37) % 1) * TAU;
        const vx1 = Math.cos(a1), vy1 = Math.sin(a1);
        const vx2 = Math.cos(a2), vy2 = Math.sin(a2);
        const u = (u1*vx1 + v1*vy1 + tA) % 1;
        const v = (u1*vx2 - v1*vy2 + tB) % 1;
        const uu = u < 0 ? u+1 : u;
        const vv = v < 0 ? v+1 : v;
        const cx = u1-0.5, cy = v1-0.5;
        const ang = Math.atan2(cy, cx);
        const swirl = 0.5 + 0.5*Math.sin(ang*1.35 + t*TAU*0.55);
        const s1 = 0.5 + 0.5*Math.sin((uu)*TAU);
        const s2 = 0.5 + 0.5*Math.sin((vv)*TAU);
        const k  = Math.min(1, Math.max(0, 0.55*s1 + 0.35*s2 + 0.10*swirl));
        const k2 = Math.min(1, Math.max(0, s2*0.75 + swirl*0.25));

        // Alpha micro-pulse so it feels alive but not jittery
        a *= (0.88 + 0.12*Math.sin(TAU*(uu*0.7 + vv*0.4) + t*TAU*0.35));

        // 3-stop blend
        let rr,gg,bb;
        // base: deep -> mid by k
        const r0 = Math.round(cA[0] + (cB[0]-cA[0]) * k);
        const g0 = Math.round(cA[1] + (cB[1]-cA[1]) * k);
        const b0 = Math.round(cA[2] + (cB[2]-cA[2]) * k);
        // lift: mid -> bright by k2
        rr = Math.round(r0 + (cC[0]-r0) * (k2*0.55));
        gg = Math.round(g0 + (cC[1]-g0) * (k2*0.55));
        bb = Math.round(b0 + (cC[2]-b0) * (k2*0.55));

        d[idx++]=rr;
        d[idx++]=gg;
        d[idx++]=bb;
        d[idx++]=Math.round(maxA * a);
}
    }
    ctx.putImageData(imgData, 0, 0);
    // Additive pass for a richer haze
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=0.45;
    ctx.drawImage(fill, 0, 0);
    ctx.restore();
  }
function startDrag(ev, handle){
    if(tool()!=="expand") return;
    const sh=shell();
    if(!sh || !frame) return;
    const fr=frame.getBoundingClientRect();
    const shR=sh.getBoundingClientRect();
    dragging={
      handle,
      startX:ev.clientX,
      startY:ev.clientY,
      left:fr.left-shR.left,
      top: fr.top -shR.top,
      w:fr.width,
      h:fr.height
    };
    ev.target.setPointerCapture?.(ev.pointerId);
    ev.preventDefault();
  }

  function drag(ev){
    if(!dragging || !frame || tool()!=="expand") return;
    const dx=ev.clientX-dragging.startX;
    const dy=ev.clientY-dragging.startY;
    let left=dragging.left, top=dragging.top, w=dragging.w, h=dragging.h;
    const hnd=dragging.handle;

    if(hnd==="w"||hnd==="nw"||hnd==="sw"){ left=dragging.left+dx; w=dragging.w-dx; }
    if(hnd==="e"||hnd==="ne"||hnd==="se"){ w=dragging.w+dx; }
    if(hnd==="n"||hnd==="ne"||hnd==="nw"){ top=dragging.top+dy; h=dragging.h-dy; }
    if(hnd==="s"||hnd==="sw"||hnd==="se"){ h=dragging.h+dy; }

    w=Math.max(50,w); h=Math.max(50,h);
    // OUTWARD-ONLY: frame must always contain the visible image rect (no shrinking onto the image)
    try{
      const sh=shell(), im=img();
      if(sh && im){
        const shR=sh.getBoundingClientRect();
        const imR=im.getBoundingClientRect();
        const imL=imR.left-shR.left, imT=imR.top-shR.top;
        const imRgt=imL+imR.width, imB=imT+imR.height;

        let right = left + w;
        let bottom= top  + h;

        left = Math.min(left, imL);
        top  = Math.min(top,  imT);
        right = Math.max(right, imRgt);
        bottom= Math.max(bottom, imB);

        w = Math.max(50, right-left);
        h = Math.max(50, bottom-top);
      }
    }catch(e){}
    setFrame(left, top, w, h);
    computePads();
    ev.preventDefault();
  }

  function endDrag(){ dragging=null; }

  function computePads(){
    const im=img();
    if(!im || !frame) return;

    const imR=im.getBoundingClientRect();
    const frR=frame.getBoundingClientRect();

    const sx = (im.naturalWidth && imR.width) ? (im.naturalWidth/imR.width) : 1;
    const sy = (im.naturalHeight&& imR.height)? (im.naturalHeight/imR.height): 1;

    const leftPad = Math.max(0, Math.round((imR.left - frR.left) * sx));
    const rightPad= Math.max(0, Math.round((frR.right - imR.right) * sx));
    const topPad  = Math.max(0, Math.round((imR.top - frR.top) * sy));
    const botPad  = Math.max(0, Math.round((frR.bottom - imR.bottom) * sy));

    const baseW = im.naturalWidth || Math.round(imR.width*sx);
    const baseH = im.naturalHeight|| Math.round(imR.height*sy);

    let outW = baseW + leftPad + rightPad;
    let outH = baseH + topPad + botPad;

    if(outW>MAX_SIDE) outW=MAX_SIDE;
    if(outH>MAX_SIDE) outH=MAX_SIDE;

    window.__asterExpandOpts = {
      left:leftPad, right:rightPad, top:topPad, bottom:botPad,
      expand_left:leftPad, expand_right:rightPad, expand_top:topPad, expand_bottom:botPad,
      target_w: outW, target_h: outH,
      base_w: baseW, base_h: baseH
    };
  }

  // Replace older hooks (your UI calls these)
  window.ensureExpandOverlay = ensure;
  window.updateExpandOverlay = update;

  // lifecycle
  setInterval(()=>{ 
    try{
      const t=tool();
      const hasModal=!!q("#imageModal");
      if(!hasModal){ destroy(); return; }
      if(t==="expand"){ ensure(); }
      else { destroy(); }
    }catch(e){}
  }, 350);
})();
