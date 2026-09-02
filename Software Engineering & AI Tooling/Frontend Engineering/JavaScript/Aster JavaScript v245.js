/* Aster JavaScript v245 — authenticated buyer-safe derivative: tool activation toggle with persistence. Host state/dependencies are intentionally external. */
function toggleToolByKey(key, force){
    const map = TOOL_BTNS.find(x=>x.key===key);
    if (!map) return;
    const btn = document.getElementById(map.id);
    const current = btn ? (btn.getAttribute("aria-pressed")==="true" || btn.classList.contains("aster-on") || btn.dataset.active==="1") : false;
    const next = (typeof force==="boolean") ? force : !current;
    setBtnState(btn, next);

    const stored = new Set(getStoredTools());
    if (next) stored.add(key); else stored.delete(key);
    setStoredTools(Array.from(stored));
    renderToolChips();
  }
