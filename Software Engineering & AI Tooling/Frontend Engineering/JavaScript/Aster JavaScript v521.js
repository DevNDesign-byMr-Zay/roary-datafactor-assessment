/* Aster JavaScript v521
Buyer-safe historical derivative: delete an IndexedDB media record by a secondary source index while preserving primary-key ownership.
*/
async function deleteIndexedRecordBySource(openDatabase, source, { storeName = "items", indexName = "src" } = {}) {
  const keySource = String(source || "").trim();
  if (!keySource) return false;
  try {
    const db = await openDatabase();
    return await new Promise(resolve => {
      try {
        const store = db.transaction(storeName, "readwrite").objectStore(storeName);
        const lookup = store.index(indexName).getKey(keySource);
        lookup.onsuccess = () => {
          if (lookup.result == null) return resolve(false);
          const removal = store.delete(lookup.result);
          removal.onsuccess = () => resolve(true);
          removal.onerror = () => resolve(false);
        };
        lookup.onerror = () => resolve(false);
      } catch { resolve(false); }
    });
  } catch { return false; }
}
