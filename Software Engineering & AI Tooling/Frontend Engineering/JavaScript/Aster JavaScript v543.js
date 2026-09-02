/* Aster JavaScript v543
Buyer-safe historical derivative: debounce image previews, abort superseded requests, cache resolved results, and reject stale completions.
*/
function createLatestPreviewController(runPreview, { delayMs = 280, cacheLimit = 24 } = {}) {
  let timer = null;
  let latestKey = "";
  let inflight = null;
  const cache = new Map();
  const trimCache = () => {
    while (cache.size > cacheLimit) cache.delete(cache.keys().next().value);
  };
  const schedule = (key, input) => {
    latestKey = String(key || "");
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const currentKey = latestKey;
      if (cache.has(currentKey)) return input?.onResult?.(cache.get(currentKey), { cached: true });
      try { inflight?.abort(); } catch {}
      const controller = new AbortController();
      inflight = controller;
      try {
        const result = await runPreview?.(input, { signal: controller.signal, key: currentKey });
        if (controller.signal.aborted || latestKey !== currentKey || result == null) return;
        cache.set(currentKey, result);
        trimCache();
        input?.onResult?.(result, { cached: false });
      } catch {}
    }, delayMs);
  };
  const cancel = () => { clearTimeout(timer); try { inflight?.abort(); } catch {} };
  return { schedule, cancel, cache };
}
