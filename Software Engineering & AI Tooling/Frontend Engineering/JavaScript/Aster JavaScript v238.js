/* Aster JavaScript v238 — authenticated buyer-safe derivative: sidebar-derived layout CSS variable synchronization. Host state/dependencies are intentionally external. */
function writeLayoutVars() {
    try{
      const w = Math.round(sidebar.getBoundingClientRect().width);
      const root = document.documentElement;
      root.style.setProperty('--sidebar-current-w', w + 'px');
      root.style.setProperty('--composer-left', (w + 8) + 'px');
    } catch(e){}
  }
