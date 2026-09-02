/* Aster JavaScript v519
Authenticated historical derivative: expose a bounded attachment-render resynchronization hook for independently mounted UI patches.
*/
function publishAttachmentRenderHook(target, renderAll, key = '__attachmentRenderSync') {
  if (!target || typeof renderAll !== 'function') return () => {};
  const previous = target[key];
  const hook = () => {
    try { renderAll(); }
    catch (_) {}
  };
  target[key] = hook;
  return () => {
    if (target[key] !== hook) return;
    if (previous === undefined) delete target[key];
    else target[key] = previous;
  };
}
