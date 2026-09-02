function patchExpandFormData(fd){
    try{
      const imgEl = getModalImageEl();
      const pr = getPaintedRect(imgEl);
      const fr = getExpandFrameRect();
      if(!pr || !fr) return fd;

      // Frame is positioned in overlay coords that match the image element box.
      const leftPx = pr.ox - fr.x;
      const topPx = pr.oy - fr.y;
      const rightPx = (fr.x + fr.w) - (pr.ox + pr.bw);
      const bottomPx = (fr.y + fr.h) - (pr.oy + pr.bh);

      const l = Math.max(0, Math.round(leftPx / (pr.bw / pr.natW)));
      const r = Math.max(0, Math.round(rightPx / (pr.bw / pr.natW)));
      const t = Math.max(0, Math.round(topPx / (pr.bh / pr.natH)));
      const b = Math.max(0, Math.round(bottomPx / (pr.bh / pr.natH)));

      fd.set("expand_left", String(l));
      fd.set("expand_right", String(r));
      fd.set("expand_top", String(t));
      fd.set("expand_bottom", String(b));
      fd.set("original_w", String(pr.natW));
      fd.set("original_h", String(pr.natH));
      fd.set("target_w", String(pr.natW + l + r));
      fd.set("target_h", String(pr.natH + t + b));
    }catch(e){}
    return fd;
  }
