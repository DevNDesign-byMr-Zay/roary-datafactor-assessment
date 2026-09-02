/* Aster JavaScript v321 — authenticated buyer-safe derivative: sidebar collapsed-state persistence. Host state/dependencies are intentionally external. */
function setCollapsed(collapsed) {
    sidebar.classList.toggle('collapsed', !!collapsed);
    btn.setAttribute('aria-pressed', (!collapsed).toString());
    try { localStorage.setItem('aster.sidebarCollapsed', collapsed ? '1' : '0'); } catch(e){}
    writeLayoutVars();
    // Let any existing code that listens to resize recompute
    try { window.dispatchEvent(new Event('resize')); } catch(e){}
  }
