const MEDIA_PHRASES = [
  'show me images',
  'pull images',
  'image references',
  'image refs',
  'pictures of',
  'photos of',
  'photo references',
  'reference images',
  'image inspiration',
  'moodboard',
  'inspiration board',
  'show me videos',
  'pull videos',
  'video references',
  'video refs',
  'clips of',
  'video inspiration',
  'reel ideas',
  'short-form video ideas',
];

export function detectMediaIntent(text, phrases = MEDIA_PHRASES) {
  const query = String(text || '').toLowerCase();
  if (!query) return false;
  return phrases.some((phrase) => query.includes(String(phrase).toLowerCase()));
}
