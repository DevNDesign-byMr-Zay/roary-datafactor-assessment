/** Aster JavaScript v108 — IndexedDB conversation persistence with non-destructive recovery. */
(function (global) {
  'use strict';
  function createConversationStore(options) {
    const o = options || {}, dbName = o.dbName || 'aster_conversations_v1', storeName = o.storeName || 'state';
    let dbPromise;
    function db() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(storeName)) req.result.createObjectStore(storeName); };
        req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
      });
      return dbPromise;
    }
    async function put(key, value) {
      const d = await db();
      return new Promise((resolve, reject) => {
        const tx = d.transaction(storeName, 'readwrite'); tx.objectStore(storeName).put(value, key);
        tx.oncomplete = () => resolve(true); tx.onerror = () => reject(tx.error);
      });
    }
    async function get(key, fallback) {
      try {
        const d = await db();
        return await new Promise((resolve) => {
          const req = d.transaction(storeName, 'readonly').objectStore(storeName).get(key);
          req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result); req.onerror = () => resolve(fallback);
        });
      } catch (_) { return fallback; }
    }
    async function recover(key, primaryValue, validator) {
      const valid = typeof validator === 'function' ? validator : v => v != null;
      if (valid(primaryValue)) { try { await put(key, primaryValue); } catch (_) {} return primaryValue; }
      const stored = await get(key, null);
      return valid(stored) ? stored : primaryValue;
    }
    return { put, get, recover };
  }
  global.AsterConversationStore = { createConversationStore };
})(window);
