/** Aster JavaScript v110 — defensive JSON/thread rescue for corrupted or quota-truncated state. */
(function (global) {
  'use strict';
  function safeParse(text, fallback) {
    try { return JSON.parse(text); } catch (_) {}
    const s = String(text || '');
    for (const pair of [['[', ']'], ['{', '}']]) {
      const a = s.indexOf(pair[0]), b = s.lastIndexOf(pair[1]);
      if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (_) {} }
    }
    return fallback;
  }
  function rescueConversationState(rawThreads, rawActiveId) {
    let threads = Array.isArray(rawThreads) ? rawThreads : safeParse(rawThreads, []);
    if (!Array.isArray(threads)) threads = [];
    threads = threads.filter(v => v && typeof v === 'object').slice(-50);
    const ids = new Set(threads.map(t => String(t.id || '')).filter(Boolean));
    let activeId = String(rawActiveId || '');
    if (!ids.has(activeId)) activeId = threads.length ? String(threads[threads.length - 1].id || '') : '';
    return { threads, activeId };
  }
  function shrinkForQuota(threads, maxThreads, maxMessages) {
    return (Array.isArray(threads) ? threads : []).slice(-(maxThreads || 24)).map(t => ({
      ...t, messages: (Array.isArray(t.messages) ? t.messages : []).slice(-(maxMessages || 48))
    }));
  }
  global.AsterStateRescue = { safeParse, rescueConversationState, shrinkForQuota };
})(window);
