/**
 * Selection-aware file-picker relock coordinator.
 *
 * Keeps a file input usable for the lifetime of a native picker transaction,
 * treats `change` as the authoritative selection signal, and uses restored
 * focus only as a delayed cancellation signal. Re-opening invalidates stale
 * callbacks from earlier transactions.
 */
export function createFilePickerRelockCoordinator({
  input,
  focusTarget = typeof window !== 'undefined' ? window : null,
  unlock = defaultUnlock,
  lock = defaultLock,
  activate = (node) => node.click(),
  schedule = (fn, delay = 0) => setTimeout(fn, delay),
  focusGraceMs = 250,
  resetBeforeOpen = true,
} = {}) {
  if (!input || typeof input.addEventListener !== 'function') {
    throw new TypeError('input must be an EventTarget-like file input');
  }
  if (!focusTarget || typeof focusTarget.addEventListener !== 'function') {
    throw new TypeError('focusTarget must be EventTarget-like');
  }
  if (typeof unlock !== 'function' || typeof lock !== 'function') {
    throw new TypeError('unlock and lock must be functions');
  }
  if (typeof activate !== 'function' || typeof schedule !== 'function') {
    throw new TypeError('activate and schedule must be functions');
  }

  let epoch = 0;
  let disposed = false;
  let cleanupCurrent = null;
  let active = false;

  function safeLock() {
    try { lock(input); } catch (_) {}
  }

  function closeTransaction(tx) {
    if (tx !== epoch) return false;
    if (cleanupCurrent) {
      const cleanup = cleanupCurrent;
      cleanupCurrent = null;
      cleanup();
    }
    active = false;
    safeLock();
    return true;
  }

  function scheduleClose(tx, delay = 0) {
    schedule(() => closeTransaction(tx), Math.max(0, Number(delay) || 0));
  }

  function open() {
    if (disposed) return false;

    // Invalidate callbacks/timers from any prior picker transaction.
    epoch += 1;
    const tx = epoch;
    if (cleanupCurrent) {
      const cleanup = cleanupCurrent;
      cleanupCurrent = null;
      cleanup();
    }

    let picked = false;
    active = true;

    const onChange = () => {
      if (tx !== epoch || disposed) return;
      picked = true;
      // Selection is authoritative; re-lock on the next task after change.
      scheduleClose(tx, 0);
    };

    const onFocus = () => {
      if (tx !== epoch || disposed) return;
      // Browsers may restore focus before dispatching `change`.
      schedule(() => {
        if (tx === epoch && !disposed && !picked) closeTransaction(tx);
      }, Math.max(0, Number(focusGraceMs) || 0));
    };

    input.addEventListener('change', onChange, { once: true, capture: true });
    focusTarget.addEventListener('focus', onFocus, { once: true, capture: true });

    cleanupCurrent = () => {
      try { input.removeEventListener('change', onChange, true); } catch (_) {}
      try { focusTarget.removeEventListener('focus', onFocus, true); } catch (_) {}
    };

    try {
      if (resetBeforeOpen && 'value' in input) {
        // Clearing the value lets the same file produce a fresh change event.
        try { input.value = ''; } catch (_) {}
      }
      unlock(input);
      activate(input);
      return true;
    } catch (error) {
      scheduleClose(tx, 0);
      return false;
    }
  }

  function cancel() {
    if (disposed) return false;
    epoch += 1;
    if (cleanupCurrent) {
      const cleanup = cleanupCurrent;
      cleanupCurrent = null;
      cleanup();
    }
    active = false;
    safeLock();
    return true;
  }

  function disconnect() {
    if (disposed) return;
    cancel();
    disposed = true;
  }

  return {
    open,
    cancel,
    disconnect,
    get active() { return active && !disposed; },
    get disposed() { return disposed; },
  };
}

function defaultUnlock(input) {
  input.disabled = false;
  if (input.style) input.style.pointerEvents = 'auto';
}

function defaultLock(input) {
  input.disabled = true;
  if (input.style) input.style.pointerEvents = 'none';
}
