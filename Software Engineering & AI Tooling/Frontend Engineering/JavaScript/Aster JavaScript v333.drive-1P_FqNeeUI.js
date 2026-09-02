function installDrag(frame){
    let dragging=null, start=null;

    function parentRect(){
      const p = frame.parentElement;
      return p ? p.getBoundingClientRect() : null;
    }

    function onDown(ev){
      const h = ev.target && ev.target.closest && ev.target.closest(`.${HANDLE}`);
      if(!h) return;
      ev.preventDefault(); ev.stopPropagation();
      const r = frame.getBoundingClientRect();
      dragging = { dir: (h.dataset.dir||"") };
      start = { x: ev.clientX, y: ev.clientY, left:r.left, top:r.top, width:r.width, height:r.height };
      try{ frame.setPointerCapture(ev.pointerId); }catch(e){}
    }

    function onMove(ev){
      if(!dragging || !start) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      let left = start.left, top = start.top, width = start.width, height = start.height;
      const dir = dragging.dir;

      const minSize = 40;
      if(dir.includes("e")) width = Math.max(minSize, width + dx);
      if(dir.includes("s")) height = Math.max(minSize, height + dy);
      if(dir.includes("w")) { width = Math.max(minSize, width - dx); left = left + dx; }
      if(dir.includes("n")) { height = Math.max(minSize, height - dy); top = top + dy; }

      const pr = parentRect();
      if(pr){
        // clamp inside parent so the math stays sane
        if(left < pr.left){ width -= (pr.left - left); left = pr.left; }
        if(top < pr.top){ height -= (pr.top - top); top = pr.top; }
        if(left + width > pr.right) width = pr.right - left;
        if(top + height > pr.bottom) height = pr.bottom - top;
        frame.style.left = px(left - pr.left);
        frame.style.top = px(top - pr.top);
      }else{
        frame.style.left = px(left);
        frame.style.top = px(top);
      }
      frame.style.width = px(width);
      frame.style.height = px(height);

      updateBadge(frame);

      // keep any existing expand state in sync
      try{
        const pads = window.asterComputeExpandFromFrame && window.asterComputeExpandFromFrame();
        if(pads){
          window.__asterExpandPads = pads;
        }
      }catch(e){}
    }

    function onUp(ev){
      dragging=null; start=null;
      updateBadge(frame);
    }

    frame.addEventListener("pointerdown", onDown, true);
    frame.addEventListener("pointermove", onMove, true);
    frame.addEventListener("pointerup", onUp, true);
    frame.addEventListener("pointercancel", onUp, true);

    // If the user drags the frame itself (not handles), let them reposition it
    // (helps fine-tune when aiming for exact output dims).
    let moving=false, moveStart=null;
    frame.addEventListener("pointerdown", (ev)=>{
      const h = ev.target && ev.target.closest && ev.target.closest(`.${HANDLE}`);
      if(h) return;
      // only when expand tool is open
      if(!document.body.classList.contains("rt-tool-expand-open") && !document.getElementById("imageModalToolTitle")) return;
      ev.preventDefault();
      const r = frame.getBoundingClientRect();
      const pr = parentRect();
      moving=true;
      moveStart={x:ev.clientX,y:ev.clientY,left:r.left,top:r.top,width:r.width,height:r.height,pr};
      try{ frame.setPointerCapture(ev.pointerId); }catch(e){}
    }, true);
    frame.addEventListener("pointermove",(ev)=>{
      if(!moving||!moveStart) return;
      const dx=ev.clientX-moveStart.x, dy=ev.clientY-moveStart.y;
      let left = moveStart.left + dx, top = moveStart.top + dy;
      const pr = moveStart.pr;
      if(pr){
        left = Math.max(pr.left, Math.min(pr.right - moveStart.width, left));
        top = Math.max(pr.top, Math.min(pr.bottom - moveStart.height, top));
        frame.style.left = px(left - pr.left);
        frame.style.top = px(top - pr.top);
      }else{
        frame.style.left = px(left);
        frame.style.top = px(top);
      }
      updateBadge(frame);
      try{
        const pads = window.asterComputeExpandFromFrame && window.asterComputeExpandFromFrame();
        if(pads) window.__asterExpandPads = pads;
      }catch(e){}
    }, true);
    frame.addEventListener("pointerup",()=>{moving=false;moveStart=null;}, true);
    frame.addEventListener("pointercancel",()=>{moving=false;moveStart=null;}, true);
  }
