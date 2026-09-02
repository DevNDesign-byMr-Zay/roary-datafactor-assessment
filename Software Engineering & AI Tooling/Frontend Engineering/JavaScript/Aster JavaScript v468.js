/* Aster JavaScript v468
Authenticated historical derivative: toggle an expand-focused modal state and resync its overlay after layout changes.
Product identity and private globals removed.
*/
function applyExpandFocus(modal, updateOverlay) {
  const isExpand = document.body?.dataset?.orbTool === "expand";
  const isOpen = !!modal?.classList?.contains("open");
  const enabled = !!(isExpand && isOpen);
  modal?.classList?.toggle("expand-focus", enabled);
  if (enabled && typeof updateOverlay === "function") {
    requestAnimationFrame(() => updateOverlay());
    setTimeout(() => updateOverlay(), 220);
    setTimeout(() => updateOverlay(), 520);
  }
  return enabled;
}
