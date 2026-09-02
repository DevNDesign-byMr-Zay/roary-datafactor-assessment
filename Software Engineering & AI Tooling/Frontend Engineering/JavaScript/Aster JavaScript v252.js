/* Aster JavaScript v252 — authenticated buyer-safe derivative: topbar menu close-state synchronization. Host state/dependencies are intentionally external. */
function closeMenu(){
    try{
      slot.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-hidden','true');
    }catch(_){ }
  }
