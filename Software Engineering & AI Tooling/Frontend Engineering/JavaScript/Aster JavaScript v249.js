/* Aster JavaScript v249 — authenticated buyer-safe derivative: chat-image eligibility filtering. Host state/dependencies are intentionally external. */
function isEligible(img){
    if(!img || !(img instanceof HTMLImageElement)) return false;
    if(img.closest('#imageModal')) return false;
    // only chat images / variations
    if(img.closest('#chatInner')) return true;
    if(img.closest('.generated-image-frame') || img.classList.contains('generated-image')) return true;
    if(img.closest('.rt-chat-image-wrap') || img.classList.contains('rt-chat-image')) return true;
    return false;
  }
