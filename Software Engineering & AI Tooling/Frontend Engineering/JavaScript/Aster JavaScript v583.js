export async function recoverMediaFromThreads({
  existingItems = [],
  threads = [],
  addMedia,
  recovered = false,
} = {}) {
  if (existingItems.length || recovered || typeof addMedia !== 'function') {
    return { recovered: 0, skipped: true };
  }

  let count = 0;
  const seen = new Set();

  for (const thread of threads) {
    const threadId = thread?.id ?? null;
    const sources = [
      ...(Array.isArray(thread?.images) ? thread.images : []),
      thread?.latestSource,
    ].filter(Boolean);

    for (const source of sources) {
      const key = String(source).trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      await addMedia(key, {
        threadId,
        timestamp: thread?.updatedAt || thread?.createdAt || Date.now(),
      });
      count += 1;
    }
  }

  return { recovered: count, skipped: false };
}
