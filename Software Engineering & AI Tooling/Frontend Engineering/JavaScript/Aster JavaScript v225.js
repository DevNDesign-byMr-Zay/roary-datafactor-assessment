/* Aster JavaScript v225 — authenticated buyer-safe derivative: bounded transient status toast controller. Host state/dependencies are intentionally external. */
function toast(msg, kind="info"){
    const el = $("#toast");
    el.textContent = String(msg||"");
    el.style.borderColor =
      kind==="ok" ? "rgba(67,255,180,.35)" :
      kind==="bad" ? "rgba(255,77,109,.35)" :
      kind==="warn"? "rgba(255,213,107,.35)" :
      "rgba(168,85,247,.28)";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.classList.remove("show"), 3200);
  }
