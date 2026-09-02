/* Aster JavaScript v570
Buyer-safe historical derivative: close a cached IndexedDB connection before deletion and settle even when deletion is blocked.
*/
async function resetIndexedDatabase({ open, indexedDBImpl = indexedDB, name, clearCachedOpen } = {}) {
  try {
    const db = await Promise.resolve(open?.()).catch(() => null);
    try { db?.close?.(); } catch {}
  } catch {}
  try { clearCachedOpen?.(); } catch {}
  return await new Promise(resolve => {
    let request;
    try { request = indexedDBImpl.deleteDatabase(name); }
    catch { resolve(false); return; }
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
    request.onblocked = () => resolve(false);
  });
}
