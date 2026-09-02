/**
 * Aster JavaScript v633
 * Cancellable bounded progressive-stream controller.
 *
 * Provider-neutral primitive for progressively revealing text while keeping
 * recent rendered history bounded in the DOM. Active timers are owned by the
 * controller rather than stored on source elements, so replacement/cancel
 * behavior is explicit and testable.
 */

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createBoundedProgressStream(options = {}) {
  const {
    maxTrailItems = 4,
    defaultCps = 46,
    minStepMs = 10,
    maxStepMs = 34,
    setIntervalFn = globalThis.setInterval?.bind(globalThis),
    clearIntervalFn = globalThis.clearInterval?.bind(globalThis),
  } = options;

  if (!Number.isInteger(maxTrailItems) || maxTrailItems < 1) {
    throw new TypeError('maxTrailItems must be a positive integer');
  }
  if (!(Number.isFinite(defaultCps) && defaultCps > 0)) {
    throw new TypeError('defaultCps must be greater than zero');
  }
  if (!(Number.isFinite(minStepMs) && Number.isFinite(maxStepMs) && minStepMs > 0 && maxStepMs >= minStepMs)) {
    throw new TypeError('step bounds are invalid');
  }
  if (typeof setIntervalFn !== 'function' || typeof clearIntervalFn !== 'function') {
    throw new TypeError('interval scheduler functions are required');
  }

  const activeTimers = new Map();

  function cancel(element) {
    if (!element || !activeTimers.has(element)) return false;
    clearIntervalFn(activeTimers.get(element));
    activeTimers.delete(element);
    return true;
  }

  function renderText({
    element,
    text,
    cps = defaultCps,
    isAlive = () => true,
    onDone,
  } = {}) {
    if (!element) {
      if (typeof onDone === 'function') onDone();
      return null;
    }

    cancel(element);

    const fullText = String(text ?? '');
    element.textContent = '';
    if (!fullText) {
      if (typeof onDone === 'function') onDone();
      return null;
    }

    const rate = Number.isFinite(cps) && cps > 0 ? cps : defaultCps;
    const stepMs = clampNumber(1000 / rate, minStepMs, maxStepMs);
    let index = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancel(element);
      if (typeof onDone === 'function') onDone();
    };

    const timer = setIntervalFn(() => {
      if (typeof isAlive === 'function' && !isAlive()) {
        cancel(element);
        return;
      }

      index += 1;
      element.textContent = fullText.slice(0, index);
      if (index >= fullText.length) finish();
    }, stepMs);

    activeTimers.set(element, timer);
    return { timer, stepMs };
  }

  function pushTrail(container, node) {
    if (!container || !node || typeof container.appendChild !== 'function') {
      return 0;
    }

    container.appendChild(node);
    let removed = 0;

    const childCount = () => {
      if (container.children && Number.isFinite(container.children.length)) {
        return container.children.length;
      }
      if (container.childNodes && Number.isFinite(container.childNodes.length)) {
        return container.childNodes.length;
      }
      return 0;
    };

    while (childCount() > maxTrailItems) {
      const oldest = container.firstElementChild || container.firstChild;
      if (!oldest) break;
      if (typeof oldest.remove === 'function') oldest.remove();
      else if (typeof container.removeChild === 'function') container.removeChild(oldest);
      else break;
      removed += 1;
    }

    return removed;
  }

  function disconnect() {
    for (const timer of activeTimers.values()) clearIntervalFn(timer);
    activeTimers.clear();
  }

  function activeCount() {
    return activeTimers.size;
  }

  return Object.freeze({
    cancel,
    renderText,
    pushTrail,
    disconnect,
    activeCount,
    maxTrailItems,
  });
}
