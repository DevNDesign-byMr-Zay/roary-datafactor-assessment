export async function extractTextWithFallbacks(file, {
  extractPrimary = async () => '',
  extractLayout = async () => '',
  extractRaster = async () => '',
  isMeaningful = (text) => String(text || '').replace(/\s+/g, '').length >= 40,
  maxCharacters = 120000,
} = {}) {
  const attempts = [
    ['primary', extractPrimary],
    ['layout', extractLayout],
    ['raster', extractRaster],
  ];

  for (const [method, extractor] of attempts) {
    try {
      const text = String(await extractor(file, maxCharacters) || '')
        .trim()
        .slice(0, maxCharacters);

      if (isMeaningful(text)) {
        return { text, method };
      }
    } catch {}
  }

  return { text: '', method: null };
}
