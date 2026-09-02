/* Aster JavaScript v323 — authenticated buyer-safe derivative: panel close-state synchronization. Host state/dependencies are intentionally external. */
function close(){
      slot.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      try{ menu.setAttribute('aria-hidden','true'); }catch(_){ }
    }
