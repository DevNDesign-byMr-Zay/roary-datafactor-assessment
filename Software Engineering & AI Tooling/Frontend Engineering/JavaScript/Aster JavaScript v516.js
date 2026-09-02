/* Aster JavaScript v516
Authenticated historical derivative: restore attachment rendering after composer DOM replacement using an idempotent child-list observer.
*/
function observeAttachmentRenderIntegrity(composer, { hasAttachments, render } = {}) {
  if (!composer) return () => {};
  const marker = Symbol.for("aster.attachmentRenderObserver");
  if (composer[marker]) return composer[marker].disconnect;
  const observer = new MutationObserver(() => {
    if (hasAttachments?.()) render?.(composer);
  });
  observer.observe(composer, { childList: true, subtree: true });
  const disconnect = () => {
    observer.disconnect();
    try { delete composer[marker]; } catch (_) {}
  };
  composer[marker] = { observer, disconnect };
  return disconnect;
}
