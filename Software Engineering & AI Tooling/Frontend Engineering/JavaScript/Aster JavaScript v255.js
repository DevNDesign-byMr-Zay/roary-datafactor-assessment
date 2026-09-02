/* Aster JavaScript v255 — authenticated buyer-safe derivative: composer-height CSS variable synchronization. Host state/dependencies are intentionally external. */
function setComposerH(){
    try{
      const rect = shell.getBoundingClientRect();
      const h = Math.max(60, Math.round(rect.height || shell.offsetHeight || 0));
      root.style.setProperty('--aster-composer-h', h + 'px');
    }catch(_){ }
  }
