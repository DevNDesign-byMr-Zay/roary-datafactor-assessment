/* Aster JavaScript v281 — authenticated buyer-safe derivative: mask-expansion value retrieval. Host state/dependencies are intentionally external. */
function getMaskExpansion(){
    const p = getRemovePanel();
    if(!p) return "";
    const inp = p.querySelector('input[name="mask_expansion"], input[data-mask-expansion], input#rtRemoveMaskExpansion');
    if(inp && inp.value !== undefined && inp.value !== null){
      const n = parseInt(String(inp.value), 10);
      if(Number.isFinite(n)) return String(Math.max(0, Math.min(50, n)));
    }
    return "";
  }
