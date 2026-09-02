export function openThreadDatabase({
  indexedDBImpl = indexedDB,
  name = 'media_threads',
  version = 1,
} = {}) {
  return new Promise((resolve, reject) => {
    const request = indexedDBImpl.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('threads')) {
        db.createObjectStore('threads', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sourceMap')) {
        db.createObjectStore('sourceMap', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
