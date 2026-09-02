/* Aster JavaScript v241 — authenticated buyer-safe derivative: tool-button active-state synchronization. Host state/dependencies are intentionally external. */
function setBtnState(btn, on){
    if(!btn) return;
    const pressed = on ? "true" : "false";
    // Avoid unnecessary attribute writes (prevents MutationObserver spam + hover flicker)
    if (btn.getAttribute("aria-pressed") !== pressed) {
      btn.setAttribute("aria-pressed", pressed);
    }
    const want = !!on;
    if (btn.classList.contains("aster-on") !== want) btn.classList.toggle("aster-on", want);
    if (btn.classList.contains("active") !== want) btn.classList.toggle("active", want);
    const da = want ? "1" : "0";
    if (btn.dataset.active !== da) btn.dataset.active = da;
  }
