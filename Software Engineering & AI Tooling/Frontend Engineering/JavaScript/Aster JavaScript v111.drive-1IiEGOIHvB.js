/** Aster JavaScript v111 — quota-aware localStorage saver with bounded retry. */
(function (global) {
  'use strict';
  function isQuotaError(error) {
    const s = String((error && (error.name || error.message)) || error || '').toLowerCase();
    return s.includes('quota') || s.includes('quotaexceeded') || s.includes('ns_error_dom_quota_reached');
  }
  function createQuotaAwareStorage(storage, options) {
    const o = options || {}, conversationKey = o.conversationKey || 'aster.conversations';
    const previousKey = o.previousKey || 'aster.conversations.prev', previousCap = Number(o.previousCap) || 4_000_000;
    function prune(value) {
      try {
        const arr = JSON.parse(String(value || '[]'));
        if (!Array.isArray(arr)) return String(value || '');
        return JSON.stringify(arr.slice(-24).map(t => ({ ...t, messages: (Array.isArray(t.messages) ? t.messages : []).slice(-48) })));
      } catch (_) { return String(value || ''); }
    }
    function setItem(key, value) {
      const text = String(value);
      if (key === conversationKey) {
        try { const prev = storage.getItem(key); if (prev) storage.setItem(previousKey, prev.length > previousCap ? prev.slice(0, previousCap) : prev); } catch (_) {}
      }
      try { storage.setItem(key, text); return true; }
      catch (e) {
        if (!isQuotaError(e)) throw e;
        if (key !== conversationKey) return false;
        try { storage.setItem(key, prune(text)); return true; } catch (_) { return false; }
      }
    }
    return { setItem, isQuotaError };
  }
  global.AsterQuotaStorage = { createQuotaAwareStorage, isQuotaError };
})(window);
