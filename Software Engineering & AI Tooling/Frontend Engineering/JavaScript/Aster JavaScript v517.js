/* Aster JavaScript v517
Authenticated historical derivative: file-picker relock arbitration where a real change event wins and window-focus is only the cancellation fallback.
*/
function bindPickerRelock(input, openPicker, relock, { cancelDelayMs = 250 } = {}) {
  if (!input || typeof openPicker !== 'function' || typeof relock !== 'function') return () => {};
  let picked = false;
  const onPicked = () => {
    picked = true;
    setTimeout(relock, 0);
  };
  const onFocus = () => {
    setTimeout(() => { if (!picked) relock(); }, cancelDelayMs);
  };
  input.addEventListener('change', onPicked, { once: true, capture: true });
  window.addEventListener('focus', onFocus, { once: true, capture: true });
  try { openPicker(); }
  catch (error) { setTimeout(relock, 0); }
  return () => {
    input.removeEventListener('change', onPicked, true);
    window.removeEventListener('focus', onFocus, true);
  };
}
