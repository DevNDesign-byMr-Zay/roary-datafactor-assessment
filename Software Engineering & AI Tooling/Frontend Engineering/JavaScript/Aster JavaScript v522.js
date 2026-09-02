/* Aster JavaScript v522
Buyer-safe historical derivative: repair malformed persisted media sources in place while preserving record identity.
*/
async function repairPersistedMediaSources(records, { normalize, writeRecord, deleteBySource }) {
  const output = [];
  for (const record of Array.isArray(records) ? records : []) {
    try {
      const raw = record?.src;
      const fixed = normalize(raw);
      if (!fixed) {
        if (raw) await deleteBySource(raw).catch(() => false);
        continue;
      }
      const next = { ...record, src: fixed, repairedSrc: fixed };
      if (raw && fixed !== raw) {
        await writeRecord(next);
        await deleteBySource(raw).catch(() => false);
      }
      output.push(next);
    } catch {}
  }
  return output;
}
