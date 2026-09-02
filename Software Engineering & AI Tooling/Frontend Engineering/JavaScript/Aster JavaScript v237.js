/* Aster JavaScript v237 — authenticated buyer-safe derivative: model-mode selector state synchronization. Host state/dependencies are intentionally external. */
function syncUI(){
      const m = deriveMode() === 'advanced' ? 'advanced' : 'instant';
      btnText.textContent = (m === 'advanced') ? 'ADVANCED' : 'FAST';
      opts.forEach(o=>{
        const isAdv = (String(o.getAttribute('data-mode')||'').toLowerCase() === 'advanced');
        o.classList.toggle('is-selected', (m === 'advanced') ? isAdv : !isAdv);
      });
    }
