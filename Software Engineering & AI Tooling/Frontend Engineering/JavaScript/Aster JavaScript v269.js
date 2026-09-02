/* Aster JavaScript v269 — authenticated buyer-safe derivative: media-library open-state detection. Host state/dependencies are intentionally external. */
function isMediaOpen(){
    const ah = mediaView.getAttribute('aria-hidden');
    return ah !== null && ah !== 'true';
  }
