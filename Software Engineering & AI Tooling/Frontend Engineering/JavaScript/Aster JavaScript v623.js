/**
 * Capture-phase interaction guard for conflict-prone popovers/menus.
 * It lets an interaction cluster handle option selection before legacy
 * document/window outside-click handlers can close or steal the event.
 */
export function isInsideAny(target, roots = []) {
  return roots.some((root) => !!root && (target === root || root.contains?.(target)));
}

export function installCaptureInteractionGuard({
  captureTarget,
  roots = [],
  resolveOption,
  onSelect,
  events = ['pointerdown'],
  preventDefaultOnSelect = true,
} = {}) {
  if (!captureTarget?.addEventListener || !captureTarget?.removeEventListener) {
    throw new TypeError('captureTarget must support addEventListener/removeEventListener.');
  }

  const activeRoots = roots.filter(Boolean);
  const handler = (event) => {
    const target = event?.target;
    if (!isInsideAny(target, activeRoots)) return;

    const option = resolveOption?.(target, event) ?? null;
    if (option) {
      if (preventDefaultOnSelect) event.preventDefault?.();
      event.stopImmediatePropagation?.();
      onSelect?.(option, event);
      return;
    }

    // Shield ordinary interactions inside the cluster from earlier/later
    // outside-click closers without suppressing the browser default action.
    event.stopImmediatePropagation?.();
  };

  const registered = [];
  for (const type of [...new Set(events.map(String).filter(Boolean))]) {
    captureTarget.addEventListener(type, handler, true);
    registered.push(type);
  }

  return function cleanup() {
    for (const type of registered) captureTarget.removeEventListener(type, handler, true);
  };
}
