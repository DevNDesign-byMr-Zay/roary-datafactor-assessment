export function clampProgressPercent(value) {
  const number = Math.floor(Number(value) || 0);
  return Math.max(0, Math.min(100, number));
}

export function nextOptimisticProgress(current, cap = 92) {
  const value = Number(current) || 0;
  if (value >= cap) return Math.min(value, cap);
  const step = value < 35 ? 2 : value < 70 ? 1 : 0.5;
  return Math.min(cap, value + step);
}

export function normalizeProgressState(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const percent = Number(payload.percent);
  if (!Number.isFinite(percent)) return null;
  return {
    percent: clampProgressPercent(percent),
    status: String(payload.status || '').toLowerCase(),
  };
}

export function createHybridProgressController({
  onProgress,
  poll,
  optimisticCap = 92,
  optimisticIntervalMs = 180,
  pollIntervalMs = 220,
} = {}) {
  if (typeof onProgress !== 'function') {
    throw new TypeError('onProgress must be a function.');
  }
  if (typeof poll !== 'function') {
    throw new TypeError('poll must be a function.');
  }

  let optimistic = 1;
  let optimisticTimer = null;
  let pollTimer = null;

  const emit = (value) => onProgress(clampProgressPercent(value));

  function stop() {
    if (optimisticTimer !== null) clearInterval(optimisticTimer);
    if (pollTimer !== null) clearInterval(pollTimer);
    optimisticTimer = null;
    pollTimer = null;
  }

  function start() {
    stop();
    optimistic = 1;
    emit(optimistic);

    optimisticTimer = setInterval(() => {
      optimistic = nextOptimisticProgress(optimistic, optimisticCap);
      emit(optimistic);
    }, optimisticIntervalMs);

    pollTimer = setInterval(async () => {
      try {
        const state = normalizeProgressState(await poll());
        if (!state) return;
        emit(state.percent);
        if (state.status === 'done' || state.status === 'error') stop();
      } catch {
        // Optimistic progress remains active when polling is temporarily unavailable.
      }
    }, pollIntervalMs);
  }

  function complete() {
    stop();
    emit(100);
  }

  return { start, stop, complete };
}
