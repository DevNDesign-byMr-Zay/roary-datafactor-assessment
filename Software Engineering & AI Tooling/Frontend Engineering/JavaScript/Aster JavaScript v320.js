/* Aster JavaScript v320 — authenticated buyer-safe derivative: tool-chip close-control normalization. Host state/dependencies are intentionally external. */
function upgradeToolChipXs(){
    try{
      document.querySelectorAll('.tool-chip .aster-attach-x').forEach(x=>{
        // ensure it's focusable/clickable even if span
        if(x.tagName !== 'BUTTON'){
          x.setAttribute('role','button');
          x.setAttribute('tabindex','-1');
          x.setAttribute('aria-label','Remove tool');
        } else {
          x.setAttribute('aria-label','Remove tool');
          x.type = 'button';
        }
      });
    }catch(_){ }
  }
