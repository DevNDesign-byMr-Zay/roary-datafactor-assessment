/* Aster JavaScript v038
Authenticated historical derivative: keep the animated expand overlay structurally behind the modal image.
Original product identity, private prompts, personal paths, credentials, and protected internal architecture removed.
*/
(function(){
  function placeExpandOverlayBehind(){
    try{
      const overlay = document.getElementById("asterExpandOverlay");
      const image =
        document.getElementById("imageModalImg") ||
        document.querySelector(".image-modal img");

      if(!overlay || !image) return false;

      const shell = image.parentElement;
      if(!shell) return false;

      if(overlay.parentElement !== shell || shell.firstChild !== overlay){
        shell.insertBefore(overlay, image);
      }

      image.style.position = image.style.position || "relative";
      image.style.zIndex = image.style.zIndex || "6";
      return true;
    }catch(_){
      return false;
    }
  }

  placeExpandOverlayBehind();

  document.addEventListener("click", function(){
    setTimeout(placeExpandOverlayBehind, 50);
    setTimeout(placeExpandOverlayBehind, 200);
  }, true);

  const previous = window.asterUpdateExpandOverlay;
  if(typeof previous === "function"){
    window.asterUpdateExpandOverlay = function(){
      const result = previous.apply(this, arguments);
      setTimeout(placeExpandOverlayBehind, 0);
      return result;
    };
  }

  window.asterPlaceExpandOverlayBehind = placeExpandOverlayBehind;
})();
