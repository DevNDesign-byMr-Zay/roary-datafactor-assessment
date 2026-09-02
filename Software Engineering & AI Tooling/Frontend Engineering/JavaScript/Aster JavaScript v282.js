/* Aster JavaScript v282 — authenticated buyer-safe derivative: object-removal prompt retrieval. Host state/dependencies are intentionally external. */
function getRemovePrompt(){
    const p = getRemovePanel();
    if(!p) return "";
    const ta = p.querySelector("textarea");
    if(ta && typeof ta.value === "string") return ta.value.trim();
    const inp = p.querySelector('input[type="text"], input:not([type])');
    if(inp && typeof inp.value === "string") return inp.value.trim();
    return "";
  }
