/* Aster JavaScript v508
Authenticated historical derivative: use capture-phase option dispatch to preempt a conflicting parent menu handler without double selection.
*/
function bindCapturePriorityOptions({ root = document, selector, isActive = () => true, getValue = node => node.dataset.value, onSelect, onClose } = {}) {
  if (!selector) throw new TypeError("selector is required");
  const handler = event => {
    if (!isActive()) return;
    const target = event.target;
    const option = target?.closest?.(selector);
    if (!option) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    onSelect?.(getValue(option), option, event);
    onClose?.();
  };
  root.addEventListener("pointerdown", handler, true);
  return () => root.removeEventListener("pointerdown", handler, true);
}
