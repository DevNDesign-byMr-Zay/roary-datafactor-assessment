function onDown(ev){
      const h = ev.target && ev.target.closest && ev.target.closest(`.${HANDLE}`);
      if(!h) return;
      ev.preventDefault(); ev.stopPropagation();
      const r = frame.getBoundingClientRect();
      dragging = { dir: (h.dataset.dir||"") };
      start = { x: ev.clientX, y: ev.clientY, left:r.left, top:r.top, width:r.width, height:r.height };
      try{ frame.setPointerCapture(ev.pointerId); }catch(e){}
    }
