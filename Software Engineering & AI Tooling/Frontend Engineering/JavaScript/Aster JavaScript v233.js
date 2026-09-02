/* Aster JavaScript v233 — authenticated buyer-safe derivative: persisted enhancement-quality preset selection. Host state/dependencies are intentionally external. */
function setPreset(presetId, root){
    try{ localStorage.setItem('__asterEnhancementQuality', presetId); }catch(e){}
    try{ window.__asterEnhancementQuality=presetId; }catch(e){}
    const preset=PRESETS.find(p=>p.id===presetId)||PRESETS[1];
    const stepsEl=root.querySelector('#asterEnhanceSteps');
    if(stepsEl){
      const v=clamp(preset.steps, Number(stepsEl.min||8), Number(stepsEl.max||50));
      stepsEl.value=String(v);
      // trigger existing bindings
      try{ stepsEl.dispatchEvent(new Event('input',{bubbles:true})); }catch(e){}
      try{ stepsEl.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
    }
    const meta=root.querySelector('[data-aster="enhancement-quality-meta"]');
    if(meta) meta.textContent=`steps ${preset.steps}`;
    root.querySelectorAll('.rtp-qbtn').forEach(btn=>btn.classList.toggle('is-active', btn.dataset.preset===presetId));
  }
