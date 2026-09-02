/* Aster JavaScript v497
Authenticated historical derivative: label scale selector options with resulting pixel dimensions.
*/
function syncScaleOptionLabels(select, width, height) {
  if (!select?.options) return;
  const w = Number(width) || 0, h = Number(height) || 0;
  Array.from(select.options).forEach(option => {
    const percent = parseInt(option.value || "100", 10);
    const multiplier = Math.max(1, Math.round(percent / 100));
    if (w && h) {
      const nextW = Math.max(1, Math.round(w * percent / 100));
      const nextH = Math.max(1, Math.round(h * percent / 100));
      option.textContent = `${multiplier}x (${nextW}×${nextH})`;
    } else {
      option.textContent = `${multiplier}x`;
    }
  });
}
