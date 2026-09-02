export async function listRecentMedia(db, limit = 60) {
  if (!db) return [];

  return new Promise((resolve) => {
    const output = [];
    const store = db.transaction('items', 'readonly').objectStore('items');
    const cursor = store.index('timestamp').openCursor(null, 'prev');

    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current || output.length >= limit) return resolve(output);
      output.push(current.value);
      current.continue();
    };

    cursor.onerror = () => resolve(output);
  });
}
