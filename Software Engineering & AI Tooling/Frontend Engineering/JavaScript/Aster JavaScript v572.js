/* Aster JavaScript v572
Buyer-safe historical derivative: recover JSON state from a primary value, a backup value, or a salvageable complete prefix.
*/
function parseJsonWithBackupAndPrefix(primaryRaw, backupRaw, fallback = []) {
  const parse = raw => {
    if (typeof raw !== "string" || !raw.trim()) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };
  const primary = parse(primaryRaw);
  if (primary != null) return { value: primary, source: "primary" };

  const backup = parse(backupRaw);
  if (backup != null) return { value: backup, source: "backup" };

  const raw = String(primaryRaw || "");
  const cut = Math.max(raw.lastIndexOf("]"), raw.lastIndexOf("}"));
  if (cut >= 0) {
    const salvaged = parse(raw.slice(0, cut + 1));
    if (salvaged != null) return { value: salvaged, source: "primary-prefix" };
  }
  return { value: fallback, source: "fallback" };
}
