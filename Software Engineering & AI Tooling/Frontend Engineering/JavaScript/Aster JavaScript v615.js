export function resolveToolImageSource(image) {
  if (!image) return '';
  const original = image.dataset?.origSrc || image.dataset?.sourceSrc || '';
  return String(original || image.currentSrc || image.src || '');
}

export function ensurePreviewCanvas(documentRef, {
  shellSelector = '.image-shell',
  canvasId = 'preview-canvas',
  className = 'preview-canvas',
  zIndex = '12',
} = {}) {
  if (!documentRef || typeof documentRef.querySelector !== 'function') return null;
  const shell = documentRef.querySelector(shellSelector);
  if (!shell) return null;

  let canvas = typeof documentRef.getElementById === 'function'
    ? documentRef.getElementById(canvasId)
    : null;

  if (!canvas) {
    canvas = documentRef.createElement('canvas');
    canvas.id = canvasId;
    canvas.className = className;
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      zIndex,
      opacity: '0',
      transition: 'opacity 120ms ease',
    });
    shell.appendChild(canvas);
  }
  return canvas;
}

export function setPreviewCanvasVisible(canvas, visible) {
  if (!canvas?.style) return false;
  canvas.style.opacity = visible ? '1' : '0';
  return true;
}
