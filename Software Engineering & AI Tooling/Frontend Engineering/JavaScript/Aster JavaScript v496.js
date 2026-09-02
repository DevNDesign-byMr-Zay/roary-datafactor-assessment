/* Aster JavaScript v496
Authenticated historical derivative: request server-side image conversion from the locked local backend and return Blob + filename metadata.
*/
async function requestConvertedDownload(src, settings = {}, base = "http://127.0.0.1:5151") {
  const url = new URL(String(base));
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== "5151") throw new Error("Invalid local image-tool base");
  const payload = {
    src: String(src || ""),
    format: settings.format || "png",
    scale: Number(settings.scale || 100),
    quality: Number(settings.quality || 95),
    transparent: !!settings.transparent,
    compress: !!settings.compress,
    filename: settings.filename || "image_export"
  };
  const response = await fetch(`${url.protocol}//${url.host}/tool/download_convert`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Conversion failed (${response.status})`);
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  return { blob, disposition };
}
