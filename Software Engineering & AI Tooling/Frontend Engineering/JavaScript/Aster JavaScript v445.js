function rafLoop(){
    if(!glowRunning) return;
    try{
      if(ensureGlowCanvas()) drawGlow();
    }catch(e){}
    requestAnimationFrame(rafLoop);
  }
