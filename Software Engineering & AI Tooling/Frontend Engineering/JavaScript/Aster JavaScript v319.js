/* Aster JavaScript v319 — authenticated buyer-safe derivative: dynamic control observer binding variant 2. Host state/dependencies are intentionally external. */
function hook(shellId, inputId){
    const shell = document.getElementById(shellId);
    const input = document.getElementById(inputId);
    if(!shell || !input) return;
    const run = ()=>applyAutoGrow(input, shell);
    input.addEventListener('input', run, {passive:true});
    window.addEventListener('resize', run, {passive:true});
    // Run immediately and after a tick (fonts/layout)
    run();
    setTimeout(run, 80);
  }
