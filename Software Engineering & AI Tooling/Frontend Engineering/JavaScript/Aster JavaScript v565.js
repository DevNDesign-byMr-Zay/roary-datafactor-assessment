/* Aster JavaScript v565
Buyer-safe historical derivative: memoize Blob-backed object URLs by record key and revoke the cache as one lifecycle unit.
*/
function createObjectUrlCache({ create = URL.createObjectURL, revoke = URL.revokeObjectURL } = {}) {
  const urls = new Map();
  return {
    get(key, blob) {
      if (key == null || !blob) return "";
      if (urls.has(key)) return urls.get(key);
      const href = create(blob);
      urls.set(key, href);
      return href;
    },
    revoke(key) {
      if (!urls.has(key)) return false;
      try { revoke(urls.get(key)); } catch {}
      urls.delete(key);
      return true;
    },
    clear() {
      for (const href of urls.values()) {
        try { revoke(href); } catch {}
      }
      urls.clear();
    },
    get size() { return urls.size; }
  };
}
