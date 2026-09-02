export function resolveComposerText({ explicitText, composer }) {
  const direct = String(explicitText ?? '').trim();
  if (direct) return direct;

  if (!composer) return '';

  const value = typeof composer.value === 'string'
    ? composer.value
    : composer.textContent;

  return String(value ?? '').trim();
}
