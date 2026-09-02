export function extractModelText(result) {
  const response = result?.response ?? result;

  if (typeof response?.text === 'function') {
    const value = response.text();
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  const candidates = response?.candidates ?? result?.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts ?? [];
    const text = parts
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();
    if (text) return text;
  }

  return '';
}
