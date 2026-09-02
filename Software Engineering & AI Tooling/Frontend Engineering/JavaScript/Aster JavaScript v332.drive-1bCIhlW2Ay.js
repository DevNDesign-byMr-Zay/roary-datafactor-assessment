function ensureExpandUI(){
    const frame = document.getElementById("rtExpandFrame");
    if(!frame) return;
    if(frame.__asterAnchorsInit) {
      updateBadge(frame);
      return;
    }
    frame.__asterAnchorsInit = true;

    // create handles
    dirs.forEach(dir=>{
      const h=document.createElement("div");
      h.className = `${HANDLE} ${HANDLE}-${dir}`;
      h.dataset.dir = dir;
      frame.appendChild(h);
    });

    // size badge
    const badge=document.createElement("div");
    badge.className = BADGE;
    badge.textContent = "";
    frame.appendChild(badge);

    installDrag(frame);
    updateBadge(frame);
  }
