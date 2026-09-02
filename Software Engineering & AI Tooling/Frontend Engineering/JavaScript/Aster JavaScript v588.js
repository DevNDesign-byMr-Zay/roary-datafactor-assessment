export async function resolveOrCreateMediaThread({
  source,
  canonicalize,
  findMapping,
  loadThread,
  createThread,
  persistMapping,
}) {
  const key = canonicalize(source);

  if (key) {
    const mapping = await findMapping(key);
    if (mapping?.threadId) {
      const thread = await loadThread(mapping.threadId);
      if (thread) return thread;
    }
  }

  const thread = await createThread({
    createdAt: Date.now(),
    latestSource: source || '',
    images: source ? [source] : [],
    messages: [],
  });

  if (key && thread?.id) {
    await persistMapping({ key, threadId: thread.id });
  }

  return thread;
}
