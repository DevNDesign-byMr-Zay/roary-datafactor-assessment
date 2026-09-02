/* Aster JavaScript v489
Authenticated historical derivative: stride-sampled mean over a rectangular region of a depth field.
*/
function sampleDepthMean(depth, width, height, x0, y0, x1, y1, stride = 2) {
  let sum = 0, count = 0;
  const sx0 = Math.max(0, Math.floor(x0)), sy0 = Math.max(0, Math.floor(y0));
  const sx1 = Math.min(width, Math.floor(x1)), sy1 = Math.min(height, Math.floor(y1));
  for (let y = sy0; y < sy1; y += Math.max(1, stride)) {
    const row = y * width;
    for (let x = sx0; x < sx1; x += Math.max(1, stride)) {
      sum += Number(depth[row + x] || 0);
      count += 1;
    }
  }
  return count ? sum / count : 0.5;
}
