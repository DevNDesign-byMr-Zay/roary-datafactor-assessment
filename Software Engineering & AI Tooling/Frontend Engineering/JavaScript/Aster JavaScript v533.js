/* Aster JavaScript v533
Buyer-safe historical derivative: group generated media into original-plus-variation families using a parent-source root.
*/
function groupMediaVariationsByRoot(items, { normalize = value => value } = {}) {
  const groups = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    try {
      const source = normalize(item?.repairedSrc || item?.src || "");
      const parent = normalize(item?.parentSrc || "");
      const root = parent || source;
      if (!root || /^blob:/i.test(String(root))) continue;
      if (!groups.has(root)) groups.set(root, { root, items: [], original: null });
      const group = groups.get(root);
      const next = { ...item, source, parent };
      group.items.push(next);
      if (!parent) group.original = next;
    } catch {}
  }
  return Array.from(groups.values()).sort((a, b) => {
    const ta = a.original?.timestamp ?? a.original?.ts ?? a.items[0]?.timestamp ?? a.items[0]?.ts ?? 0;
    const tb = b.original?.timestamp ?? b.original?.ts ?? b.items[0]?.timestamp ?? b.items[0]?.ts ?? 0;
    return tb - ta;
  });
}
