function startGlow(){
    if(glowRunning) return;
    glowRunning = true;
    requestAnimationFrame(rafLoop);
  }
