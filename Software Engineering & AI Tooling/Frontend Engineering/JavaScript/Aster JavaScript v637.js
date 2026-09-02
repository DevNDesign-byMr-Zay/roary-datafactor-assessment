/**
 * Aster JavaScript v637
 * Interpolated filter preview controller.
 *
 * Provides a reusable live-preview primitive for an existing visual element.
 * A selected profile is blended from neutral values according to a normalized
 * intensity, applied at most once per animation frame, and restored safely
 * whenever preview mode becomes inactive or the controller disconnects.
 */

export function createInterpolatedFilterPreviewController({
  getTarget,
  isActive = () => true,
  getProfile,
  getIntensity = () => 1,
  maxIntensity = 1,
  profiles = {},
  fallbackProfile = null,
  transitionMs = 90,
  requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
} = {}) {
  if (typeof getTarget !== 'function') throw new TypeError('getTarget must be a function');
  if (typeof isActive !== 'function') throw new TypeError('isActive must be a function');
  if (typeof getProfile !== 'function') throw new TypeError('getProfile must be a function');
  if (typeof getIntensity !== 'function') throw new TypeError('getIntensity must be a function');
  if (!(Number(maxIntensity) > 0)) throw new TypeError('maxIntensity must be greater than zero');
  if (typeof requestFrame !== 'function' || typeof cancelFrame !== 'function') {
    throw new TypeError('animation-frame scheduling functions are required');
  }

  const neutral = Object.freeze({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    sepia: 0,
    hue: 0,
  });

  const cleanups = new Set();
  const originals = new WeakMap();
  let frame = 0;
  let currentTarget = null;
  let disconnected = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function normalizeProfile(value) {
    if (Array.isArray(value)) {
      return {
        brightness: finite(value[0], neutral.brightness),
        contrast: finite(value[1], neutral.contrast),
        saturation: finite(value[2], neutral.saturation),
        sepia: finite(value[3], neutral.sepia),
        hue: finite(value[4], neutral.hue),
      };
    }
    const source = value && typeof value === 'object' ? value : {};
    return {
      brightness: finite(source.brightness, neutral.brightness),
      contrast: finite(source.contrast, neutral.contrast),
      saturation: finite(source.saturation, neutral.saturation),
      sepia: finite(source.sepia, neutral.sepia),
      hue: finite(source.hue, neutral.hue),
    };
  }

  function resolveProfile() {
    const key = getProfile();
    const direct = profiles[key];
    if (direct != null) return normalizeProfile(direct);
    if (fallbackProfile != null && profiles[fallbackProfile] != null) {
      return normalizeProfile(profiles[fallbackProfile]);
    }
    return normalizeProfile(null);
  }

  function remember(target) {
    if (!target || originals.has(target)) return;
    originals.set(target, {
      filter: target.style?.filter ?? '',
      transition: target.style?.transition ?? '',
    });
  }

  function restore(target) {
    if (!target) return;
    const original = originals.get(target);
    if (!original) return;
    if (target.style) {
      target.style.filter = original.filter;
      target.style.transition = original.transition;
    }
    originals.delete(target);
  }

  function blend(from, to, amount) {
    return from + (to - from) * amount;
  }

  function buildFilter(profile, amount) {
    const brightness = blend(neutral.brightness, profile.brightness, amount);
    const contrast = blend(neutral.contrast, profile.contrast, amount);
    const saturation = blend(neutral.saturation, profile.saturation, amount);
    const sepia = clamp(blend(neutral.sepia, profile.sepia, amount), 0, 1);
    const hue = blend(neutral.hue, profile.hue, amount);

    return [
      `brightness(${brightness.toFixed(3)})`,
      `contrast(${contrast.toFixed(3)})`,
      `saturate(${saturation.toFixed(3)})`,
      `sepia(${sepia.toFixed(3)})`,
      `hue-rotate(${hue.toFixed(1)}deg)`,
    ].join(' ');
  }

  function applyNow() {
    if (disconnected) return false;
    const target = getTarget() || null;

    if (currentTarget && currentTarget !== target) restore(currentTarget);
    currentTarget = target;
    if (!target) return false;

    if (!isActive()) {
      restore(target);
      return false;
    }

    remember(target);
    const profile = resolveProfile();
    const amount = clamp(finite(getIntensity(), 0) / Number(maxIntensity), 0, 1);

    if (target.style) {
      target.style.transition = `filter ${Math.max(0, finite(transitionMs, 0))}ms linear`;
      target.style.filter = buildFilter(profile, amount);
    }
    return true;
  }

  function schedule() {
    if (disconnected) return;
    if (frame) cancelFrame(frame);
    frame = requestFrame(() => {
      frame = 0;
      applyNow();
    });
  }

  function bind(target, eventName, options) {
    if (!target?.addEventListener || !target?.removeEventListener) {
      throw new TypeError('bind target must support addEventListener/removeEventListener');
    }
    target.addEventListener(eventName, schedule, options);
    const cleanup = () => target.removeEventListener(eventName, schedule, options);
    cleanups.add(cleanup);
    return () => {
      cleanup();
      cleanups.delete(cleanup);
    };
  }

  function observe(target, options = { attributes: true, childList: true, subtree: true }) {
    const Observer = globalThis.MutationObserver;
    if (typeof Observer !== 'function') return () => {};
    if (!target) throw new TypeError('observe target is required');
    const observer = new Observer(schedule);
    observer.observe(target, options);
    const cleanup = () => observer.disconnect();
    cleanups.add(cleanup);
    return () => {
      cleanup();
      cleanups.delete(cleanup);
    };
  }

  function refresh() {
    schedule();
  }

  function disconnect() {
    if (disconnected) return;
    disconnected = true;
    if (frame) {
      cancelFrame(frame);
      frame = 0;
    }
    for (const cleanup of [...cleanups]) {
      try { cleanup(); } catch {}
    }
    cleanups.clear();
    restore(currentTarget);
    currentTarget = null;
  }

  return Object.freeze({
    applyNow,
    schedule,
    refresh,
    bind,
    observe,
    disconnect,
  });
}
