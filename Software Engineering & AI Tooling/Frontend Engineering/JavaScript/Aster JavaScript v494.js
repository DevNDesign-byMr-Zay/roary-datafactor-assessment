/* Aster JavaScript v494
Authenticated historical derivative: map inference-step counts to human-readable quality presets.
*/
function stepsToQualityPreset(steps) {
  const value = Number(steps) || 22;
  if (value <= 17) return "fast";
  if (value <= 27) return "balanced";
  return "cinematic";
}
