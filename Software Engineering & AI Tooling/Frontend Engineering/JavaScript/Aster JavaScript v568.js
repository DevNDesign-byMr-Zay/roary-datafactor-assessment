/* Aster JavaScript v568
Buyer-safe historical derivative: cache an IndexedDB open promise while surfacing blocked upgrades as a recoverable failure.
*/
function createCachedDatabaseOpener({ indexedDBImpl = indexedDB, name, version, upgrade } = {}) {
  let pending = null;
  return function openDatabase() {
    if (pending) return pending;
    pending = new Promise((resolve, reject) => {
      let request;
      try { request = indexedDBImpl.open(name, version); }
      catch (error) { pending = null; reject(error); return; }
      request.onupgradeneeded = event => {
        try { upgrade?.(request.result, event.oldVersion, event.newVersion); }
        catch (error) { try { request.transaction?.abort(); } catch {} }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { pending = null; reject(request.error || new Error("database open failed")); };
      request.onblocked = () => { pending = null; reject(new Error("database open blocked")); };
    });
    return pending;
  };
}
