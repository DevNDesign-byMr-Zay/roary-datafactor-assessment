/* Aster JavaScript v531
Buyer-safe historical derivative: merge newly discovered media from hydrated structures into an existing media store without erasing current records.
*/
async function mergeRecoveredMedia({ getStructures, listExisting, extractSources, normalize, isNoise, persist, refresh, waitMs = 2500, pollMs = 80 } = {}) {
  const started = Date.now();
  let structures = getStructures?.() || [];
  while ((!Array.isArray(structures) || !structures.length) && Date.now() - started < waitMs) {
    await new Promise(resolve => setTimeout(resolve, pollMs));
    structures = getStructures?.() || [];
  }
  if (!Array.isArray(structures) || !structures.length) return { ok: false, reason: "no-structures" };
  const existing = await Promise.resolve(listExisting?.() || []).catch(() => []);
  const known = new Set((existing || []).map(item => normalize?.(item?.src || item?.url || "") || "").filter(Boolean));
  const found = [];
  for (const structure of structures) {
    for (const raw of extractSources?.(structure) || []) {
      const source = normalize?.(raw) || raw;
      if (!source || isNoise?.(source) || known.has(source)) continue;
      known.add(source);
      found.push(source);
    }
  }
  let added = 0;
  for (let i = 0; i < found.length; i += 1) {
    try { await persist?.(found[i], { kind: "image", timestamp: Date.now() + i, recovered: true }); added += 1; } catch {}
  }
  try { await refresh?.(); } catch {}
  return { ok: true, added };
}
