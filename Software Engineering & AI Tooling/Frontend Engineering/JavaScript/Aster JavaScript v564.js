/* Aster JavaScript v564
Buyer-safe historical derivative: create a fresh abort scope for each long-running image operation so stale external controllers cannot instantly cancel a new execution.
*/
function createExecutionAbortScope({ timeoutMs = 240000 } = {}) {
  const controller = new AbortController();
  const delay = Math.max(1000, Number(timeoutMs) || 240000);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    try { controller.abort(new DOMException("Operation timed out", "TimeoutError")); }
    catch (_) { controller.abort(); }
  }, delay);
  return {
    signal: controller.signal,
    abort: reason => controller.abort(reason),
    get timedOut() { return timedOut; },
    dispose() { clearTimeout(timer); },
  };
}
