/** Aster JavaScript v109 — bounded sidebar memory projection without image-element readback. */
(function (global) {
  'use strict';
  function stripEmbeddedImages(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/gi, '[embedded-image]');
  }
  function sanitizeMessage(message) {
    if (!message || typeof message !== 'object') return message;
    const out = { ...message };
    for (const key of ['content', 'text', 'html']) if (typeof out[key] === 'string') out[key] = stripEmbeddedImages(out[key]);
    return out;
  }
  function pruneThreads(threads, options) {
    const o = options || {}, maxThreads = Math.max(1, Number(o.maxThreads) || 40), maxMessages = Math.max(1, Number(o.maxMessages) || 80);
    return (Array.isArray(threads) ? threads : []).slice(-maxThreads).map(thread => ({
      ...thread,
      messages: (Array.isArray(thread.messages) ? thread.messages : []).slice(-maxMessages).map(sanitizeMessage)
    }));
  }
  function projectSidebar(threads) {
    return pruneThreads(threads).map(thread => ({
      id: thread.id || null, title: thread.title || 'Untitled', updatedAt: thread.updatedAt || thread.ts || 0,
      media: (Array.isArray(thread.images) ? thread.images : []).filter(v => typeof v === 'string' && !/^blob:null/i.test(v)).slice(-12)
    }));
  }
  global.AsterSidebarMemory = { pruneThreads, projectSidebar, stripEmbeddedImages };
})(window);
