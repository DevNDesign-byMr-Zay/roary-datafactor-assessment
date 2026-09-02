function logDiag(line){
    const s = `[${new Date().toLocaleTimeString()}] ${line}`;
    state.lastDiag.unshift(s);
    state.lastDiag = state.lastDiag.slice(0, 80);
    if($("#listDiag") && $("#listDiag").style.display!=="none") renderDiag();
  }
