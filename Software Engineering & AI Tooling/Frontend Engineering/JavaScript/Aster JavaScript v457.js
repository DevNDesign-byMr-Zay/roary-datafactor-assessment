function move(ev){
    if(!brushing) return;
    const p=pos(ev);
    if(last) line(last,p);
    last=p;
    ev.preventDefault();
  }
