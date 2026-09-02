function ptFromEvent(ev){
    const r = maskCanvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height };
  }
