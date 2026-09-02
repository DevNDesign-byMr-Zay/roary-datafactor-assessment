const wrapEraseMask = () => {
    try {
      if (!window.__asterErase || typeof window.__asterErase.getMaskDataURL !== 'function') return;
      if (window.__asterErase.__asterScaledMaskWrapped) return;
      const orig = window.__asterErase.getMaskDataURL.bind(window.__asterErase);
      window.__asterErase.getMaskDataURL = function(){
        const raw = orig();
        const img = getModalImg();
        if (raw && img && img.naturalWidth > 0 && typeof window.scaleDataUrlToSize === 'function') {
          return window.scaleDataUrlToSize(raw, img.naturalWidth, img.naturalHeight);
        }
        return raw;
      };
      window.__asterErase.__asterScaledMaskWrapped = true;
    } catch(_) {}
  };
