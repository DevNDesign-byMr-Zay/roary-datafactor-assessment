export function hasMeaningfulDocumentText(text, {
  minimumCharacters = 40,
  rejectionMarkers = ['noextractabletext', 'imagebaseddocument'],
} = {}) {
  if (!text) return false;

  const compact = String(text).replace(/\s+/g, '');
  if (compact.length < minimumCharacters) return false;

  const normalized = compact.toLowerCase();
  return !rejectionMarkers.some((marker) => normalized.includes(marker));
}
