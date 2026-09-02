/* Aster JavaScript v536
Buyer-safe historical derivative: restore a versioned memory snapshot into separate local, thread, and media stores with post-import recovery.
*/
async function importMemorySnapshot(input, { writeLocalState, putThread, putMedia, recoverMedia, refresh } = {}) {
  const data = typeof input === "string" ? JSON.parse(input) : input;
  if (!data || typeof data !== "object") return false;
  if (data.localState != null) {
    try { await writeLocalState?.(data.localState); } catch {}
  }
  if (Array.isArray(data.threads)) {
    for (const thread of data.threads) {
      try { if (thread?.id != null) await putThread?.(thread); } catch {}
    }
  }
  if (Array.isArray(data.media)) {
    for (const item of data.media) {
      try { if (item?.src) await putMedia?.(item); } catch {}
    }
  }
  try { await recoverMedia?.(); } catch {}
  try { await refresh?.(); } catch {}
  return true;
}
