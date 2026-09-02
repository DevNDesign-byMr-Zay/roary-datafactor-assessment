/* Aster JavaScript v236 — authenticated buyer-safe derivative: topbar selector slot positioning. Host state/dependencies are intentionally external. */
function moveSlotNextToLogo(){
    const slot = document.getElementById('rtTopbarModelSlot');
    const brand = document.querySelector('.topbar .brand');
    if(!slot || !brand) return;

    // Remove centering/title class if present so it behaves like an inline control
    try{ slot.classList.remove('topbar-images-title'); }catch(_){ }

    // Insert after the logo but before the sr-only span (keeps screen-reader label at end)
    const sr = brand.querySelector('.sr-only');
    if(sr) brand.insertBefore(slot, sr);
    else brand.appendChild(slot);
  }
