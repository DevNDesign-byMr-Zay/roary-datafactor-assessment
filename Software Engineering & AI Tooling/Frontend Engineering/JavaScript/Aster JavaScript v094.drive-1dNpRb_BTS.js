export function buildAsterRelightControls(state = {}) {
  const mood = String(state.mood || state.style || 'neutral').trim().toLowerCase();
  const level = Math.max(0, Math.min(1, Number(state.level ?? state.intensity ?? 0.5)));
  return {mood, level};
}
export function appendAsterRelightControls(formData, state) {
  const {mood, level} = buildAsterRelightControls(state);
  formData.set('mood', mood);
  formData.set('level', String(level));
  return formData;
}
