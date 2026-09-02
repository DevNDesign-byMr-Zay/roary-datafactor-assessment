export async function bindSourceToThread({
  source,
  threadId,
  canonicalize,
  persistMapping,
  loadThread,
  persistThread,
  blobToDataUrl,
}) {
  if (!source || !threadId) return false;

  const materialized = /^blob:/i.test(String(source)) && blobToDataUrl
    ? await blobToDataUrl(source)
    : String(source);

  if (!materialized) return false;

  const key = canonicalize(materialized);
  if (!key) return false;

  await persistMapping({ key, threadId });

  const thread = await loadThread(threadId);
  if (thread) {
    thread.images = Array.isArray(thread.images) ? thread.images : [];
    if (!thread.images.includes(materialized)) thread.images.push(materialized);
    await persistThread(thread);
  }

  return true;
}
