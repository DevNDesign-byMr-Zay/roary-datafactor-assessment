export function harvestSourcesFromHtml(html, {
  baseUrl = globalThis.location?.href,
  maxSources = 20,
} = {}) {
  const input = String(html || '');
  const anchorPattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const stripTags = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const seen = new Set();
  const sources = [];

  let match;
  while ((match = anchorPattern.exec(input)) && sources.length < maxSources) {
    const rawHref = match[2].trim();
    let href = '';

    try {
      const parsed = new URL(rawHref, baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) continue;
      parsed.hash = '';
      href = parsed.href;
    } catch {
      continue;
    }

    if (seen.has(href)) continue;
    seen.add(href);

    sources.push({
      url: href,
      title: stripTags(match[3]) || href,
    });
  }

  return sources;
}
