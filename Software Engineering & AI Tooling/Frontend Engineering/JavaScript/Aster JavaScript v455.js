function pos(ev){
    const r=canvas.getBoundingClientRect();
    return {
      x:(ev.clientX-r.left)*(canvas.width/r.width),
      y:(ev.clientY-r.top )*(canvas.height/r.height)
    };
  }
