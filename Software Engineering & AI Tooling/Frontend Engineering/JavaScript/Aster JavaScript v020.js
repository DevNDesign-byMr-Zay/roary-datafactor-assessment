window.asterPickActiveImageSrc = function(modalImgEl) {
  try {
    const modalImage =
      modalImgEl ||
      (typeof getModalImageEl === "function" ? getModalImageEl() : null) ||
      document.getElementById("imageModalImg");

    const modalSrc =
      modalImage && (modalImage.currentSrc || modalImage.src)
        ? (modalImage.currentSrc || modalImage.src)
        : "";

    if (modalSrc) return modalSrc;

    const shell =
      (typeof getActiveImageShellForExpand === "function" ? getActiveImageShellForExpand() : null) ||
      (typeof getActiveImageShell === "function" ? getActiveImageShell() : null) ||
      document.querySelector(".aster-img-shell.active, .rt-img-shell.active, .image-shell.active");

    if (shell) {
      const image = shell.querySelector("img");
      const shellSrc =
        image && (image.currentSrc || image.src)
          ? (image.currentSrc || image.src)
          : (shell.dataset?.currentSrc || shell.dataset?.src || "");

      if (shellSrc) return shellSrc;
    }

    const selectedImage = document.querySelector(
      "#imageModal img, #imageModalImg, .modal img, img.aster-active, img.active, img[aria-selected='true']"
    );

    if (selectedImage && (selectedImage.currentSrc || selectedImage.src)) {
      return selectedImage.currentSrc || selectedImage.src;
    }

    const legacyState = window.G;
    return legacyState?.dataset?.currentSrc || legacyState?.dataset?.src || "";
  } catch (_) {
    return "";
  }
};

window.asterCacheBust = function(url) {
  try {
    const value = String(url || "");
    if (!value) return value;
    if (/[?&](t|cb|_)=\d+/.test(value)) return value;
    const separator = value.includes("?") ? "&" : "?";
    return value + separator + "cb=" + Date.now();
  } catch (_) {
    return url;
  }
};
