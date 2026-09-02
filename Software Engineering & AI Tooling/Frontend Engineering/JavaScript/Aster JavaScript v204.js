/* Aster JavaScript v204 — authenticated buyer-safe derivative: bounded timestamped diagnostic ring buffer. Host state/dependencies are intentionally external. */
function logDiag(line){
    const s = `[${new Date().toLocaleTimeString()}] ${line}`;
    state.lastDiag.unshift(s);
    state.lastDiag = state.lastDiag.slice(0, 80);
    if($("#listDiag") && $("#listDiag").style.display!=="none") renderDiag();
  }
