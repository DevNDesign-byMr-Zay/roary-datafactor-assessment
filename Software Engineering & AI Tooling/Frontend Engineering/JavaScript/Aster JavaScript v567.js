/* Aster JavaScript v567
Buyer-safe historical derivative: restore a compact fallback only when the authoritative primary thread store is empty.
*/
async function restoreThreadBackupIfPrimaryEmpty({ readPrimary, putPrimary, storage = localStorage, key = "thread-backup" } = {}) {
  const primary = await Promise.resolve(readPrimary?.()).catch(() => []);
  if (Array.isArray(primary) && primary.length) return { restored: false, reason: "primary-not-empty", count: 0 };

  let backup = null;
  try { backup = JSON.parse(storage.getItem(key) || "null"); } catch {}
  const threads = Array.isArray(backup?.threads) ? backup.threads : [];
  if (!threads.length) return { restored: false, reason: "backup-empty", count: 0 };

  let count = 0;
  for (const thread of threads) {
    if (!thread || thread.id == null) continue;
    try {
      await putPrimary?.(thread);
      count += 1;
    } catch {}
  }
  return { restored: count > 0, reason: count ? "restored" : "write-failed", count };
}
