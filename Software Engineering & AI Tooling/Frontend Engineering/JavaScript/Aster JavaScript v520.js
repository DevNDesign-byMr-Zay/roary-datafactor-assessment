/* Aster JavaScript v520
Buyer-safe historical derivative: normalize malformed persisted media sources without product- or provider-specific routing.
*/
function normalizeMediaSource(source, baseHref = (typeof location !== "undefined" ? location.href : undefined)) {
  try {
    if (source == null) return "";
    let value = String(source).trim();
    if (!value || value === "undefined" || value === "null") return "";
    if (/^file:/i.test(value)) {
      for (const marker of ["data:image", "blob:"]) {
        const index = value.indexOf(marker);
        if (index !== -1) return value.slice(index);
      }
      const encoded = value.indexOf("data%3Aimage");
      if (encoded !== -1) {
        const tail = value.slice(encoded);
        try { return decodeURIComponent(tail); }
        catch { return tail.replace(/^data%3A/i, "data:"); }
      }
    }
    const embedded = value.indexOf("data:image");
    if (embedded > 0 && !/^[a-z][a-z0-9+.-]*:/i.test(value)) value = value.slice(embedded);
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) || !baseHref) return value;
    try { return new URL(value, baseHref).href; }
    catch { return value; }
  } catch { return ""; }
}
