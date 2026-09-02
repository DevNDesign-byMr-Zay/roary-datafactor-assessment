/* Aster JavaScript v502
Authenticated historical derivative: reconcile a single attachment strip with the currently active composer and remove stray duplicate owners.
*/
function reconcileAttachmentStrip(composer, { id = "attachment-strip", beforeSelector = null } = {}) {
  if (!composer) return null;
  document.querySelectorAll(`#${CSS.escape(id)}`).forEach(node => {
    if (!composer.contains(node)) node.remove();
  });
  let strip = composer.querySelector(`#${CSS.escape(id)}`);
  if (strip) return strip;
  strip = document.createElement("div");
  strip.id = id;
  strip.className = "attachment-strip";
  const before = beforeSelector ? composer.querySelector(beforeSelector) : null;
  composer.insertBefore(strip, before || composer.firstChild);
  return strip;
}
