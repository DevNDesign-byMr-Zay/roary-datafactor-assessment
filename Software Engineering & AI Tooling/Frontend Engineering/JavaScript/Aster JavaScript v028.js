/* Aster JavaScript v028
Authenticated historical derivative: expand-overlay coexistence guard.
When the newer overlay implementation is active, the legacy overlay is removed and not recreated.
Original product identity, private prompts, credentials, personal paths, and protected reasoning architecture removed.
*/
(function(){
  window.asterGuardLegacyExpandOverlay = function(){
    const modern = document.getElementById("rtExpandOverlay2");
    if (!modern) return false;
    try {
      const legacy = document.getElementById("asterExpandOverlay");
      if (legacy && typeof legacy.remove === "function") legacy.remove();
    } catch (_) {}
    return true;
  };
})();
