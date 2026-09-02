/* Aster JavaScript v243 — authenticated buyer-safe derivative: active tool metadata reconstruction. Host state/dependencies are intentionally external. */
function readActiveTools(){
    const keys = getStoredTools();
    const out = [];
    for (const k of keys){
      const found = TOOL_BTNS.find(x=>x.key===k);
      const btn = found ? document.getElementById(found.id) : null;
      const meta = btn ? (toolMeta(btn) || {}) : {};
      out.push({ key:k, id:found?.id || "", title:meta.title || labelForKey(k), svg: meta.svg || null });
    }
    return out;
  }
