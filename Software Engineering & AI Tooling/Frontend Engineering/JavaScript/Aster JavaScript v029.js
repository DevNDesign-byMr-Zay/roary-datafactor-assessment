/* Aster JavaScript v029
Authenticated historical derivative: stable active-image source selection plus cache-busting.
Original product identity, private prompts, credentials, personal paths, and protected reasoning architecture removed.
*/
window.asterPickActiveImageSrc = function(modalImgEl){
  try{
    const modalImage =
      modalImgEl ||
      (typeof getModalImageEl === "function" ? getModalImageEl() : null) ||
      document.getElementById("imageModalImg");

    const modalSrc = modalImage && (modalImage.currentSrc || modalImage.src)
      ? (modalImage.currentSrc || modalImage.src)
      : "";
    if(modalSrc) return modalSrc;

    const shell =
      (typeof getActiveImageShellForExpand === "function" ? getActiveImageShellForExpand() : null) ||
      (typeof getActiveImageShell === "function" ? getActiveImageShell() : null) ||
      document.querySelector(".aster-img-shell.active, .rt-img-shell.active, .image-shell.active");

    if(shell){
      const img = shell.querySelector("img");
      const src = img && (img.currentSrc || img.src)
        ? (img.currentSrc || img.src)
        : (shell.dataset?.currentSrc || shell.dataset?.src || "");
      if(src) return src;
    }

    const fallback = document.querySelector(
      "#imageModal img, #imageModalImg, .modal img, img.aster-active, img.active, img[aria-selected='true']"
    );
    if(fallback && (fallback.currentSrc || fallback.src)) {
      return fallback.currentSrc || fallback.src;
    }

    return "";
  }catch(_){
    return "";
  }
};

window.asterCacheBust = function(url){
  try{
    const value = String(url || "");
    if(!value) return value;
    if(/[?&](t|cb|_)=\d+/.test(value)) return value;
    const separator = value.includes("?") ? "&" : "?";
    return value + separator + "cb=" + Date.now();
  }catch(_){
    return url;
  }
};
