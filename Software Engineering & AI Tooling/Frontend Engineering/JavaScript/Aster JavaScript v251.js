/* Aster JavaScript v251 — authenticated buyer-safe derivative: topbar media/models mode switching. Host state/dependencies are intentionally external. */
function setTopbarMode(mode){
    mode = (mode==='media') ? 'media' : 'models';
    state.topbarMode = mode;
    setBodyAttr('data-rt-topbar-mode', mode);

    if(mode==='media'){
      // remember model label to restore later
      state.modelLabel = (btnText.textContent||'').trim() || state.modelLabel || 'FAST';
      btnText.textContent = state.mediaTab.toUpperCase();
      slot.setAttribute('aria-label','Library selector');
    } else {
      btnText.textContent = state.modelLabel || 'FAST';
      slot.setAttribute('aria-label','Model selector');
    }
  }
