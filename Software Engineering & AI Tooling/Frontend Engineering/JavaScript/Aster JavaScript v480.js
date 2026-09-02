/* Aster JavaScript v480
Authenticated historical derivative: preload and fade-swap a preview image without pushing carousel/history state.
*/
function fadeReplacePreviewImage(image, newSrc, { modal, syncCanvas, timeoutMs = 900 } = {}) {
  return new Promise(resolve => {
    if (!image) return resolve(newSrc || "");
    try {
      const current = modal?.dataset?.currentSrc || image.src || "";
      if (current && modal?.dataset && !modal.dataset.previewBaseSrc) modal.dataset.previewBaseSrc = current;
    } catch {}
    const preload = new Image();
    preload.crossOrigin = "anonymous";
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      image.classList.remove("is-fading");
      try { syncCanvas?.(); } catch {}
      resolve(newSrc || "");
    };
    const apply = () => {
      image.classList.add("is-fading");
      requestAnimationFrame(() => {
        image.addEventListener("load", finish, { once: true });
        image.src = newSrc;
        if (modal?.dataset) modal.dataset.currentSrc = newSrc;
        setTimeout(finish, timeoutMs);
      });
    };
    preload.onload = apply;
    preload.onerror = apply;
    preload.src = newSrc;
  });
}
