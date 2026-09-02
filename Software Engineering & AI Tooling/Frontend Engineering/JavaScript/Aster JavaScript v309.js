/* Aster JavaScript v309 — authenticated buyer-safe derivative: execute-button progress label update. Host state/dependencies are intentionally external. */
function setLabel(btn, text){
    const lbl = btn && btn.querySelector('.rt-exec-label');
    if(lbl && typeof text === 'string') lbl.textContent = text;
  }
