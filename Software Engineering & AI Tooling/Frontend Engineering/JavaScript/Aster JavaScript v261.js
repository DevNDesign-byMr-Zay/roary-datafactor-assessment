/* Aster JavaScript v261 — authenticated buyer-safe derivative: execute-button percentage progress update. Host state/dependencies are intentionally external. */
function setProgress(btn, pct){
    if(!btn) return;
    const fill = btn.querySelector('.rt-exec-bar-fill');
    const pctEl = btn.querySelector('.rt-exec-pct');
    const p = clamp(pct, 0, 1);
    if(fill) fill.style.width = (p*100).toFixed(1) + '%';
    if(pctEl) pctEl.textContent = Math.round(p*100) + '%';
  }
