/* Aster JavaScript v324 — authenticated buyer-safe derivative: panel open-state synchronization variant 2. Host state/dependencies are intentionally external. */
function open(){
      slot.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      try{ menu.setAttribute('aria-hidden','false'); }catch(_){ }
    }
