function getExpandFrameRect(){
    const frame = getExpandFrameEl();
    const overlay = getExpandOverlayEl();
    if(!frame || !overlay) return null;
    const fr = frame.getBoundingClientRect();
    const or = overlay.getBoundingClientRect();
    return { x: fr.left-or.left, y: fr.top-or.top, w: fr.width, h: fr.height };
  }
