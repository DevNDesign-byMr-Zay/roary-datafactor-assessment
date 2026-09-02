/* Aster JavaScript v573
Buyer-safe historical derivative: mirror serialized application state to primary, backup, and best-effort durable storage tiers.
*/
function persistStateAcrossTiers(value, { storage = localStorage, primaryKey = "state", backupKey = "state.backup", durableSet } = {}) {
  let serialized;
  try { serialized = JSON.stringify(value); }
  catch { return false; }

  let primarySaved = false;
  try { storage.setItem(primaryKey, serialized); primarySaved = true; } catch {}
  try { storage.setItem(backupKey, serialized); } catch {}
  try { Promise.resolve(durableSet?.(primaryKey, serialized)).catch(() => {}); } catch {}
  return primarySaved;
}
