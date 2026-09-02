/** Aster JavaScript v106 — lightweight session-state synchronization and unload persistence. */
(function (global) {
  'use strict';
  function createSessionSync(options) {
    const opts = options || {};
    const intervalMs = Math.max(250, Number(opts.intervalMs) || 700);
    let timer = null;
    function sync() {
      try {
        if (typeof opts.getActiveId === 'function') global.__asterActiveConversationId = opts.getActiveId() || null;
        if (typeof opts.getActiveConversation === 'function') global.__asterActiveConversation = opts.getActiveConversation() || null;
      } catch (_) {}
    }
    function persist() {
      try { if (typeof opts.saveConversations === 'function') opts.saveConversations(); } catch (_) {}
      try { if (typeof opts.saveMedia === 'function') opts.saveMedia(); } catch (_) {}
    }
    function start() {
      if (timer) return;
      sync(); timer = setInterval(sync, intervalMs);
      global.addEventListener('beforeunload', persist, { capture: true });
    }
    function stop() {
      if (timer) clearInterval(timer); timer = null;
      global.removeEventListener('beforeunload', persist, { capture: true });
    }
    return { start, stop, sync, persist };
  }
  global.AsterSessionSync = { createSessionSync };
})(window);
