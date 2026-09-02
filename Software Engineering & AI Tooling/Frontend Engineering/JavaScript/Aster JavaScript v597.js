export function normalizeSourceResults(results, {
  fallbackTitle = 'Untitled',
} = {}) {
  return (Array.isArray(results) ? results : [])
    .map((item) => ({
      url: item?.url || item?.link || item?.href || item?.source || '',
      title: item?.title || item?.name || item?.heading || fallbackTitle,
      snippet:
        item?.snippet ||
        item?.description ||
        item?.content ||
        item?.body ||
        item?.text ||
        '',
    }))
    .filter((item) => item.url || item.title || item.snippet);
}
