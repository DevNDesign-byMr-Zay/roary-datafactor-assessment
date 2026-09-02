/* Aster JavaScript v571
Buyer-safe historical derivative: repair a JSON-array storage slot only when its persisted value is malformed or the wrong shape.
*/
function repairStoredJsonArray(key, { storage = localStorage, fallback = [] } = {}) {
  let valid = false;
  try {
    const raw = storage.getItem(key);
    if (raw == null) return { repaired: false, value: fallback.slice() };
    const parsed = JSON.parse(raw);
    valid = Array.isArray(parsed);
    if (valid) return { repaired: false, value: parsed };
  } catch {}
  const next = Array.isArray(fallback) ? fallback.slice() : [];
  try { storage.setItem(key, JSON.stringify(next)); } catch {}
  return { repaired: true, value: next };
}
