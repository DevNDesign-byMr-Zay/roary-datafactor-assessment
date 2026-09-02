export async function migrateLegacyThreadState({
  storage,
  migrationKey = 'mediaThreads.indexedDbMigrated.v1',
  threadKeys = [],
  mapKeys = [],
  persistThread,
  persistMapping,
}) {
  if (storage.getItem(migrationKey)) return { migrated: false, threads: 0, mappings: 0 };

  let threadCount = 0;
  let mappingCount = 0;

  for (const key of threadKeys) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') continue;

    for (const thread of Object.values(parsed)) {
      if (!thread?.id) continue;
      await persistThread(thread);
      threadCount += 1;
    }
    break;
  }

  for (const key of mapKeys) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') continue;

    for (const [sourceKey, threadId] of Object.entries(parsed)) {
      await persistMapping({ key: sourceKey, threadId });
      mappingCount += 1;
    }
    break;
  }

  storage.setItem(migrationKey, '1');
  return { migrated: true, threads: threadCount, mappings: mappingCount };
}
