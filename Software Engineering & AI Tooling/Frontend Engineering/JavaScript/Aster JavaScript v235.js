/* Aster JavaScript v235 — authenticated buyer-safe derivative: forced model-mode migration and synchronization. Host state/dependencies are intentionally external. */
function forceSet(mode){
    const key = (mode === 'advanced') ? ADV_KEY : FAST_KEY;
    const modeName = (mode === 'advanced') ? 'advanced' : 'instant';

    const write = ()=>{
      try{
        localStorage.setItem('aster.model', key);
        localStorage.setItem('aster.modelMode', modeName);
      }catch(_){/* ignore */}
    };

    // Immediate write
    write();

    // Use the core switcher if available (it also updates internal state)
    try{ if(typeof window.Gt === 'function') window.Gt(key); }catch(_){/* ignore */}

    // Re-assert briefly to beat any late "defaults" that try to revert
    const until = Date.now() + 900;
    const t = setInterval(()=>{
      if(Date.now() > until){ clearInterval(t); return; }
      write();
    }, 45);

    // Extra same-tick + next-tick reassert
    try{ queueMicrotask(write); }catch(_){ /* older browsers */ }
    setTimeout(write, 0);
    setTimeout(write, 120);
  }
