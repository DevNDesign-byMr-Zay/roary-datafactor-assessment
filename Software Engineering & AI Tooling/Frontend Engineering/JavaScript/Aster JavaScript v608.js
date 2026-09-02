function finite(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Build a normalized multipart payload for parameterized image enhancement. */
export function buildImageEnhancementPayload({
  image,
  prompt = '',
  focus = '',
  backgroundSeparation = 0,
  strength = 0.3,
  guidance = 3.5,
  steps = 22,
  formData = new FormData(),
} = {}) {
  if (!image?.blob) throw new TypeError('image.blob is required.');

  formData.append('image', image.blob, image.fileName || 'image.png');

  let normalizedPrompt = String(prompt || '').trim();
  const normalizedFocus = String(focus || '').trim();
  if (normalizedFocus) {
    normalizedPrompt += `${normalizedPrompt ? '\n\n' : ''}Focus: ${normalizedFocus}`;
  }

  const separation = finite(backgroundSeparation, 0, 0, 100);
  if (separation > 0) {
    normalizedPrompt += `${normalizedPrompt ? '\n\n' : ''}Keep the main subject crisp while progressively softening the background (${Math.round(separation)}%).`;
  }

  formData.append('prompt', normalizedPrompt);
  formData.append('strength', String(finite(strength, 0.3, 0, 1)));
  formData.append('guidance_scale', String(finite(guidance, 3.5, 0, 30)));
  formData.append('num_inference_steps', String(Math.round(finite(steps, 22, 1, 200))));
  return formData;
}
