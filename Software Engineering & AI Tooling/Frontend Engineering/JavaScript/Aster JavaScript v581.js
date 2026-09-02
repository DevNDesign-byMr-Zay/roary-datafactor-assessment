export async function deleteMediaBySource(db, source) {
  if (!db || !source) return false;

  return new Promise((resolve) => {
    const store = db.transaction('items', 'readwrite').objectStore('items');
    const lookup = store.index('source').get(source);

    lookup.onsuccess = () => {
      const item = lookup.result;
      if (!item?.id) return resolve(false);
      const request = store.delete(item.id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    };

    lookup.onerror = () => resolve(false);
  });
}
