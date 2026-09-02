/* Aster JavaScript v231 — authenticated buyer-safe derivative: download-options state rendering. Host state/dependencies are intentionally external. */
function updatePanel(panel, s){
    const fmt=(s.format||"png").toLowerCase();
    const isPng = fmt==="png";
    const isJw = (fmt==="jpg"||fmt==="jpeg"||fmt==="webp");

    const qWrap=panel.querySelector("#rtDlQualityWrap");
    const tWrap=panel.querySelector("#rtDlTransparentWrap");
    const qRead=panel.querySelector("#rtDlQualityReadout");
    const note=panel.querySelector("#rtDlNote");

    if(qWrap) qWrap.classList.toggle("rt-dl-disabled", !isJw);
    if(tWrap) tWrap.classList.toggle("rt-dl-disabled", !isPng);

    if(qRead) qRead.textContent = isJw ? `${effectiveQuality(s)}%` : "—";
    syncScaleLabels(panel);

    const {w,h}=getModalSize();
    if(note){
      if(w && h){
        const nw=Math.max(1, Math.round(w*(s.scale/100)));
        const nh=Math.max(1, Math.round(h*(s.scale/100)));
        note.textContent = `${fmt.toUpperCase()} • ${nw}×${nh}`;
      }else{
        note.textContent = `${fmt.toUpperCase()}`;
      }
    }
  }
