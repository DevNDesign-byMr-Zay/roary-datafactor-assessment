/* Aster JavaScript v569
Buyer-safe historical derivative: wrap an IndexedDB transaction so operation setup and transaction failures reject consistently.
*/
async function runDatabaseTransaction(db, storeName, mode, operation) {
  if (!db || typeof db.transaction !== "function") throw new TypeError("database required");
  return await new Promise((resolve, reject) => {
    let transaction;
    try { transaction = db.transaction(storeName, mode); }
    catch (error) { reject(error); return; }
    const store = transaction.objectStore(storeName);
    let result;
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error("database transaction failed"));
    transaction.onabort = () => reject(transaction.error || new Error("database transaction aborted"));
    try { result = operation?.(store, transaction); }
    catch (error) {
      try { transaction.abort(); } catch {}
      reject(error);
    }
  });
}
