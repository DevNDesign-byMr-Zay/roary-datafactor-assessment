function down(ev){
    if(!(tool()==="remove" || tool()==="erase")) return;
    ensure();
    brushing=true;
    canvas.setPointerCapture?.(ev.pointerId);
    last=pos(ev);
    stamp(last);
    ev.preventDefault();
  }
