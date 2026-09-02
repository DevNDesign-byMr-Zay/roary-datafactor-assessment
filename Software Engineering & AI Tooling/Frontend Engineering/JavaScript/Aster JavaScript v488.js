/* Aster JavaScript v488
Authenticated historical derivative: remove unrecoverable blob URLs persisted from a previous file-origin session.
*/
function purgeStaleBlobImages(root = document) {
  const origin = String(location.origin || "");
  const stale = src => /^blob:null\//i.test(src) || (/^blob:/i.test(src) && origin === "null");
  let removed = 0;
  root.querySelectorAll("img").forEach(image => {
    const src = image.currentSrc || image.src || "";
    if (src && stale(src)) {
      image.removeAttribute("src");
      removed += 1;
    }
  });
  return removed;
}
