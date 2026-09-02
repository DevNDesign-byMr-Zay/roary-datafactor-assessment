/* Aster JavaScript v283 — authenticated buyer-safe derivative: active modal-image resolution. Host state/dependencies are intentionally external. */
function getModalImgEl(){
    try{
      if(typeof window.getModalImageEl === "function"){
        const el = window.getModalImageEl();
        if(el && el.src) return el;
      }
    }catch(e){}
    return document.querySelector("#imageModalImg") || document.querySelector(".image-modal img") || document.querySelector("img");
  }
