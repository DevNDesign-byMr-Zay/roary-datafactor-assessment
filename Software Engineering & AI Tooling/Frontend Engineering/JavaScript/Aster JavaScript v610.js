/**
 * Latest-wins scheduler for continuous preview controls.
 * It throttles launches, allows only one request in flight, rejects stale
 * results, and immediately runs the newest state after an in-flight change.
 */
export function createLatestPreviewScheduler({
  getSignature,
  generate,
  apply,
  throttleMs = 100,
  onBusy = () => {},
  onError = () => {},
  now = () => Date.now(),
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
} = {}) {
  if (typeof getSignature !== 'function') throw new TypeError('getSignature is required.');
  if (typeof generate !== 'function') throw new TypeError('generate is required.');
  if (typeof apply !== 'function') throw new TypeError('apply is required.');

  let wanted = '';
  let inFlight = false;
  let pending = false;
  let stopped = false;
  let lastStart = -Infinity;
  let timer = null;

  const normalizedThrottle = Math.max(0, Number(throttleMs) || 0);

  async function launch() {
    timer = null;
    if (stopped || inFlight || !pending) return;

    const wait = Math.max(0, normalizedThrottle - (now() - lastStart));
    if (wait > 0) {
      timer = setTimer(launch, wait);
      return;
    }

    pending = false;
    inFlight = true;
    lastStart = now();
    const signature = wanted;
    onBusy(true);

    try {
      const result = await generate(signature);
      const current = String(getSignature());
      if (!stopped && signature === wanted && signature === current) {
        await apply(result, signature);
      }
    } catch (error) {
      if (!stopped) onError(error);
    } finally {
      inFlight = false;
      const current = String(getSignature());
      if (!stopped && (pending || current !== signature || wanted !== signature)) {
        wanted = current;
        pending = true;
        launch();
      } else {
        onBusy(false);
      }
    }
  }

  return {
    request() {
      if (stopped) return;
      wanted = String(getSignature());
      pending = true;
      launch();
    },

    stop() {
      stopped = true;
      pending = false;
      if (timer !== null) clearTimer(timer);
      timer = null;
      onBusy(false);
    },

    get inFlight() {
      return inFlight;
    },

    get wantedSignature() {
      return wanted;
    },
  };
}
