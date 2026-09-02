/**
 * Aster JavaScript v638
 * Adaptive duration progress controller.
 *
 * Provides a reusable progress estimator for asynchronous work whose exact
 * completion percentage is unknown. Per-key duration estimates are learned
 * with an exponential moving average, progress is animated below a configurable
 * completion ceiling, and long-running tasks stretch their estimate instead of
 * appearing frozen near completion.
 */

export function createAdaptiveDurationProgressController({
  defaults = {},
  fallbackDurationMs = 4200,
  alpha = 0.22,
  minDurationMs = 250,
  maxDurationMs = 60000,
  progressCeiling = 0.96,
  initialProgress = 0.02,
  loadEstimates = () => ({}),
  saveEstimates = () => {},
  now = () => globalThis.performance?.now?.() ?? Date.now(),
  requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
  onProgress = () => {},
  onState = () => {},
} = {}) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) {
    throw new TypeError('defaults must be an object');
  }
  if (typeof loadEstimates !== 'function' || typeof saveEstimates !== 'function') {
    throw new TypeError('estimate persistence hooks must be functions');
  }
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (typeof requestFrame !== 'function' || typeof cancelFrame !== 'function') {
    throw new TypeError('animation-frame scheduling functions are required');
  }
  if (typeof onProgress !== 'function' || typeof onState !== 'function') {
    throw new TypeError('progress/state hooks must be functions');
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const smoothing = clamp(finite(alpha, 0.22), 0, 1);
  const minDuration = Math.max(1, finite(minDurationMs, 250));
  const maxDuration = Math.max(minDuration, finite(maxDurationMs, 60000));
  const fallbackDuration = clamp(finite(fallbackDurationMs, 4200), minDuration, maxDuration);
  const ceiling = clamp(finite(progressCeiling, 0.96), 0.05, 0.999);
  const initial = clamp(finite(initialProgress, 0.02), 0, ceiling);

  const estimates = Object.create(null);
  let disconnected = false;

  function sanitizeEstimate(value) {
    const n = finite(value, NaN);
    return Number.isFinite(n) && n >= minDuration ? clamp(n, minDuration, maxDuration) : null;
  }

  try {
    const loaded = loadEstimates() || {};
    if (loaded && typeof loaded === 'object') {
      for (const [key, value] of Object.entries(loaded)) {
        const clean = sanitizeEstimate(value);
        if (clean != null) estimates[key] = clean;
      }
    }
  } catch {}

  function defaultFor(key) {
    const direct = sanitizeEstimate(defaults[key]);
    return direct == null ? fallbackDuration : direct;
  }

  function getExpected(key) {
    const id = String(key ?? 'task');
    return estimates[id] ?? defaultFor(id);
  }

  function persist() {
    try { saveEstimates({ ...estimates }); } catch {}
  }

  function recordSample(key, sampleMs) {
    const id = String(key ?? 'task');
    const sample = sanitizeEstimate(sampleMs);
    if (sample == null) return getExpected(id);
    const previous = getExpected(id);
    const next = clamp(previous * (1 - smoothing) + sample * smoothing, minDuration, maxDuration);
    estimates[id] = next;
    persist();
    return next;
  }

  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function emitProgress(handle, value) {
    const progress = clamp(finite(value, 0), 0, 1);
    handle.progress = progress;
    onProgress(progress, handle);
    return progress;
  }

  function emitState(handle, state, detail = {}) {
    handle.state = state;
    onState(state, handle, detail);
  }

  function stopFrame(handle) {
    if (!handle?.frame) return;
    try { cancelFrame(handle.frame); } catch {}
    handle.frame = 0;
  }

  function scheduleTick(handle) {
    if (!handle.active || disconnected) return;
    handle.frame = requestFrame(() => {
      handle.frame = 0;
      if (!handle.active || disconnected) return;

      const elapsed = Math.max(0, finite(now(), handle.startedAt) - handle.startedAt);
      if (elapsed > handle.expectedMs * 0.98) {
        handle.expectedMs = clamp((elapsed / 0.98) * 1.15, minDuration, maxDuration);
      }

      const raw = clamp(elapsed / Math.max(1, handle.expectedMs), 0, ceiling);
      const eased = Math.max(handle.progress, smoothstep(raw));
      emitProgress(handle, Math.min(ceiling, eased));
      scheduleTick(handle);
    });
  }

  function start(key, meta = {}) {
    if (disconnected) throw new Error('controller is disconnected');
    const id = String(key ?? 'task');
    const startedAt = finite(now(), 0);
    const handle = {
      key: id,
      meta,
      startedAt,
      expectedMs: getExpected(id),
      progress: 0,
      state: 'idle',
      active: true,
      frame: 0,
      sampled: false,
    };

    emitState(handle, 'running');
    emitProgress(handle, initial);
    scheduleTick(handle);
    return handle;
  }

  function finish(handle, { ok = true, learn = true, detail = {} } = {}) {
    if (!handle || !handle.active) return handle || null;
    handle.active = false;
    stopFrame(handle);

    const elapsedMs = Math.max(0, finite(now(), handle.startedAt) - handle.startedAt);
    handle.elapsedMs = elapsedMs;
    if (learn && !handle.sampled) {
      recordSample(handle.key, elapsedMs);
      handle.sampled = true;
    }

    emitProgress(handle, 1);
    emitState(handle, ok ? 'done' : 'failed', { ...detail, elapsedMs });
    return handle;
  }

  function cancel(handle, detail = {}) {
    if (!handle || !handle.active) return handle || null;
    handle.active = false;
    stopFrame(handle);
    const elapsedMs = Math.max(0, finite(now(), handle.startedAt) - handle.startedAt);
    handle.elapsedMs = elapsedMs;
    emitState(handle, 'cancelled', { ...detail, elapsedMs });
    return handle;
  }

  async function run(key, fn, options = {}) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    const handle = start(key, options.meta);
    try {
      const value = await fn(handle);
      finish(handle, { ok: true, learn: options.learn !== false });
      return value;
    } catch (error) {
      finish(handle, {
        ok: false,
        learn: options.learn !== false,
        detail: { error },
      });
      throw error;
    }
  }

  function getEstimates() {
    return Object.freeze({ ...estimates });
  }

  function disconnect() {
    disconnected = true;
  }

  return Object.freeze({
    start,
    finish,
    cancel,
    run,
    getExpected,
    recordSample,
    getEstimates,
    disconnect,
  });
}
