export function chooseRestorableThreadSource(thread, fallback = '') {
  const latest = String(thread?.latestSource || '').trim();
  if (latest && !/^blob:/i.test(latest)) return latest;

  const images = Array.isArray(thread?.images) ? thread.images : [];
  for (let index = images.length - 1; index >= 0; index -= 1) {
    const source = String(images[index] || '').trim();
    if (source && !/^blob:/i.test(source)) return source;
  }

  return latest || String(fallback || '').trim();
}
