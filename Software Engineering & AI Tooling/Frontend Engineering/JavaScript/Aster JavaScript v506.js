/* Aster JavaScript v506
Authenticated historical derivative: bind attachment inputs, composer growth, and drag/drop exactly once even when dynamic UI setup runs repeatedly.
*/
function bindAttachmentControlsOnce({ composer, textarea, inputs = [], onFiles, onSync } = {}) {
  if (!composer || !textarea) return;
  if (!textarea.dataset.attachmentGrowBound) {
    textarea.dataset.attachmentGrowBound = "1";
    textarea.addEventListener("input", () => onSync?.());
  }
  for (const input of inputs.filter(Boolean)) {
    if (input.dataset.attachmentInputBound) continue;
    input.dataset.attachmentInputBound = "1";
    input.addEventListener("change", async event => {
      await onFiles?.(Array.from(event.target.files || []));
      try { event.target.value = ""; } catch (_) {}
      onSync?.();
    });
  }
  if (!composer.dataset.attachmentDropBound) {
    composer.dataset.attachmentDropBound = "1";
    composer.addEventListener("dragover", event => event.preventDefault());
    composer.addEventListener("drop", async event => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer?.files || []);
      if (files.length) await onFiles?.(files);
      onSync?.();
    });
  }
}
