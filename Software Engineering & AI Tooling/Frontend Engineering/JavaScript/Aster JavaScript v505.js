/* Aster JavaScript v505
Authenticated historical derivative: append only signature-unique files and enrich image attachments with local Data-URL previews.
*/
async function appendUniqueAttachments(current, files, { readDataUrl, createId } = {}) {
  const next = Array.isArray(current) ? current.slice() : [];
  const signature = value => [value?.name || "", Number(value?.size) || 0, Number(value?.lastModified) || 0, value?.type || ""].join("|");
  const seen = new Set(next.map(signature));
  for (const file of Array.from(files || [])) {
    const sig = signature(file);
    if (seen.has(sig)) continue;
    seen.add(sig);
    const isImage = String(file.type || "").toLowerCase().startsWith("image/");
    const dataUrl = isImage && readDataUrl ? await readDataUrl(file) : "";
    next.push({
      id: createId ? createId(file) : `att_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`,
      name: file.name || "attachment",
      size: Number(file.size) || 0,
      type: file.type || "",
      lastModified: Number(file.lastModified) || 0,
      dataUrl: dataUrl || ""
    });
  }
  return next;
}
