/* Aster JavaScript v315 — authenticated buyer-safe derivative: dynamic control observer binding. Host state/dependencies are intentionally external. */
function hook(shellId, taId){
    const shell = document.getElementById(shellId);
    const ta = document.getElementById(taId);
    if(!shell || !ta) return;

    const run = ()=>sync(shell, ta);

    // Run after other listeners (this script loads later in the file)
    ta.addEventListener('input', ()=>requestAnimationFrame(run), {passive:true});
    window.addEventListener('resize', ()=>requestAnimationFrame(run), {passive:true});

    // Catch any late height/class tweaks from other patches
    try{
      new MutationObserver(()=>requestAnimationFrame(run)).observe(shell, {attributes:true, childList:true, subtree:true});
    }catch(_){ }

    run();
    setTimeout(run, 80);
    setTimeout(run, 220);
  }
