export function openMediaDatabase({
  indexedDBImpl = indexedDB,
  name = 'media_library',
  version = 1,
} = {}) {
  return new Promise((resolve, reject) => {
    const request = indexedDBImpl.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      let store;
      if (db.objectStoreNames.contains('items')) {
        store = request.transaction.objectStore('items');
      } else {
        store = db.createObjectStore('items', { keyPath: 'id' });
      }
      if (!store.indexNames.contains('timestamp')) {
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!store.indexNames.contains('source')) {
        store.createIndex('source', 'source', { unique: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
