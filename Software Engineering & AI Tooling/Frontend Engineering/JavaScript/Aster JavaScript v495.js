/* Aster JavaScript v495
Authenticated historical derivative: extract UTF-8 or quoted filenames from Content-Disposition headers.
*/
function filenameFromContentDisposition(disposition) {
  try {
    if (!disposition) return "";
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(String(disposition));
    const raw = match?.[1] || match?.[2] || "";
    return raw ? decodeURIComponent(raw.trim()) : "";
  } catch {
    return "";
  }
}
