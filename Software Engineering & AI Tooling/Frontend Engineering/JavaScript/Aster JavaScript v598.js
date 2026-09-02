export function buildSafeSourceViewModel(source, {
  snippetLimit = 180,
  baseUrl = globalThis.location?.href,
} = {}) {
  const rawUrl = String(source?.url || source?.link || source?.href || '').trim();
  const title = String(source?.title || source?.name || rawUrl || 'Untitled');
  const rawSnippet = String(
    source?.snippet || source?.description || source?.content || '',
  );

  let url = '';
  let host = '';

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl, baseUrl);
      if (['http:', 'https:'].includes(parsed.protocol)) {
        url = parsed.href;
        host = parsed.hostname.replace(/^www\./i, '');
      }
    } catch {}
  }

  const snippet = rawSnippet.length > snippetLimit
    ? `${rawSnippet.slice(0, Math.max(0, snippetLimit - 1))}…`
    : rawSnippet;

  return {
    url,
    host,
    title,
    snippet,
    external: Boolean(url),
    rel: url ? 'noopener noreferrer' : '',
    target: url ? '_blank' : '',
  };
}
