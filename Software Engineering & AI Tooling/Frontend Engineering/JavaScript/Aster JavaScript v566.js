/* Aster JavaScript v566
Buyer-safe historical derivative: serialize a compact thread/message fallback that preserves graph references without binary media payloads.
*/
function saveCompactThreadBackup(threads, { storage = localStorage, key = "thread-backup" } = {}) {
  try {
    const compact = Array.from(threads || [], thread => ({
      id: thread?.id,
      title: thread?.title,
      createdAt: thread?.createdAt,
      updatedAt: thread?.updatedAt,
      messages: Array.from(thread?.messages || [], message => ({
        id: message?.id,
        role: message?.role,
        content: message?.content,
        mediaIds: Array.isArray(message?.mediaIds) ? message.mediaIds.slice() : [],
        ts: message?.ts
      }))
    }));
    storage.setItem(key, JSON.stringify({ savedAt: Date.now(), threads: compact }));
    return compact.length;
  } catch {
    return 0;
  }
}
