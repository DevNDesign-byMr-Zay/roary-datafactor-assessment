function toast(msg, kind="info"){
    const el = $("#toast");
    el.textContent = msg;
    el.style.borderColor = kind==="ok" ? "rgba(67,255,180,.35)" : kind==="bad" ? "rgba(255,77,109,.35)" : "rgba(168,85,247,.28)";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.classList.remove("show"), 2600);
  }
