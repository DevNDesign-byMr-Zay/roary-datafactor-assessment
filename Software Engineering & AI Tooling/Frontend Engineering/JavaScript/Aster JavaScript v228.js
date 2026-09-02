/* Aster JavaScript v228 — authenticated buyer-safe derivative: central-image busy-state synchronization. Host state/dependencies are intentionally external. */
function setCenterImageBusy(on, label){
  try{ if(typeof Se==="function"){ Se(!!on, label||""); return; } }catch(e){}
  try{
    const modal = document.querySelector(".img-modal.open") || document.getElementById("imageModal");
    if(!modal) return;
    let ov = modal.querySelector("#rtCenterBusyOverlay");
    if(!ov){
      ov = document.createElement("div");
      ov.id = "rtCenterBusyOverlay";
      ov.className = "rt-center-busy";
      ov.innerHTML = '<div class="rt-center-busy-inner"><div class="rt-center-spinner"></div><div class="rt-center-busy-txt"></div></div>';
      modal.appendChild(ov);
      // minimal styles (keeps brand: dark glass + purple shimmer)
      const st = document.createElement("style");
      st.textContent = `
        .rt-center-busy{position:absolute;inset:0;display:none;align-items:center;justify-content:center;z-index:999999;pointer-events:none}
        .rt-center-busy-inner{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;
          background:rgba(10,10,14,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          border:1px solid rgba(160,120,255,.18);box-shadow:0 12px 40px rgba(0,0,0,.45)}
        .rt-center-spinner{width:16px;height:16px;border-radius:999px;border:2px solid rgba(255,255,255,.22);
          border-top-color:rgba(175,120,255,.95);animation:rtspin .8s linear infinite}
        .rt-center-busy-txt{font:600 12px/1.2 system-ui,Segoe UI,Roboto,Arial;color:rgba(245,245,255,.92);letter-spacing:.2px}
        @keyframes rtspin{to{transform:rotate(360deg)}}
      `;
      modal.appendChild(st);
    }
    ov.style.display = on ? "flex" : "none";
    const txt = ov.querySelector(".rt-center-busy-txt");
    if(txt) txt.textContent = label || (on ? "Working…" : "");
  }catch(e){}
}
