/* Aster JavaScript v234 — authenticated buyer-safe derivative: persisted model-mode derivation. Host state/dependencies are intentionally external. */
function deriveMode(){
    const m = String(localStorage.getItem('aster.modelMode') || '').toLowerCase();
    const raw = String(localStorage.getItem('aster.model') || '').toLowerCase();
    if(m === 'advanced') return 'advanced';
    if(raw === ADV_KEY || raw.includes('maverick')) return 'advanced';
    return 'instant';
  }
