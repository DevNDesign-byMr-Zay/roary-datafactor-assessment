/**
 * Coordinate one native file-picker activation without re-locking the input
 * before the browser has had a chance to deliver its selection event.
 *
 * The input value is cleared first so choosing the same file again can still
 * produce a change event. A completed selection has priority over the window
 * focus event that commonly arrives as the native picker closes. When focus
 * returns without a selection, the delayed focus check restores the lock.
 */
export function activateFilePickerWithChangePriority({
  input,
  lock,
  activate = (element) => element.click(),
  focusTarget = globalThis.window,
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancelDelay = 250,
} = {}) {
  if (!input) throw new TypeError('input is required');
  if (typeof lock !== 'function') throw new TypeError('lock must be a function');
  if (typeof activate !== 'function') throw new TypeError('activate must be a function');
  if (!focusTarget || typeof focusTarget.addEventListener !== 'function') {
    throw new TypeError('focusTarget must support addEventListener');
  }
  if (typeof input.addEventListener !== 'function') {
    throw new TypeError('input must support addEventListener');
  }
  if (typeof schedule !== 'function') throw new TypeError('schedule must be a function');
  if (!Number.isFinite(cancelDelay) || cancelDelay < 0) {
    throw new RangeError('cancelDelay must be a non-negative finite number');
  }

  let picked = false;

  const relock = () => lock();
  const onPicked = () => {
    picked = true;
    schedule(relock, 0);
  };
  const onFocus = () => {
    schedule(() => {
      if (!picked) relock();
    }, cancelDelay);
  };

  // Reset before opening the picker so selecting the same file again is not
  // suppressed merely because the input already contains that path/value.
  try {
    input.value = '';
  } catch {
    // Some host objects can reject assignment; picker activation may still work.
  }

  input.disabled = false;
  if (input.style) input.style.pointerEvents = 'auto';

  input.addEventListener('change', onPicked, { once: true, capture: true });
  focusTarget.addEventListener('focus', onFocus, { once: true, capture: true });

  try {
    activate(input);
  } catch (error) {
    schedule(relock, 0);
    throw error;
  }

  return Object.freeze({
    wasPicked: () => picked,
  });
}
