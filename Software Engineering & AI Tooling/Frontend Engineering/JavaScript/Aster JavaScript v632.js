/**
 * Aster JavaScript v632
 * Authoritative toggle-state rehydration for dynamic controls.
 *
 * Keeps selected state outside ephemeral DOM nodes, persists it through injected
 * load/save callbacks, and reapplies that state whenever controls are replaced.
 */
(function (global) {
  'use strict';

  function defaultApplyActive(control, active) {
    if (!control) return;
    control.setAttribute?.('aria-pressed', active ? 'true' : 'false');
  }

  function createAuthoritativeToggleRehydrator(options) {
    const opts = options || {};
    const items = Array.from(opts.items || []).map((item) => {
      if (!item || item.key == null || typeof item.resolve !== 'function') {
        throw new TypeError('each item requires key and resolve');
      }
      return { key: String(item.key), resolve: item.resolve };
    });

    const loadState = typeof opts.loadState === 'function' ? opts.loadState : (() => ({}));
    const saveState = typeof opts.saveState === 'function' ? opts.saveState : (() => {});
    const applyActive = typeof opts.applyActive === 'function' ? opts.applyActive : defaultApplyActive;
    const activationEvent = opts.activationEvent || 'click';
    const capture = opts.capture !== false;
    const bindActivation = opts.bindActivation !== false;
    const observeRoot = opts.observeRoot || null;
    const observeAttributes = opts.observeAttributes !== false;
    const observedAttributes = opts.observedAttributes || ['aria-pressed', 'class', 'data-active'];

    const knownKeys = new Set(items.map((item) => item.key));
    const currentControls = new Map();
    const bindings = new Map();
    let disposed = false;
    let queued = false;

    function normalize(raw) {
      const source = raw && typeof raw === 'object' ? raw : {};
      const next = {};
      items.forEach(({ key }) => { next[key] = !!source[key]; });
      return next;
    }

    let state = normalize(loadState());

    function snapshot() {
      return Object.assign({}, state);
    }

    function persist() {
      saveState(snapshot());
    }

    function unbind(key) {
      const record = bindings.get(key);
      if (!record) return;
      record.control.removeEventListener?.(activationEvent, record.handler, capture);
      bindings.delete(key);
    }

    function bind(key, control) {
      if (!bindActivation || !control || typeof control.addEventListener !== 'function') return;
      const existing = bindings.get(key);
      if (existing && existing.control === control) return;
      if (existing) unbind(key);

      const handler = () => {
        if (disposed) return;
        state[key] = !state[key];
        persist();
        scheduleReconcile();
      };
      control.addEventListener(activationEvent, handler, capture);
      bindings.set(key, { control, handler });
    }

    function reconcile() {
      if (disposed) return snapshot();

      items.forEach(({ key, resolve }) => {
        const nextControl = resolve() || null;
        const previous = currentControls.get(key) || null;

        if (previous !== nextControl) {
          unbind(key);
          if (nextControl) currentControls.set(key, nextControl);
          else currentControls.delete(key);
        }

        if (nextControl) {
          applyActive(nextControl, !!state[key], key);
          bind(key, nextControl);
        }
      });

      opts.onReconcile?.(snapshot(), new Map(currentControls));
      return snapshot();
    }

    function scheduleReconcile() {
      if (disposed || queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (!disposed) reconcile();
      });
    }

    function set(key, active) {
      key = String(key);
      if (!knownKeys.has(key)) throw new RangeError('unknown toggle key');
      const next = !!active;
      if (state[key] === next) return snapshot();
      state[key] = next;
      persist();
      reconcile();
      return snapshot();
    }

    function toggle(key) {
      key = String(key);
      if (!knownKeys.has(key)) throw new RangeError('unknown toggle key');
      return set(key, !state[key]);
    }

    function reload() {
      state = normalize(loadState());
      reconcile();
      return snapshot();
    }

    let observer = null;
    if (observeRoot && global.MutationObserver) {
      observer = new global.MutationObserver(scheduleReconcile);
      const observeOptions = { subtree: true, childList: true };
      if (observeAttributes) {
        observeOptions.attributes = true;
        observeOptions.attributeFilter = observedAttributes;
      }
      observer.observe(observeRoot, observeOptions);
    }

    reconcile();

    return {
      getState: snapshot,
      set,
      toggle,
      reload,
      reconcile,
      scheduleReconcile,
      dispose() {
        if (disposed) return;
        disposed = true;
        observer?.disconnect();
        Array.from(bindings.keys()).forEach(unbind);
        currentControls.clear();
      }
    };
  }

  const api = { createAuthoritativeToggleRehydrator, defaultApplyActive };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.AsterToggleRehydration = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
