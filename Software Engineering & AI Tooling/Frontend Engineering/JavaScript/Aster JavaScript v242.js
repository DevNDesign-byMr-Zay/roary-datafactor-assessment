/* Aster JavaScript v242 — authenticated buyer-safe derivative: tool-button metadata extraction. Host state/dependencies are intentionally external. */
function toolMeta(btn){
    if (!btn) return null;
    const title = (btn.querySelector(".tool-title")?.textContent || btn.textContent || "").trim();
    const svg = btn.querySelector("svg") ? btn.querySelector("svg").cloneNode(true) : null;
    return { title, svg };
  }
