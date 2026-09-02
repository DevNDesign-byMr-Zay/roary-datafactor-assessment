/* Aster JavaScript v260 — authenticated buyer-safe derivative: execute-button progress markup bootstrap. Host state/dependencies are intentionally external. */
function ensureMarkup(btn, baseLabel){
    if(!btn) return;
    if(btn.classList.contains('rt-exec-progress')){
      // Make sure label exists.
      const lbl = btn.querySelector('.rt-exec-label');
      if(lbl && baseLabel) btn.dataset.rtBaseLabel = baseLabel;
      return;
    }
    // Safety: if an older button slips through.
    const label = baseLabel || (btn.textContent||'').trim() || 'EXECUTE';
    btn.classList.add('rt-exec-progress');
    btn.dataset.rtBaseLabel = label;
    btn.innerHTML = '<span class="rt-exec-label">'+label+'</span>'+
      '<span class="rt-exec-pct">0%</span>'+
      '<span class="rt-exec-bar"><span class="rt-exec-bar-fill"></span></span>';
  }
