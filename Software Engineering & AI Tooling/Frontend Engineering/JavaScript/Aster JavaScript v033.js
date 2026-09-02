/* Aster JavaScript v033
Authenticated historical derivative: expand-fill underlay placement.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
*/
(function(){
  function byId(id){ return document.getElementById(id); }

  function ensureExpandUnderlay(){
    try{
      const image = byId("imageModalImg");
      const overlay = byId("rtExpandOverlay2");
      const fill = byId("rtExpandFillCanvas");
      if(!image || !overlay || !fill) return false;

      const host =
        image.parentElement ||
        image.closest(".img-modal-center") ||
        image.closest(".img-modal") ||
        image.closest("#imageModal") ||
        document.body;
      if(!host) return false;

      try{
        if(getComputedStyle(host).position === "static"){
          host.style.position = "relative";
        }
      }catch(_){}

      let underlay = byId("asterExpandUnderlay");
      if(!underlay){
        underlay = document.createElement("div");
        underlay.id = "asterExpandUnderlay";
        underlay.style.cssText =
          "position:absolute;inset:0;pointer-events:none;z-index:1;";
        host.insertBefore(underlay, image);
      }

      image.style.position = "relative";
      image.style.zIndex = "2";
      overlay.style.zIndex = "3";

      if(fill.parentElement !== underlay){
        underlay.appendChild(fill);
      }

      fill.style.left = "0";
      fill.style.top = "0";
      fill.style.width = "100%";
      fill.style.height = "100%";
      fill.style.pointerEvents = "none";
      return true;
    }catch(_){
      return false;
    }
  }

  window.asterEnsureExpandUnderlay = ensureExpandUnderlay;
  setTimeout(ensureExpandUnderlay, 120);
})();
