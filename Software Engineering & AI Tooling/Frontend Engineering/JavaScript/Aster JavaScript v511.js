/* Aster JavaScript v511
Authenticated historical derivative: detect external attachment-array mutations with a compact semantic signature and rerender only when state changes.
*/
function watchAttachmentSignature(getAttachments, onChange, { intervalMs = 250 } = {}) {
  let previous = "";
  const signature = () => {
    const items = Array.isArray(getAttachments?.()) ? getAttachments() : [];
    return `${items.map(item => String(item?.id || item?.name || item?.fileName || "")).join("|")}::${items.length}`;
  };
  const tick = () => {
    const next = signature();
    if (next === previous) return;
    previous = next;
    onChange?.(next);
  };
  tick();
  const timer = setInterval(tick, Math.max(50, Number(intervalMs) || 250));
  return () => clearInterval(timer);
}
