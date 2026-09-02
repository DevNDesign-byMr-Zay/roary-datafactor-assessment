/**
 * Aster JavaScript v631
 * Observed active-toggle chip mirror.
 *
 * Mirrors a set of stateful toggle controls into removable chips while preserving
 * the original controls as the source of truth. Re-syncs after toggle clicks and
 * attribute/class changes so out-of-band state updates are reflected in the chip UI.
 */
(function (global) {
  'use strict';

  function defaultIsActive(el) {
    if (!el) return false;
    const pressed = el.getAttribute && el.getAttribute('aria-pressed');
    if (pressed === 'true') return true;
    if (pressed === 'false') return false;
    return !!(el.classList && (el.classList.contains('active') || el.classList.contains('selected')));
  }

  function defaultKey(el, index) {
    return (el && (el.id || el.getAttribute?.('data-key'))) || String(index);
  }

  function defaultLabel(el, index) {
    return (el && (el.getAttribute?.('aria-label') || el.getAttribute?.('title') || el.textContent?.trim())) || `Item ${index + 1}`;
  }

  function createObservedToggleChipMirror(options) {
    const opts = options || {};
    const host = opts.host;
    const toggles = Array.from(opts.toggles || []).filter(Boolean);
    const isActive = opts.isActive || defaultIsActive;
    const getKey = opts.getKey || defaultKey;
    const getLabel = opts.getLabel || defaultLabel;
    const deactivate = opts.deactivate || ((el) => el.click?.());
    const chipClass = opts.chipClass || 'active-toggle-chip';
    const observedAttributes = opts.observedAttributes || ['aria-pressed', 'class'];

    if (!host) throw new TypeError('host is required');

    let disposed = false;
    let queued = false;
    const observers = [];
    const clickHandlers = [];

    function scheduleSync() {
      if (disposed || queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (!disposed) sync();
      });
    }

    function sync() {
      if (disposed) return [];
      host.replaceChildren();
      const active = [];

      toggles.forEach((toggle, index) => {
        if (!isActive(toggle, index)) return;
        const key = String(getKey(toggle, index));
        const label = String(getLabel(toggle, index));
        active.push({ key, label, toggle });

        const chip = host.ownerDocument.createElement('button');
        chip.type = 'button';
        chip.className = chipClass;
        chip.dataset.key = key;
        chip.textContent = label;
        chip.setAttribute('aria-label', `${label}. Remove selection.`);
        chip.addEventListener('click', (event) => {
          deactivate(toggle, event, index);
          scheduleSync();
        });
        host.appendChild(chip);
      });

      host.hidden = active.length === 0;
      return active;
    }

    toggles.forEach((toggle) => {
      const onClick = () => scheduleSync();
      toggle.addEventListener?.('click', onClick, true);
      clickHandlers.push([toggle, onClick]);

      if (global.MutationObserver) {
        const observer = new global.MutationObserver(scheduleSync);
        observer.observe(toggle, { attributes: true, attributeFilter: observedAttributes });
        observers.push(observer);
      }
    });

    sync();

    return {
      sync,
      scheduleSync,
      dispose() {
        if (disposed) return;
        disposed = true;
        observers.forEach((observer) => observer.disconnect());
        clickHandlers.forEach(([toggle, handler]) => toggle.removeEventListener?.('click', handler, true));
      }
    };
  }

  const api = { createObservedToggleChipMirror, defaultIsActive };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.AsterObservedToggleChipMirror = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
