export function filterMediaByQuery(items, query, {
  minimumKeywordLength = 4,
  fields = ['title', 'source', 'channel', 'description'],
} = {}) {
  const keywords = String(query || '')
    .toLowerCase()
    .split(/\s+/)
    .map((value) => value.trim())
    .filter((value) => value.length >= minimumKeywordLength);

  if (!keywords.length) return Array.isArray(items) ? [...items] : [];

  const input = Array.isArray(items) ? items : [];
  const filtered = input.filter((item) => {
    const haystack = fields
      .map((field) => item?.[field] || '')
      .join(' ')
      .toLowerCase();

    return keywords.some((keyword) => haystack.includes(keyword));
  });

  return filtered.length ? filtered : [...input];
}
