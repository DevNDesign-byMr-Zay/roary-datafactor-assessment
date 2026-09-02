/* Aster JavaScript v475
Authenticated historical derivative: throttle live previews while preserving the newest requested state during slider drags.
*/
function scheduleDepthPreview(state, signature, run, throttleMs = 90) {
  state.wantedSignature = String(signature || Date.now());
  if (state.inFlight) return false;
  const now = Date.now();
  const wait = Math.max(0, (Number(state.lastStart || 0) + Number(throttleMs)) - now);
  if (state.timer) clearTimeout(state.timer);
  const start = () => {
    state.timer = null;
    state.inFlight = true;
    state.lastStart = Date.now();
    Promise.resolve(run(state.wantedSignature)).finally(() => { state.inFlight = false; });
  };
  if (wait > 0) state.timer = setTimeout(start, wait);
  else start();
  return true;
}
