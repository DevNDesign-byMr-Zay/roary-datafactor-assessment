/* Aster JavaScript v246 — authenticated buyer-safe derivative: active-tool chip placement above composer. Host state/dependencies are intentionally external. */
function moveChipsAboveComposer(){
    const host = chipsHost();
    const ta = $("#composerInput");
    if (!host || !ta) return;
    if (host.dataset.asterMoved==="1") return;
    try{
      ta.parentNode.insertBefore(host, ta);
      host.dataset.asterMoved="1";
    }catch(_){}
  }
