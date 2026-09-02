/* Aster JavaScript v525
Buyer-safe historical derivative: stabilize transient media before passing it to a persistence function.
*/
function withStableMediaPersistence(persist, { findStableSource, blobToDataUrl } = {}) {
  if (typeof persist !== "function") throw new TypeError("persist must be a function");
  return async function persistStable(source, metadata) {
    let next = source;
    try {
      if (/^blob:/i.test(String(next || ""))) {
        const alternate = await findStableSource?.(next);
        if (alternate && !/^blob:/i.test(String(alternate))) next = alternate;
        else {
          const dataUrl = await blobToDataUrl?.(next);
          if (/^data:image\//i.test(String(dataUrl || ""))) next = dataUrl;
        }
      }
    } catch {}
    return persist.call(this, next, metadata);
  };
}
