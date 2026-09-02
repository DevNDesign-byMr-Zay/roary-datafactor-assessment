export async function upsertMediaBySource(db, source, item) {
  if (!db || !source) return null;
  return new Promise((resolve) => {
    const store = db.transaction('items', 'readwrite').objectStore('items');
    const lookup = store.index('source').get(source);

    lookup.onsuccess = () => {
      const previous = lookup.result || {};
      const id = previous.id || item.id;
      const merged = { ...previous, ...item, id, source };

      if (previous.prompt && !String(merged.prompt || '').trim()) {
        merged.prompt = previous.prompt;
      }
      if (previous.title && !String(merged.title || '').trim()) {
        merged.title = previous.title;
      }

      const request = store.put(merged);
      request.onsuccess = () => resolve(id);
      request.onerror = () => resolve(null);
    };

    lookup.onerror = () => {
      const request = store.put({ ...item, source });
      request.onsuccess = () => resolve(item.id ?? null);
      request.onerror = () => resolve(null);
    };
  });
}
