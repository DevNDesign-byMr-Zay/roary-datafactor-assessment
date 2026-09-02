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
