/* Aster JavaScript v504
Authenticated historical derivative: synchronize composer multiline state and bounded textarea growth with attachment presence.
*/
function syncAttachmentAwareComposer({ textarea, composer, wrapper = null, shell = null, attachmentCount = 0, fallbackMax = 132 } = {}) {
  if (!textarea || !composer) return { multiline: false, height: 0 };
  const style = getComputedStyle(textarea);
  const line = parseFloat(style.lineHeight) || 18;
  const base = Math.round(line + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0));
  const max = parseFloat(style.maxHeight) || fallbackMax;
  textarea.style.height = "auto";
  const needed = textarea.scrollHeight;
  const hasAttachments = Number(attachmentCount) > 0;
  const multiline = hasAttachments || /\n/.test(textarea.value || "") || needed > base + 6;
  wrapper?.classList.toggle("composer--is-multiline", multiline);
  shell?.classList.toggle("composer--is-multiline", multiline);
  composer.classList.toggle("composer--has-attachments", hasAttachments);
  if (!hasAttachments && !multiline) {
    textarea.style.height = "";
    textarea.style.overflowY = "hidden";
    return { multiline, height: base };
  }
  const height = Math.max(base, Math.min(max, needed));
  textarea.style.height = `${height}px`;
  textarea.style.overflowY = needed > max + 2 ? "auto" : "hidden";
  return { multiline, height };
}
