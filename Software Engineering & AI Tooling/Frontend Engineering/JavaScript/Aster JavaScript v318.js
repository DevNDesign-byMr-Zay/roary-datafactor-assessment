/* Aster JavaScript v318 — authenticated buyer-safe derivative: panel open-state synchronization. Host state/dependencies are intentionally external. */
function open(src){
    if(!src) return;
    try{ modalImg.src = src; }catch(_){ }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
