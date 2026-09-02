export async function extractResponseText(result) {
  const response = await result?.response;

  if (typeof response?.text === 'function') {
    const text = String(await response.text()).trim();
    if (text) return text;
  }

  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  const candidates = response?.candidates ?? result?.candidates ?? [];
  const text = candidates
    .map((candidate) => (candidate?.content?.parts ?? [])
      .map((part) => String(part?.text ?? ''))
      .join(''))
    .join('\n')
    .trim();

  return text || '[no text returned]';
}
