/* Aster JavaScript v280 — authenticated buyer-safe derivative: object-removal quality selection. Host state/dependencies are intentionally external. */
function getRemoveQuality(){
    const p = getRemovePanel();
    if(!p) return "";
    const sel = p.querySelector('select[name="model"], select[data-remove-quality], select#rtRemoveQuality');
    if(sel && sel.value) return String(sel.value);
    const pill = p.querySelector("[data-remove-quality].active,[data-remove-quality][aria-pressed='true']");
    if(pill) return String(pill.getAttribute("data-remove-quality")||"");
    return "";
  }
