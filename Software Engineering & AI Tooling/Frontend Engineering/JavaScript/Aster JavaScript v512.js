/* Aster JavaScript v512
Authenticated historical derivative: capture clipboard files without cancelling normal text paste behavior in the composer.
*/
function bindClipboardFileCapture(textarea, onFiles) {
  if (!textarea) return () => {};
  const handler = event => {
    const items = Array.from(event.clipboardData?.items || []);
    const files = items
      .filter(item => item?.kind === "file")
      .map(item => item.getAsFile?.())
      .filter(Boolean);
    if (files.length) onFiles?.(files, event);
  };
  textarea.addEventListener("paste", handler, { passive: true });
  return () => textarea.removeEventListener("paste", handler);
}
